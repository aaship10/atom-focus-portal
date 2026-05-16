from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Numeric, Text
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Role(Base):
    __tablename__ = "Role"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    users = relationship("User", back_populates="role")

class User(Base):
    __tablename__ = "User"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role_id = Column(Integer, ForeignKey("Role.id"), nullable=True)
    
    role = relationship("Role", back_populates="users")
    goals = relationship("Goal", back_populates="owner")
    checkins = relationship("GoalCheckin", back_populates="manager")

class ThrustArea(Base):
    __tablename__ = "ThrustArea"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)
    
    goals = relationship("Goal", back_populates="thrust_area")

class Goal(Base):
    __tablename__ = "Goal"
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("User.id"), nullable=False)
    thrust_area_id = Column(Integer, ForeignKey("ThrustArea.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    target = Column(Numeric(15, 2), nullable=False)
    weight = Column(Integer, nullable=False)
    uom = Column(String(50), nullable=False)
    year = Column(Integer, nullable=False, default=lambda: datetime.datetime.utcnow().year)
    status = Column(String(50), default="Pending")
    locked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    owner = relationship("User", back_populates="goals")
    thrust_area = relationship("ThrustArea", back_populates="goals")
    achievements = relationship("GoalAchievement", back_populates="goal", cascade="all, delete-orphan")
    checkins = relationship("GoalCheckin", back_populates="goal", cascade="all, delete-orphan")

class GoalAchievement(Base):
    __tablename__ = "GoalAchievement"
    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("Goal.id"), nullable=False)
    quarter = Column(String(10), nullable=False)
    actual_value = Column(Numeric(15, 2), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    goal = relationship("Goal", back_populates="achievements")

class GoalCheckin(Base):
    __tablename__ = "GoalCheckin"
    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("Goal.id"), nullable=False)
    manager_id = Column(Integer, ForeignKey("User.id"), nullable=False)
    checkin_date = Column(DateTime, default=datetime.datetime.utcnow)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    goal = relationship("Goal", back_populates="checkins")
    manager = relationship("User", back_populates="checkins")
