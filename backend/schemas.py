from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

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

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class ThrustAreaSchema(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

class GoalBase(BaseModel):
    title: str
    description: Optional[str] = None
    weight: int
    thrust_area_id: int

class GoalCreate(GoalBase):
    pass

class GoalResponse(GoalBase):
    id: int
    created_at: datetime
    employee_id: int
    thrust_area: Optional[ThrustAreaSchema] = None

    class Config:
        from_attributes = True

class GoalsCreateRequest(BaseModel):
    goals: List[GoalCreate]
