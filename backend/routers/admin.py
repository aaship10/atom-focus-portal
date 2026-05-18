from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, func, and_, update
from sqlalchemy.orm import joinedload
from typing import List, Optional
import datetime
import io
import csv
from database import get_db
from models import User, Role, Goal, GoalAchievement, GoalCheckin, Cycle, GoalAuditLog, EscalationLog, ThrustArea
from security import get_current_user
from pydantic import BaseModel, EmailStr
from decimal import Decimal

router = APIRouter(prefix="/api/admin", tags=["admin"])

# --- Security Dependency ---
async def check_admin_role(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation not permitted. Admin/HR role required."
        )
    return current_user

# --- Pydantic Schemas ---
class CycleCreate(BaseModel):
    quarter: str
    year: int
    goal_setting_start: Optional[datetime.datetime] = None
    goal_setting_end: Optional[datetime.datetime] = None
    checkin_start: Optional[datetime.datetime] = None
    checkin_end: Optional[datetime.datetime] = None

class CycleUpdate(BaseModel):
    quarter: Optional[str] = None
    year: Optional[int] = None
    status: Optional[str] = None
    goal_setting_start: Optional[datetime.datetime] = None
    goal_setting_end: Optional[datetime.datetime] = None
    checkin_start: Optional[datetime.datetime] = None
    checkin_end: Optional[datetime.datetime] = None

class UserHierarchyUpdate(BaseModel):
    manager_id: Optional[int] = None
    role_id: Optional[int] = None
    department: Optional[str] = None

# --- 1. Cycle Management ---

@router.get("/cycles")
async def get_cycles(
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(check_admin_role)
):
    result = await db.execute(select(Cycle).order_by(Cycle.year.desc(), Cycle.quarter.desc()))
    return result.scalars().all()

@router.post("/cycles")
async def create_cycle(
    cycle_in: CycleCreate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(check_admin_role)
):
    # Deactivate others if this is created as active (though default is Active)
    new_cycle = Cycle(
        quarter=cycle_in.quarter,
        year=cycle_in.year,
        status="Active",
        goal_setting_start=cycle_in.goal_setting_start,
        goal_setting_end=cycle_in.goal_setting_end,
        checkin_start=cycle_in.checkin_start,
        checkin_end=cycle_in.checkin_end
    )
    db.add(new_cycle)
    try:
        await db.commit()
        await db.refresh(new_cycle)
        return new_cycle
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/cycles/{cycle_id}")
async def update_cycle(
    cycle_id: int,
    cycle_in: CycleUpdate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(check_admin_role)
):
    cycle = await db.get(Cycle, cycle_id)
    if not cycle:
        raise HTTPException(status_code=404, detail="Cycle not found")
        
    if cycle_in.quarter is not None:
        cycle.quarter = cycle_in.quarter
    if cycle_in.year is not None:
        cycle.year = cycle_in.year
    if cycle_in.status is not None:
        cycle.status = cycle_in.status
    if cycle_in.goal_setting_start is not None:
        cycle.goal_setting_start = cycle_in.goal_setting_start
    if cycle_in.goal_setting_end is not None:
        cycle.goal_setting_end = cycle_in.goal_setting_end
    if cycle_in.checkin_start is not None:
        cycle.checkin_start = cycle_in.checkin_start
    if cycle_in.checkin_end is not None:
        cycle.checkin_end = cycle_in.checkin_end
        
    try:
        await db.commit()
        await db.refresh(cycle)
        return cycle
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cycles/{cycle_id}/activate")
async def activate_cycle(
    cycle_id: int,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(check_admin_role)
):
    cycle = await db.get(Cycle, cycle_id)
    if not cycle:
        raise HTTPException(status_code=404, detail="Cycle not found")
        
    # Deactivate all other cycles
    await db.execute(update(Cycle).values(status="Closed"))
    
    # Activate this one
    cycle.status = "Active"
    
    try:
        await db.commit()
        await db.refresh(cycle)
        return {"success": True, "message": f"Cycle {cycle.quarter} {cycle.year} activated successfully."}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# --- 2. Organizational Hierarchy ---

