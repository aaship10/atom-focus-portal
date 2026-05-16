from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role_id: Optional[int] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role_name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class ThrustAreaSchema(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class GoalAchievementCreate(BaseModel):
    quarter: str
    actual_value: Decimal
    status: Optional[str] = None  # Added to update parent goal status

class GoalAchievementResponse(BaseModel):
    id: int
    quarter: str
    actual_value: Decimal
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class GoalCreate(BaseModel):
    owner_id: int
    thrust_area_id: int
    title: str
    description: Optional[str] = None
    uom: str
    target: Decimal
    weight: int
    year: int

class GoalResponse(BaseModel):
    id: int
    owner_id: int
    thrust_area_id: int
    title: str
    description: Optional[str] = None
    uom: str
    target: Decimal
    weight: int
    year: int
    status: str
    locked: bool
    created_at: datetime
    updated_at: datetime
    thrust_area: Optional[ThrustAreaSchema] = None
    achievements: List[GoalAchievementResponse] = []
    model_config = ConfigDict(from_attributes=True)

class GoalSnapshot(BaseModel):
    id: int
    title: str
    status: str
    progress: float
    model_config = ConfigDict(from_attributes=True)

class EmployeeDashboardSummary(BaseModel):
    total_goals: int
    pending_approvals: int
    off_track_goals: int
    overall_progress: float
    top_goals: List[GoalSnapshot]
    user_name: str
    model_config = ConfigDict(from_attributes=True)
