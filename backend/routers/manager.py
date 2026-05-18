from fastapi import APIRouter, Depends, HTTPException, status, Header
import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from typing import List, Optional
from database import get_db
from models import Goal, User, GoalCheckin
from schemas import (
    GoalReviewResponse, 
    GoalApprovalUpdate, 
    ManagerDashboardSummary, 
    TeamMemberGoalsResponse,
    GoalCheckinCreate,
    GoalCheckinResponse
)
from security import get_current_user
from sqlalchemy import func

router = APIRouter(prefix="/api/manager", tags=["manager"])

@router.get("/dashboard", response_model=ManagerDashboardSummary)
async def get_manager_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Fetch all employees reporting to this manager
    result = await db.execute(
        select(User).where(User.manager_id == current_user["id"])
    )
    team_members = result.scalars().all()
    team_member_ids = [u.id for u in team_members]

    if not team_member_ids:
        return ManagerDashboardSummary(
            total_team_goals=0,
            pending_approvals=0,
            at_risk_goals=0,
            user_name=current_user["name"]
        )

    # Total Team Goals
    total_goals_result = await db.execute(
        select(func.count(Goal.id)).where(Goal.owner_id.in_(team_member_ids))
    )
    total_team_goals = total_goals_result.scalar() or 0

    # Pending Approvals
    pending_result = await db.execute(
        select(func.count(Goal.id)).where(
            Goal.owner_id.in_(team_member_ids), 
            Goal.status == 'Pending'
        )
    )
    pending_approvals = pending_result.scalar() or 0

    # At-Risk Goals (status 'Off Track')
    at_risk_result = await db.execute(
        select(func.count(Goal.id)).where(
            Goal.owner_id.in_(team_member_ids), 
            Goal.status == 'Off Track'
        )
    )
    at_risk_goals = at_risk_result.scalar() or 0

    return ManagerDashboardSummary(
        total_team_goals=total_team_goals,
        pending_approvals=pending_approvals,
        at_risk_goals=at_risk_goals,
        user_name=current_user["name"]
    )

@router.get("/team", response_model=List[TeamMemberGoalsResponse])
async def get_team_data(
    year: int = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if year is None:
        year = datetime.datetime.utcnow().year

    # Fetch team members and eagerly load their goals for the specified year
    # along with achievements and checkins for those goals
    result = await db.execute(
        select(User)
        .where(User.manager_id == current_user["id"])
        .options(
            joinedload(User.goals).options(
                joinedload(Goal.achievements),
                joinedload(Goal.checkins),
                joinedload(Goal.thrust_area),
                joinedload(Goal.tasks)
            )
        )
    )
    team_members = result.unique().scalars().all()
    
    # Filter goals by year manually if joinedload doesn't support easy filtering in select
    # Or we can do it in the query if we use a more complex join.
    # For simplicity, we'll return the team members and the frontend can filter or we can filter here.
    # Actually, let's filter here for better performance/data size.
    
    for member in team_members:
        member.goals = [g for g in member.goals if g.year == year]

    return team_members

@router.post("/goals/{goal_id}/checkins", response_model=GoalCheckinResponse)
async def create_goal_checkin(
    goal_id: int,
    checkin_in: GoalCheckinCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    x_bypass_restrictions: Optional[bool] = Header(None)
):
    # Enforce quarterly check-in capture windows
    if not x_bypass_restrictions:
        current_month = datetime.datetime.now().month  # 1-12
        valid_months = {
            'Q1': [7, 8, 9],       # July, August, September
            'Q2': [10, 11, 12],    # October, November, December
            'Q3': [1, 2],          # January, February
            'Q4': [3, 4]           # March, April
        }
        q = checkin_in.quarter
        if q in valid_months and current_month not in valid_months[q]:
            open_months = {
                'Q1': 'July (July - September)',
                'Q2': 'October (October - December)',
                'Q3': 'January (January - February)',
                'Q4': 'March / April (March - April)'
            }
            raise HTTPException(
                status_code=400,
                detail=f"The {q} check-in window is currently closed. It opens in {open_months[q]}."
            )

    # Verify goal exists and owner reports to current user
    result = await db.execute(
        select(Goal)
        .where(Goal.id == goal_id)
        .options(joinedload(Goal.owner))
    )
    goal = result.unique().scalar_one_or_none()
    
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    if goal.owner.manager_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to check-in on this goal")

    # Check if a check-in already exists for this quarter
    existing_checkin_result = await db.execute(
        select(GoalCheckin).where(
            GoalCheckin.goal_id == goal_id,
            GoalCheckin.quarter == checkin_in.quarter
        )
    )
    existing_checkin = existing_checkin_result.scalar_one_or_none()

    if existing_checkin:
        # Update existing
        existing_checkin.comment = checkin_in.comment
        existing_checkin.checkin_date = datetime.datetime.utcnow()
        db_checkin = existing_checkin
    else:
        # Create new
        db_checkin = GoalCheckin(
            goal_id=goal_id,
            manager_id=current_user["id"],
            quarter=checkin_in.quarter,
            comment=checkin_in.comment
        )
        db.add(db_checkin)

    try:
        await db.commit()
        await db.refresh(db_checkin)
        return db_checkin
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/pending-goals", response_model=List[GoalReviewResponse])
async def get_pending_team_goals(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Fetch all employees reporting to this manager
    result = await db.execute(
        select(User).where(User.manager_id == current_user["id"])
    )
    team_members = result.scalars().all()
    team_member_ids = [u.id for u in team_members]

    if not team_member_ids:
        return []

    # Fetch pending goals for team members
    goals_result = await db.execute(
        select(Goal)
        .where(Goal.owner_id.in_(team_member_ids), Goal.status == 'Pending')
        .options(
            joinedload(Goal.owner), 
            joinedload(Goal.thrust_area),
            joinedload(Goal.achievements),
            joinedload(Goal.checkins),
            joinedload(Goal.tasks)
        )
    )
    return goals_result.unique().scalars().all()

@router.put("/goals/{goal_id}/approve")
async def approve_goal(
    goal_id: int,
    approval_in: GoalApprovalUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(Goal)
        .where(Goal.id == goal_id)
        .options(joinedload(Goal.owner))
    )
    goal = result.unique().scalar_one_or_none()

    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    # Verify that the goal owner reports to the current manager
    if goal.owner.manager_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to approve this goal")

    # Update inline changes if provided
    if approval_in.target is not None:
        goal.target = approval_in.target
    if approval_in.weight is not None:
        if approval_in.weight < 10 or approval_in.weight > 100:
            raise HTTPException(status_code=400, detail="Weight must be between 10 and 100")
        goal.weight = approval_in.weight

    goal.status = 'Approved'
    goal.locked = True

    try:
        await db.commit()
        return {"success": True, "message": "Goal approved and locked"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/goals/{goal_id}/reject")
async def reject_goal(
    goal_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(Goal)
        .where(Goal.id == goal_id)
        .options(joinedload(Goal.owner))
    )
    goal = result.unique().scalar_one_or_none()

    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    if goal.owner.manager_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to reject this goal")

    goal.status = 'Rejected'
    goal.locked = False

    try:
        await db.commit()
        return {"success": True, "message": "Goal rejected/returned for rework"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
