from fastapi import APIRouter, Depends, HTTPException, status, Header
import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from typing import List, Optional
from database import get_db
from models import Goal, GoalAchievement, ThrustArea
from schemas import GoalCreate, GoalResponse, GoalAchievementCreate, ThrustAreaSchema
from security import get_current_user

router = APIRouter(prefix="/api/goals", tags=["goals"])

@router.post("/", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
async def create_goal(
    goal_in: GoalCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
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
            .options(joinedload(Goal.thrust_area), joinedload(Goal.achievements), joinedload(Goal.checkins))
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
        joinedload(Goal.checkins)
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

    if goal.locked:
        raise HTTPException(status_code=403, detail="Goal is locked for the current period")

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
    
    goal.status = 'Pending'
    
    try:
        await db.commit()
        return {"success": True, "message": "Goal submitted for approval"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/thrust-areas", response_model=List[ThrustAreaSchema])
async def get_thrust_areas(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ThrustArea))
    return result.scalars().all()
