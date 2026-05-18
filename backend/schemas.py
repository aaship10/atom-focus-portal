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
    submit_now: bool = False

class ManagerUpdate(BaseModel):
    manager_id: int

class GoalCheckinCreate(BaseModel):
    quarter: str
    comment: str

class GoalCheckinResponse(BaseModel):
    id: int
    goal_id: int
    manager_id: int
    quarter: str
    comment: str
    checkin_date: datetime
    model_config = ConfigDict(from_attributes=True)

class EmployeeTaskResponse(BaseModel):
    id: int
    employee_goal_id: int
    title: str
    status: str
    progress: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class EmployeeTaskCreate(BaseModel):
    title: str
    status: Optional[str] = "Pending"
    progress: Optional[int] = 0

class EmployeeTaskUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    progress: Optional[int] = None

class SharedKPIResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    target: Decimal
    uom: str
    timeline: str
    department: str
    created_by: int
    current_achievement: Decimal
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class SharedKPICreate(BaseModel):
    title: str
    description: Optional[str] = None
    target: Decimal
    uom: str
    timeline: str
    department: str
    default_weight: Optional[int] = None
    assigned_employee_ids: Optional[List[int]] = None

class GoalResponse(BaseModel):
    id: int
    owner_id: int
    thrust_area_id: Optional[int] = None
    shared_kpi_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    uom: str
    target: Decimal
    weight: int
    year: int
    status: str
    locked: bool
    personal_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    thrust_area: Optional[ThrustAreaSchema] = None
    achievements: List[GoalAchievementResponse] = []
    checkins: List[GoalCheckinResponse] = []
    shared_kpi: Optional[SharedKPIResponse] = None
    tasks: List[EmployeeTaskResponse] = []
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
    manager_name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class GoalApprovalUpdate(BaseModel):
    target: Optional[Decimal] = None
    weight: Optional[int] = None

class UserSnapshot(BaseModel):
    id: int
    name: str
    model_config = ConfigDict(from_attributes=True)

class GoalReviewResponse(GoalResponse):
    owner: UserSnapshot

class ManagerDashboardSummary(BaseModel):
    total_team_goals: int
    pending_approvals: int
    at_risk_goals: int
    user_name: str

class TeamMemberGoalsResponse(BaseModel):
    id: int
    name: str
    email: str
    goals: List[GoalResponse]
    model_config = ConfigDict(from_attributes=True)
