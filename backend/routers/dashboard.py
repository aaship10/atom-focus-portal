from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from database import get_db
from models import Goal, User, GoalAchievement
from schemas import EmployeeDashboardSummary, GoalSnapshot
from security import get_current_user
import datetime

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

def calculate_progress(goal: Goal) -> float:
    # Use latest achievement for progress calculation
    if not goal.achievements:
        return 0.0
    
    # Sort achievements by quarter/date and take the latest
    latest = sorted(goal.achievements, key=lambda x: x.created_at, reverse=True)[0]
    actual = float(latest.actual_value)
    target = float(goal.target)

    if goal.uom == "Min":
        if target == 0: return 0.0
        return min((actual / target) * 100, 100.0)
    elif goal.uom == "Max":
        if actual == 0: return 100.0 if target > 0 else 0.0
        return min((target / actual) * 100, 100.0)
    elif goal.uom == "Zero":
        return 100.0 if actual == 0 else 0.0
    elif goal.uom == "Timeline":
        # Simplified: if we have an achievement, assume it's on time for now 
        # or implement date comparison if target is a date string
        return 100.0
    return 0.0

@router.get("/employee", response_model=EmployeeDashboardSummary)
async def get_employee_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    current_year = datetime.datetime.utcnow().year

    # Fetch User info
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Fetch Goals for current year
    goals_result = await db.execute(
        select(Goal)
        .where(Goal.owner_id == user_id, Goal.year == current_year)
        .options(joinedload(Goal.achievements))
    )
    goals = goals_result.unique().scalars().all()

    total_goals = len(goals)
    pending_approvals = sum(1 for g in goals if g.status == "Pending")
    off_track_goals = sum(1 for g in goals if g.status == "Off Track")
    
    # Calculate overall progress
    total_progress = sum(calculate_progress(g) for g in goals)
    overall_progress = (total_progress / total_goals) if total_goals > 0 else 0.0

    # Get top 3 most recently updated goals for snapshot
    sorted_goals = sorted(goals, key=lambda x: x.updated_at, reverse=True)[:3]
    top_goals = [
        GoalSnapshot(
            id=g.id,
            title=g.title,
            status=g.status,
            progress=calculate_progress(g)
        ) for g in sorted_goals
    ]

    return EmployeeDashboardSummary(
        total_goals=total_goals,
        pending_approvals=pending_approvals,
        off_track_goals=off_track_goals,
        overall_progress=round(overall_progress, 1),
        top_goals=top_goals,
        user_name=user.name
    )
