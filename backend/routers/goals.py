from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
from database import get_db
from models import Goal, User, ThrustArea
from schemas import GoalResponse, GoalsCreateRequest
from security import get_current_user

router = APIRouter(prefix="/api/goals", tags=["goals"])

@router.get("/", response_model=List[GoalResponse])
async def get_goals(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    employee_id = current_user["id"]
    result = await db.execute(
        select(Goal)
        .options(selectinload(Goal.thrust_area))
        .where(Goal.employee_id == employee_id)
    )
    goals = result.scalars().all()
    return goals

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_goals(
    request: GoalsCreateRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    employee_id = current_user["id"]
    goals_data = request.goals

    # 1. Validation: Array not empty
    if not goals_data:
        raise HTTPException(status_code=400, detail="Must provide at least one goal.")

    # 2. Validation: Maximum of 8 goals
    if len(goals_data) > 8:
        raise HTTPException(status_code=400, detail="You can only create a maximum of 8 goals.")

    total_weight = 0
    for goal_in in goals_data:
        # 3. Validation: Weight per goal >= 10%
        if goal_in.weight < 10:
            raise HTTPException(
                status_code=400, 
                detail=f"Each goal must have a minimum weight of 10%. Goal '{goal_in.title}' failed this check."
            )
        total_weight += goal_in.weight

    # 4. Validation: Total weight sum = 100%
    if total_weight != 100:
        raise HTTPException(
            status_code=400, 
            detail=f"Total weight must equal exactly 100%. Current total is {total_weight}%."
        )

    # 5. Database Transaction
    try:
        new_goals = []
        for goal_in in goals_data:
            new_goal = Goal(
                title=goal_in.title,
                description=goal_in.description,
                weight=goal_in.weight,
                thrust_area_id=goal_in.thrust_area_id,
                employee_id=employee_id
            )
            db.add(new_goal)
            new_goals.append(new_goal)
        
        await db.commit()
        return {"success": True, "message": "Goals successfully created"}
    except Exception as e:
        await db.rollback()
        print(f"❌ GOAL INSERT ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/thrust-areas", response_model=List[dict])
async def get_thrust_areas(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ThrustArea))
    areas = result.scalars().all()
    return [{"id": area.id, "name": area.name} for area in areas]