@router.get("/users")
async def get_all_users_for_hierarchy(
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(check_admin_role)
):
    # Retrieve all users along with their role and manager details
    result = await db.execute(
        select(User)
        .options(joinedload(User.role), joinedload(User.manager))
        .order_by(User.name.asc())
    )
    users = result.unique().scalars().all()
    
    return [{
        "id": u.id,
        "name": u.name,
        "email": u.email,
        "role": u.role.name if u.role else "None",
        "role_id": u.role_id,
        "manager_id": u.manager_id,
        "manager_name": u.manager.name if u.manager else "None",
        "department": u.department or "Engineering"
    } for u in users]

@router.put("/users/{user_id}/hierarchy")
async def update_user_hierarchy(
    user_id: int,
    payload: UserHierarchyUpdate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(check_admin_role)
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Prevent self-assignment as manager
    if payload.manager_id == user_id:
        raise HTTPException(status_code=400, detail="A user cannot report to themselves.")
        
    if payload.manager_id is not None:
        if payload.manager_id == -1: # Support clearing manager
            user.manager_id = None
        else:
            mgr = await db.get(User, payload.manager_id)
            if not mgr:
                raise HTTPException(status_code=400, detail="Selected manager does not exist.")
            user.manager_id = payload.manager_id
            
    if payload.role_id is not None:
        role = await db.get(Role, payload.role_id)
        if not role:
            raise HTTPException(status_code=400, detail="Selected role does not exist.")
        user.role_id = payload.role_id
        
    if payload.department is not None:
        user.department = payload.department
        
    try:
        await db.commit()
        return {"success": True, "message": f"Hierarchy updated successfully for user {user.name}."}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/roles")
async def get_roles(
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(check_admin_role)
):
    result = await db.execute(select(Role))
    return result.scalars().all()

# --- 3. Exception Handling & Goal Unlocking ---

@router.post("/goals/{goal_id}/unlock")
async def unlock_goal(
    goal_id: int,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(check_admin_role)
):
    goal = await db.get(Goal, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
        
    if not goal.locked:
        return {"success": True, "message": "Goal is already unlocked."}
        
    goal.locked = False
    
    # Log in system audit trails
    audit = GoalAuditLog(
        goal_id=goal_id,
        user_id=admin["id"],
        action="Unlock Goal",
        details=f"HR/Admin '{admin['name']}' manually unlocked this goal sheet.",
        previous_value="locked: True",
        new_value="locked: False"
    )
    db.add(audit)
    
    try:
        await db.commit()
        return {"success": True, "message": f"Goal '{goal.title}' has been successfully unlocked."}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/goals/{goal_id}/lock")
async def lock_goal_manually(
    goal_id: int,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(check_admin_role)
):
    goal = await db.get(Goal, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
        
    if goal.locked:
        return {"success": True, "message": "Goal is already locked."}
        
    goal.locked = True
    
    # Log in system audit trails
    audit = GoalAuditLog(
        goal_id=goal_id,
        user_id=admin["id"],
        action="Lock Goal",
        details=f"HR/Admin '{admin['name']}' manually locked this goal sheet.",
        previous_value="locked: False",
        new_value="locked: True"
    )
    db.add(audit)
    
    try:
        await db.commit()
        return {"success": True, "message": f"Goal '{goal.title}' has been successfully locked."}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# --- 4. System Audit Logs ---

@router.get("/audit-logs")
async def get_audit_logs(
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(check_admin_role)
):
    result = await db.execute(
        select(GoalAuditLog)
        .options(joinedload(GoalAuditLog.user), joinedload(GoalAuditLog.goal))
        .order_by(GoalAuditLog.timestamp.desc())
    )
    logs = result.unique().scalars().all()
    
    return [{
        "id": l.id,
        "goal_id": l.goal_id,
        "goal_title": l.goal.title if l.goal else "Deleted/General",
        "user_name": l.user.name if l.user else "System",
        "action": l.action,
        "details": l.details,
        "previous_value": l.previous_value,
        "new_value": l.new_value,
        "timestamp": l.timestamp
    } for l in logs]

# --- 5. Reporting & Governance Requirements ---

@router.get("/completion-dashboard")
async def get_completion_dashboard(
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(check_admin_role)
):
    # Total Users and breakdown
    emp_role_result = await db.execute(select(Role).where(Role.name == "Employee"))
    emp_role = emp_role_result.scalar_one_or_none()
    
    mgr_role_result = await db.execute(select(Role).where(Role.name == "Manager"))
    mgr_role = mgr_role_result.scalar_one_or_none()
    
    total_employees = 0
    if emp_role:
        total_emp_res = await db.execute(select(func.count(User.id)).where(User.role_id == emp_role.id))
        total_employees = total_emp_res.scalar() or 0
        
    total_managers = 0
    if mgr_role:
        total_mgr_res = await db.execute(select(func.count(User.id)).where(User.role_id == mgr_role.id))
        total_managers = total_mgr_res.scalar() or 0
        
    # Get all employees with their goals and achievements
    result = await db.execute(
        select(User)
        .options(
            joinedload(User.manager),
            joinedload(User.goals).options(joinedload(Goal.achievements), joinedload(Goal.checkins))
        )
        .where(User.role_id == emp_role.id if emp_role else User.id > 0)
    )
    employees = result.unique().scalars().all()
    
    detailed_reports = []
    completed_goal_setting = 0
    completed_quarterly_checkins = 0
    
    for emp in employees:
        total_goals = len(emp.goals)
        locked_goals = sum(1 for g in emp.goals if g.locked)
        submitted = any(g.status in ["Pending", "Approved"] for g in emp.goals)
        approved = all(g.status == "Approved" for g in emp.goals) if emp.goals else False
        
        # Check-in quarters completed
        q1_done = q2_done = q3_done = q4_done = False
        if emp.goals:
            q1_done = all(any(a.quarter == "Q1" for a in g.achievements) for g in emp.goals)
            q2_done = all(any(a.quarter == "Q2" for a in g.achievements) for g in emp.goals)
            q3_done = all(any(a.quarter == "Q3" for a in g.achievements) for g in emp.goals)
            q4_done = all(any(a.quarter == "Q4" for a in g.achievements) for g in emp.goals)
            
        # Count as completed checkin if at least Q1 achievement logged on all goals
        if emp.goals and (q1_done or q2_done or q3_done or q4_done):
            completed_quarterly_checkins += 1
            
        if emp.goals and locked_goals == total_goals:
            completed_goal_setting += 1
            
        detailed_reports.append({
            "employee_id": emp.id,
            "name": emp.name,
            "email": emp.email,
            "department": emp.department or "Engineering",
            "manager_name": emp.manager.name if emp.manager else "None",
            "total_goals": total_goals,
            "locked_goals": locked_goals,
            "submitted": "Submitted" if submitted else "Draft",
            "approved": "Approved" if approved else "Incomplete",
            "checkin_status": {
                "Q1": "Completed" if q1_done else "Pending",
                "Q2": "Completed" if q2_done else "Pending",
                "Q3": "Completed" if q3_done else "Pending",
                "Q4": "Completed" if q4_done else "Pending",
            }
        })
        
    goal_setting_rate = round((completed_goal_setting / total_employees * 100) if total_employees > 0 else 0.0, 1)
    checkin_rate = round((completed_quarterly_checkins / total_employees * 100) if total_employees > 0 else 0.0, 1)
    
    return {
        "summary": {
            "total_employees": total_employees,
            "total_managers": total_managers,
            "completed_goal_setting": completed_goal_setting,
            "goal_setting_rate": goal_setting_rate,
            "completed_quarterly_checkins": completed_quarterly_checkins,
            "checkin_rate": checkin_rate
        },
        "reports": detailed_reports
    }

@router.get("/achievement-reports")
async def get_achievement_reports(
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(check_admin_role)
):
    # Eagerly load owners, managers, thrust areas, achievements
    result = await db.execute(
        select(Goal)
        .options(
            joinedload(Goal.owner).joinedload(User.manager),
            joinedload(Goal.thrust_area),
            joinedload(Goal.achievements)
        )
    )
    goals = result.unique().scalars().all()
    
    reports = []
    for g in goals:
        owner_name = g.owner.name if g.owner else "N/A"
        owner_email = g.owner.email if g.owner else "N/A"
        dept = g.owner.department if g.owner else "N/A"
        mgr_name = g.owner.manager.name if (g.owner and g.owner.manager) else "N/A"
        ta_name = g.thrust_area.name if g.thrust_area else "N/A"
        
        ach_map = {a.quarter: a.actual_value for a in g.achievements}
        
        # Calculate progress
        latest_actual = 0.0
        for q in ["Q4", "Q3", "Q2", "Q1"]:
            if q in ach_map:
                latest_actual = float(ach_map[q])
                break
                
        progress = 0.0
        if g.target and g.target > 0:
            progress = (latest_actual / float(g.target)) * 100
            progress = min(progress, 100.0)
            
        reports.append({
            "goal_id": g.id,
            "employee_name": owner_name,
            "employee_email": owner_email,
            "department": dept,
            "manager_name": mgr_name,
            "thrust_area": ta_name,
            "title": g.title,
            "uom": g.uom,
            "weight": g.weight,
            "target": float(g.target),
            "q1_actual": float(ach_map.get("Q1", 0.0)),
            "q2_actual": float(ach_map.get("Q2", 0.0)),
            "q3_actual": float(ach_map.get("Q3", 0.0)),
            "q4_actual": float(ach_map.get("Q4", 0.0)),
            "progress": round(progress, 1),
            "status": g.status,
            "locked": g.locked
        })
        
    return reports

@router.get("/achievement-reports/export")
async def export_achievement_reports(
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(check_admin_role)
):
    result = await db.execute(
        select(Goal)
        .options(
            joinedload(Goal.owner).joinedload(User.manager),
            joinedload(Goal.thrust_area),
            joinedload(Goal.achievements)
        )
    )
    goals = result.unique().scalars().all()
    
    # Generate CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        "Goal ID", "Employee Name", "Employee Email", "Department", "Manager Name", 
        "Thrust Area", "Goal Title", "Description", "UOM", "Weight (%)", "Planned Target", 
        "Q1 Actual", "Q2 Actual", "Q3 Actual", "Q4 Actual", "Overall Progress (%)", "Status", "Locked"
    ])
    
    for g in goals:
        owner_name = g.owner.name if g.owner else "N/A"
        owner_email = g.owner.email if g.owner else "N/A"
        dept = g.owner.department if g.owner else "N/A"
        mgr_name = g.owner.manager.name if (g.owner and g.owner.manager) else "N/A"
        ta_name = g.thrust_area.name if g.thrust_area else "N/A"
        
        ach_map = {a.quarter: a.actual_value for a in g.achievements}
        q1 = ach_map.get("Q1", "")
        q2 = ach_map.get("Q2", "")
        q3 = ach_map.get("Q3", "")
        q4 = ach_map.get("Q4", "")
        
        latest_actual = 0
        for q in ["Q4", "Q3", "Q2", "Q1"]:
            if q in ach_map:
                latest_actual = ach_map[q]
                break
        
        progress = 0.0
        if g.target and g.target > 0:
            progress = float((Decimal(latest_actual) / g.target) * 100)
            progress = min(progress, 100.0)
            
        writer.writerow([
            g.id, owner_name, owner_email, dept, mgr_name, 
            ta_name, g.title, g.description or "", g.uom, g.weight, g.target, 
            q1, q2, q3, q4, round(progress, 2), g.status, "Yes" if g.locked else "No"
        ])
        
    output.seek(0)
    
    headers = {
        'Content-Disposition': 'attachment; filename="achievement_report.csv"',
        'Content-Type': 'text/csv'
    }
    
    return StreamingResponse(iter([output.getvalue()]), headers=headers)

# --- 6. Escalation Tracking ---

@router.get("/escalations")
async def get_escalations(
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(check_admin_role)
):
    result = await db.execute(
        select(EscalationLog)
        .options(joinedload(EscalationLog.user), joinedload(EscalationLog.manager))
        .order_by(EscalationLog.resolved.asc(), EscalationLog.timestamp.desc())
    )
    escalations = result.unique().scalars().all()
    
    return [{
        "id": esc.id,
        "employee_name": esc.user.name if esc.user else "N/A",
        "manager_name": esc.manager.name if esc.manager else "N/A",
        "type": esc.type,
        "details": esc.details,
        "resolved": esc.resolved,
        "timestamp": esc.timestamp
    } for esc in escalations]

@router.post("/escalations/generate")
async def generate_escalation_alerts(
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(check_admin_role)
):
    # Scan the system and automatically generate escalations
    generated_count = 0
    
    # Fetch employee role
    role_result = await db.execute(select(Role).where(Role.name == "Employee"))
    employee_role = role_result.scalar_one_or_none()
    
    if employee_role:
        # 1. Missed Goal Submission (Employees with 0 goals or goals only in Draft status)
        employees_result = await db.execute(
            select(User)
            .options(joinedload(User.goals))
            .where(User.role_id == employee_role.id)
        )
        employees = employees_result.unique().scalars().all()
        
        for emp in employees:
            draft_only = all(g.status == "Draft" for g in emp.goals)
            if not emp.goals or draft_only:
                # Check if escalation already exists for this employee and type
                existing = await db.execute(
                    select(EscalationLog).where(
                        EscalationLog.user_id == emp.id,
                        EscalationLog.type == "Missed Goal Submission",
                        EscalationLog.resolved == False
                    )
                )
                if not existing.scalar_one_or_none():
                    esc = EscalationLog(
                        user_id=emp.id,
                        manager_id=emp.manager_id,
                        type="Missed Goal Submission",
                        details=f"Employee '{emp.name}' has not submitted any goals for approval (0 goals or only drafts)."
                    )
                    db.add(esc)
                    generated_count += 1

    # 2. Missed Manager Approval (Goals that are 'Pending' for more than 3 days)
    pending_goals_result = await db.execute(
        select(Goal)
        .options(joinedload(Goal.owner))
        .where(Goal.status == "Pending")
    )
    pending_goals = pending_goals_result.unique().scalars().all()
    for goal in pending_goals:
        # Check if pending for more than 3 days
        if goal.updated_at and (datetime.datetime.utcnow() - goal.updated_at).days >= 3:
            if goal.owner and goal.owner.manager_id:
                # Check if escalation already exists
                existing = await db.execute(
                    select(EscalationLog).where(
                        EscalationLog.user_id == goal.owner_id,
                        EscalationLog.type == "Missed Manager Approval",
                        EscalationLog.resolved == False
                    )
                )
                if not existing.scalar_one_or_none():
                    esc = EscalationLog(
                        user_id=goal.owner_id,
                        manager_id=goal.owner.manager_id,
                        type="Missed Manager Approval",
                        details=f"Manager has not approved goal '{goal.title}' for employee '{goal.owner.name}'. Goal pending since {goal.updated_at.strftime('%Y-%m-%d')}."
                    )
                    db.add(esc)
                    generated_count += 1

    # 3. Missed Quarterly Check-in (Goals that are Approved/Locked but have no check-in comment for Q1)
    approved_goals_result = await db.execute(
        select(Goal)
        .options(joinedload(Goal.owner), joinedload(Goal.checkins))
        .where(Goal.status == "Approved")
    )
    approved_goals = approved_goals_result.unique().scalars().all()
    for goal in approved_goals:
        has_q1_checkin = any(c.quarter == "Q1" for c in goal.checkins)
        if not has_q1_checkin and goal.owner and goal.owner.manager_id:
            existing = await db.execute(
                select(EscalationLog).where(
                    EscalationLog.user_id == goal.owner_id,
                    EscalationLog.type == "Missed Quarterly Check-in",
                    EscalationLog.details.like("%Q1%"),
                    EscalationLog.resolved == False
                )
            )
            if not existing.scalar_one_or_none():
                esc = EscalationLog(
                    user_id=goal.owner_id,
                    manager_id=goal.owner.manager_id,
                    type="Missed Quarterly Check-in",
                    details=f"Quarterly check-in Q1 missed for employee '{goal.owner.name}' on goal '{goal.title}'."
                )
                db.add(esc)
                generated_count += 1

    try:
        await db.commit()
        return {"success": True, "message": f"Scanned system successfully. Generated {generated_count} new escalations."}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/escalations/{escalation_id}/resolve")
async def resolve_escalation(
    escalation_id: int,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(check_admin_role)
):
    esc = await db.get(EscalationLog, escalation_id)
    if not esc:
        raise HTTPException(status_code=404, detail="Escalation not found")
        
    esc.resolved = True
    try:
        await db.commit()
        return {"success": True, "message": "Escalation marked as resolved successfully."}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# --- 7. Analytics Module ---

@router.get("/analytics")
async def get_analytics(
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(check_admin_role)
):
    # Fetch all goals, achievements, and owners
    goals_res = await db.execute(
        select(Goal)
        .options(joinedload(Goal.achievements), joinedload(Goal.thrust_area), joinedload(Goal.owner))
    )
    goals = goals_res.unique().scalars().all()
    
    # 1. Thrust Area Distribution & Average Progress
    ta_stats = {}
    
    # Seed default thrust areas in case
    ta_res = await db.execute(select(ThrustArea))
    all_tas = ta_res.scalars().all()
    for ta in all_tas:
        ta_stats[ta.name] = {"count": 0, "total_progress": 0.0, "avg_progress": 0.0}
        
    # Progress Heatmap brackets
    heatmap = {"0-25%": 0, "26-50%": 0, "51-75%": 0, "76-100%": 0}
    
    # QoQ Achievement sums/averages
    qoq = {
        "Q1": {"sum": 0.0, "count": 0},
        "Q2": {"sum": 0.0, "count": 0},
        "Q3": {"sum": 0.0, "count": 0},
        "Q4": {"sum": 0.0, "count": 0}
    }
    
    for g in goals:
        # achievements map
        ach_map = {a.quarter: float(a.actual_value) for a in g.achievements}
        for q, val in ach_map.items():
            if q in qoq:
                qoq[q]["sum"] += val
                qoq[q]["count"] += 1
                
        # calculate overall progress based on latest achievement
        latest_actual = 0.0
        for q in ["Q4", "Q3", "Q2", "Q1"]:
            if q in ach_map:
                latest_actual = ach_map[q]
                break
                
        progress = 0.0
        if g.target and g.target > 0:
            progress = (latest_actual / float(g.target)) * 100
            progress = min(progress, 100.0)
            
        # Add to Heatmap
        if progress <= 25.0:
            heatmap["0-25%"] += 1
        elif progress <= 50.0:
            heatmap["26-50%"] += 1
        elif progress <= 75.0:
            heatmap["51-75%"] += 1
        else:
            heatmap["76-100%"] += 1
            
        # Add to Thrust Area stats
        ta_name = g.thrust_area.name if g.thrust_area else "General"
        if ta_name not in ta_stats:
            ta_stats[ta_name] = {"count": 0, "total_progress": 0.0, "avg_progress": 0.0}
        ta_stats[ta_name]["count"] += 1
        ta_stats[ta_name]["total_progress"] += progress

    # Compute averages for Thrust Area
    for ta_name, stat in ta_stats.items():
        if stat["count"] > 0:
            stat["avg_progress"] = round(stat["total_progress"] / stat["count"], 1)
        del stat["total_progress"] # Hide intermediate sum
        
    # Compute QoQ progress trends (average actuals per quarter)
    qoq_trends = []
    for q in ["Q1", "Q2", "Q3", "Q4"]:
        count = qoq[q]["count"]
        avg = round(qoq[q]["sum"] / count, 1) if count > 0 else 0.0
        qoq_trends.append({"quarter": q, "average_achievement": avg, "count": count})
        
    # 2. Manager Effectiveness Dashboard
    # Fetch managers
    mgr_role_result = await db.execute(select(Role).where(Role.name == "Manager"))
    mgr_role = mgr_role_result.scalar_one_or_none()
    
    manager_effectiveness = []
    if mgr_role:
        managers_res = await db.execute(
            select(User)
            .options(joinedload(User.direct_reports).joinedload(User.goals).joinedload(Goal.checkins))
            .where(User.role_id == mgr_role.id)
        )
        managers = managers_res.unique().scalars().all()
        
        for mgr in managers:
            total_reports = len(mgr.direct_reports)
            total_report_goals = sum(len(rep.goals) for rep in mgr.direct_reports)
            
            # Approvals and checkins completed by this manager
            approved_count = sum(sum(1 for g in rep.goals if g.status == "Approved") for rep in mgr.direct_reports)
            total_checkins_count = sum(sum(len(g.checkins) for g in rep.goals) for rep in mgr.direct_reports)
            
            effectiveness_score = 0.0
            if total_report_goals > 0:
                # Weighted rate of checkins and approvals
                effectiveness_score = ((approved_count / total_report_goals) * 50.0) + (min(total_checkins_count / (total_report_goals or 1), 1.0) * 50.0)
                
            manager_effectiveness.append({
                "manager_id": mgr.id,
                "name": mgr.name,
                "department": mgr.department or "Engineering",
                "direct_reports_count": total_reports,
                "approval_rate": round((approved_count / total_report_goals * 100) if total_report_goals > 0 else 0.0, 1),
                "checkins_completed": total_checkins_count,
                "effectiveness_score": round(effectiveness_score, 1)
            })

    return {
        "thrust_area_distribution": [{"thrust_area": k, "count": v["count"], "avg_progress": v["avg_progress"]} for k, v in ta_stats.items()],
        "progress_heatmap": [{"range": k, "count": v} for k, v in heatmap.items()],
        "qoq_trends": qoq_trends,
        "manager_effectiveness": manager_effectiveness
    }
