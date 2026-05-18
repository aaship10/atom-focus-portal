from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from typing import List, Optional
from database import get_db
from models import SharedKPI, Goal, User, Role
from schemas import SharedKPICreate, SharedKPIResponse, GoalResponse
from security import get_current_user
from decimal import Decimal
import datetime

router = APIRouter(prefix="/api/shared-kpis", tags=["shared-kpis"])

@router.post("/", response_model=SharedKPIResponse, status_code=status.HTTP_201_CREATED)
async def create_shared_kpi(
    payload: SharedKPICreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Enforce role: Manager or Admin only
    user_role_result = await db.execute(
        select(Role).join(User).where(User.id == current_user["id"])
    )
    user_role = user_role_result.scalar_one_or_none()
    if user_role and user_role.name not in ["Manager", "Admin"]:
        raise HTTPException(
            status_code=403,
            detail="Only managers and admins can create and assign shared KPIs."
        )

    # 1. Create the Shared KPI definition
    new_kpi = SharedKPI(
        title=payload.title,
        description=payload.description,
        target=payload.target,
        uom=payload.uom,
        timeline=payload.timeline,
        department=payload.department,
        created_by=current_user["id"],
        current_achievement=Decimal("0.0")
    )
    db.add(new_kpi)
    await db.flush() # Populate new_kpi.id

    # 2. Find employees to assign
    target_employees = []
    if payload.assigned_employee_ids:
        # Assign to selected employees
        emp_result = await db.execute(
            select(User).where(User.id.in_(payload.assigned_employee_ids))
        )
        target_employees = emp_result.scalars().all()
    else:
        # Assign by department
        emp_role_result = await db.execute(select(Role).where(Role.name == "Employee"))
        emp_role = emp_role_result.scalar_one_or_none()
        emp_role_id = emp_role.id if emp_role else None
        
        emp_query = select(User).where(User.department == payload.department)
        if emp_role_id:
            emp_query = emp_query.where(User.role_id == emp_role_id)
            
        emp_result = await db.execute(emp_query)
        target_employees = emp_result.scalars().all()

    # 3. Create individualized Goal record for each employee referencing the shared KPI
    # Parse timeline to get a numeric year representation
    current_year = datetime.datetime.utcnow().year
    try:
        # Simple extraction of year if the timeline contains digits
        year_digits = "".join([c for c in payload.timeline if c.isdigit()])
        year_val = int(year_digits) if len(year_digits) >= 4 else current_year
    except Exception:
        year_val = current_year

    for employee in target_employees:
        # Check if the employee already has a goal linked to this shared KPI to prevent duplicates
        dup_check = await db.execute(
            select(Goal).where(Goal.owner_id == employee.id, Goal.shared_kpi_id == new_kpi.id)
        )
        if dup_check.scalar_one_or_none():
            continue

        weight_val = payload.default_weight if (payload.default_weight and payload.default_weight >= 10) else 10
        
        emp_goal = Goal(
            owner_id=employee.id,
            shared_kpi_id=new_kpi.id,
            thrust_area_id=None, # Shared goals don't strictly require thrust area initially
            title=payload.title,
            description=payload.description,
            target=payload.target,
            weight=weight_val,
            uom=payload.uom,
            year=year_val,
            status="Approved", # Pushed goals are pre-approved
            locked=True, # Read-only core fields
            personal_notes=""
        )
        db.add(emp_goal)

    try:
        await db.commit()
        await db.refresh(new_kpi)
        return new_kpi
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[SharedKPIResponse])
async def list_shared_kpis(
    department: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    query = select(SharedKPI)
    if department:
        query = query.where(SharedKPI.department == department)
    else:
        # Managers can see their created KPIs, employees can see KPIs for their department
        user_info = await db.get(User, current_user["id"])
        if user_info and user_info.department:
            query = query.where(
                (SharedKPI.created_by == current_user["id"]) | 
                (SharedKPI.department == user_info.department)
            )
            
    result = await db.execute(query.order_by(SharedKPI.created_at.desc()))
    return result.scalars().all()

@router.put("/{kpi_id}/achievement", response_model=SharedKPIResponse)
async def update_shared_kpi_achievement(
    kpi_id: int,
    achievement: Decimal,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    kpi = await db.get(SharedKPI, kpi_id)
    if not kpi:
        raise HTTPException(status_code=404, detail="Shared KPI not found")
        
    # Verify manager owns or is authorized
    if kpi.created_by != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this Shared KPI.")
        
    kpi.current_achievement = achievement
    
    try:
        await db.commit()
        await db.refresh(kpi)
        return kpi
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{kpi_id}/goals", response_model=List[GoalResponse])
async def list_linked_employee_goals(
    kpi_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(Goal)
        .where(Goal.shared_kpi_id == kpi_id)
        .options(
            joinedload(Goal.owner),
            joinedload(Goal.tasks)
        )
    )
    return result.unique().scalars().all()
