from fastapi import APIRouter, Depends, HTTPException, status, Header
import datetime
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from typing import List, Optional
from database import get_db
from models import Goal, GoalAchievement, ThrustArea, User
from schemas import GoalCreate, GoalResponse, GoalAchievementCreate, ThrustAreaSchema, GoalUpdate
from security import get_current_user

router = APIRouter(prefix="/api/goals", tags=["goals"])

@router.post("/", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
async def create_goal(
    goal_in: GoalCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Enforce limit of 8 goals per employee per year
    from sqlalchemy import func
    count_result = await db.execute(
        select(func.count(Goal.id)).where(
            Goal.owner_id == goal_in.owner_id,
            Goal.year == goal_in.year
        )
    )
    existing_count = count_result.scalar() or 0
    if existing_count >= 8:
        raise HTTPException(
            status_code=400,
            detail="An employee can create a maximum of 8 goals. You have already reached this limit."
        )

    # Basic Validation: Ensure weight is reasonable
    if goal_in.weight < 10 or goal_in.weight > 100:
        raise HTTPException(status_code=400, detail="Weight must be between 10 and 100")

    new_goal = Goal(
        owner_id=goal_in.owner_id,
        thrust_area_id=goal_in.thrust_area_id,
        title=goal_in.title,
        description=goal_in.description,
        uom=goal_in.uom,
        target=goal_in.target,
        weight=goal_in.weight,
        year=goal_in.year,
        status="Pending" if goal_in.submit_now else "Draft"
    )
    
    db.add(new_goal)
    try:
        await db.commit()
        await db.refresh(new_goal)
        
        # Reload with relationships for response
        result = await db.execute(
            select(Goal)
            .options(
                joinedload(Goal.thrust_area), 
                joinedload(Goal.achievements), 
                joinedload(Goal.checkins),
                joinedload(Goal.shared_kpi),
                joinedload(Goal.tasks)
            )
            .where(Goal.id == new_goal.id)
        )
        return result.unique().scalar_one()
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[GoalResponse])
async def get_goals(
    owner_id: Optional[int] = None,
    year: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    query = select(Goal).options(
        joinedload(Goal.thrust_area), 
        joinedload(Goal.achievements),
        joinedload(Goal.checkins),
        joinedload(Goal.shared_kpi),
        joinedload(Goal.tasks)
    )
    
    if owner_id:
        query = query.where(Goal.owner_id == owner_id)
    else:
        query = query.where(Goal.owner_id == current_user["id"])
    
    if year:
        query = query.where(Goal.year == year)

    result = await db.execute(query)
    return result.unique().scalars().all()

@router.post("/{goal_id}/achievements", status_code=status.HTTP_201_CREATED)
async def log_achievement(
    goal_id: int,
    achievement_in: GoalAchievementCreate,
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
        q = achievement_in.quarter
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

    # Verify goal exists and user owns it (or is manager/admin - adding basic check)
    result = await db.execute(
        select(Goal)
        .where(Goal.id == goal_id)
        .options(joinedload(Goal.achievements))
    )
    goal = result.unique().scalar_one_or_none()
    
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    # Goal locking check removed here so employees can log achievements on approved/locked goals.
    # The quarterly window checks above will continue to restrict out-of-schedule logging.

    # Check for existing achievement for this quarter (Upsert Logic)
    existing_achievement = next((a for a in goal.achievements if a.quarter == achievement_in.quarter), None)

    if existing_achievement:
        existing_achievement.actual_value = achievement_in.actual_value
    else:
        new_achievement = GoalAchievement(
            goal_id=goal_id,
            quarter=achievement_in.quarter,
            actual_value=achievement_in.actual_value
        )
        db.add(new_achievement)
    
    # Update parent goal status if provided
    if achievement_in.status:
        goal.status = achievement_in.status

    try:
        await db.commit()
        return {"success": True, "message": "Achievement updated successfully"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

async def validate_goals_for_submission(owner_id: int, year: int, db: AsyncSession):
    # Fetch all goals of this employee for the current year
    result = await db.execute(
        select(Goal).where(Goal.owner_id == owner_id, Goal.year == year)
    )
    goals = result.scalars().all()
    
    if not goals:
        raise HTTPException(status_code=400, detail="You do not have any goals to submit.")
        
    if len(goals) > 8:
        raise HTTPException(
            status_code=400,
            detail=f"You can create a maximum of 8 goals. Current count: {len(goals)}."
        )
        
    total_weight = sum(g.weight for g in goals)
    if total_weight != 100:
        raise HTTPException(
            status_code=400,
            detail=f"Total weightage across all goals must equal exactly 100%. Current total: {total_weight}%."
        )
        
    for g in goals:
        if g.weight < 10:
            raise HTTPException(
                status_code=400,
                detail=f"The minimum weightage allowed for any individual goal is 10%. Goal '{g.title}' has {g.weight}%."
            )

@router.put("/{goal_id}/submit")
async def submit_goal(
    goal_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(Goal).where(Goal.id == goal_id, Goal.owner_id == current_user["id"])
    )
    goal = result.scalar_one_or_none()
    
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found or unauthorized")
        
    # Enforce sheet-level validation rules before permitting submission of any goal!
    await validate_goals_for_submission(current_user["id"], goal.year, db)
    
    # If the sheet is valid, we submit all draft/rejected goals on the sheet to ensure consistency
    all_drafts_res = await db.execute(
        select(Goal).where(
            Goal.owner_id == current_user["id"],
            Goal.year == goal.year,
            Goal.status.in_(["Draft", "Rejected"])
        )
    )
    all_drafts = all_drafts_res.scalars().all()
    for g in all_drafts:
        g.status = 'Pending'
        
    try:
        await db.commit()
        return {"success": True, "message": "Goal sheet successfully submitted for approval"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{goal_id}", response_model=GoalResponse)
async def update_goal(
    goal_id: int,
    goal_in: GoalUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(Goal)
        .where(Goal.id == goal_id)
        .options(
            joinedload(Goal.thrust_area), 
            joinedload(Goal.achievements), 
            joinedload(Goal.checkins),
            joinedload(Goal.shared_kpi),
            joinedload(Goal.tasks)
        )
    )
    goal = result.unique().scalar_one_or_none()
    
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
        
    if goal.owner_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Only the goal owner can edit this goal.")
        
    if goal.locked:
        raise HTTPException(status_code=403, detail="Goal is locked and cannot be edited without Admin intervention.")

    # Shared goal constraints check:
    if goal.shared_kpi_id:
        # Check if they are trying to modify title, target, uom, or thrust_area_id
        if (goal_in.title is not None and goal_in.title != goal.title) or \
           (goal_in.target is not None and goal_in.target != goal.target) or \
           (goal_in.uom is not None and goal_in.uom != goal.uom) or \
           (goal_in.thrust_area_id is not None and goal_in.thrust_area_id != goal.thrust_area_id) or \
           (goal_in.description is not None and goal_in.description != goal.description):
            raise HTTPException(
                status_code=403,
                detail="For shared goals, title, target, UoM, and thrust area are read-only and cannot be changed."
            )

    # Basic validations
    if goal_in.weight is not None:
        if goal_in.weight < 10 or goal_in.weight > 100:
            raise HTTPException(status_code=400, detail="Weight must be between 10% and 100%")
        goal.weight = goal_in.weight

    if goal_in.thrust_area_id is not None:
        goal.thrust_area_id = goal_in.thrust_area_id
    if goal_in.title is not None:
        goal.title = goal_in.title
    if goal_in.description is not None:
        goal.description = goal_in.description
    if goal_in.uom is not None:
        goal.uom = goal_in.uom
    if goal_in.target is not None:
        goal.target = goal_in.target
    if goal_in.year is not None:
        goal.year = goal_in.year

    try:
        await db.commit()
        await db.refresh(goal)
        return goal
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{goal_id}")
async def delete_goal(
    goal_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    goal = await db.get(Goal, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
        
    if goal.owner_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Only the goal owner can delete this goal.")
        
    if goal.locked:
        raise HTTPException(status_code=403, detail="Locked goals cannot be deleted.")
        
    if goal.status not in ["Draft", "Rejected"]:
        raise HTTPException(status_code=403, detail="Only draft or rejected goals can be deleted.")
        
    try:
        await db.delete(goal)
        await db.commit()
        return {"success": True, "message": "Goal deleted successfully"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/thrust-areas", response_model=List[ThrustAreaSchema])
async def get_thrust_areas(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ThrustArea))
    return result.scalars().all()

# --- Employee-Owned Tasks Endpoints ---

from models import EmployeeTask
from schemas import EmployeeTaskCreate, EmployeeTaskUpdate, EmployeeTaskResponse

@router.get("/{goal_id}/tasks", response_model=List[EmployeeTaskResponse])
async def get_goal_tasks(
    goal_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Verify goal ownership
    goal = await db.get(Goal, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if goal.owner_id != current_user["id"]:
        # Allow manager to view tasks too
        user_result = await db.execute(select(User).where(User.id == goal.owner_id))
        owner = user_result.scalar_one_or_none()
        if not owner or owner.manager_id != current_user["id"]:
            raise HTTPException(status_code=403, detail="Not authorized to view tasks for this goal.")

    result = await db.execute(
        select(EmployeeTask).where(EmployeeTask.employee_goal_id == goal_id).order_by(EmployeeTask.created_at.asc())
    )
    return result.scalars().all()

@router.post("/{goal_id}/tasks", response_model=EmployeeTaskResponse, status_code=status.HTTP_201_CREATED)
async def create_goal_task(
    goal_id: int,
    task_in: EmployeeTaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    goal = await db.get(Goal, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if goal.owner_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Only the goal owner can add tasks.")

    new_task = EmployeeTask(
        employee_goal_id=goal_id,
        title=task_in.title,
        status=task_in.status or "Pending",
        progress=task_in.progress or 0
    )
    db.add(new_task)
    try:
        await db.commit()
        await db.refresh(new_task)
        return new_task
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{goal_id}/tasks/{task_id}", response_model=EmployeeTaskResponse)
async def update_goal_task(
    goal_id: int,
    task_id: int,
    task_in: EmployeeTaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    goal = await db.get(Goal, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if goal.owner_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Only the goal owner can update tasks.")

    task = await db.get(EmployeeTask, task_id)
    if not task or task.employee_goal_id != goal_id:
        raise HTTPException(status_code=404, detail="Task not found under this goal")

    if task_in.title is not None:
        task.title = task_in.title
    if task_in.status is not None:
        task.status = task_in.status
    if task_in.progress is not None:
        if task_in.progress < 0 or task_in.progress > 100:
            raise HTTPException(status_code=400, detail="Progress must be between 0 and 100")
        task.progress = task_in.progress

    try:
        await db.commit()
        await db.refresh(task)
        return task
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{goal_id}/tasks/{task_id}")
async def delete_goal_task(
    goal_id: int,
    task_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    goal = await db.get(Goal, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if goal.owner_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Only the goal owner can delete tasks.")

    task = await db.get(EmployeeTask, task_id)
    if not task or task.employee_goal_id != goal_id:
        raise HTTPException(status_code=404, detail="Task not found under this goal")

    try:
        await db.delete(task)
        await db.commit()
        return {"success": True, "message": "Task deleted successfully"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# --- Editable Employee Fields Endpoint ---

class PersonalNotesWeightUpdate(BaseModel):
    weight: int
    personal_notes: str

@router.put("/{goal_id}/personal-notes-weight")
async def update_personal_notes_weight(
    goal_id: int,
    payload: PersonalNotesWeightUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    goal = await db.get(Goal, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if goal.owner_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Only the goal owner can update their weightage and personal notes.")

    if goal.locked and goal.weight != payload.weight:
        raise HTTPException(status_code=403, detail="Goal weightage is locked and cannot be edited without Admin intervention.")

    if payload.weight < 10 or payload.weight > 100:
        raise HTTPException(status_code=400, detail="Weight must be between 10% and 100%")

    goal.weight = payload.weight
    goal.personal_notes = payload.personal_notes

    try:
        await db.commit()
        return {"success": True, "message": "Goal weight and personal notes updated successfully"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
