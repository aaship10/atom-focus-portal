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
    manager_id = Column(Integer, ForeignKey("User.id"), nullable=True)
    department = Column(String(255), nullable=True)
    
    role = relationship("Role", back_populates="users")
    manager = relationship("User", remote_side=[id], backref="direct_reports")
    goals = relationship("Goal", back_populates="owner")
    checkins = relationship("GoalCheckin", back_populates="manager")
    audit_logs = relationship("GoalAuditLog", back_populates="user")

class ThrustArea(Base):
    __tablename__ = "ThrustArea"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)
    
    goals = relationship("Goal", back_populates="thrust_area")

class SharedKPI(Base):
    __tablename__ = "SharedKPI"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    target = Column(Numeric(15, 2), nullable=False)
    uom = Column(String(50), nullable=False)
    timeline = Column(String(50), nullable=False)
    department = Column(String(255), nullable=False)
    created_by = Column(Integer, ForeignKey("User.id", ondelete="CASCADE"), nullable=False)
    current_achievement = Column(Numeric(15, 2), default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    creator = relationship("User")
    employee_goals = relationship("Goal", back_populates="shared_kpi", cascade="all, delete-orphan")

class Goal(Base):
    __tablename__ = "Goal"
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("User.id"), nullable=False)
    thrust_area_id = Column(Integer, ForeignKey("ThrustArea.id"), nullable=True)
    shared_kpi_id = Column(Integer, ForeignKey("SharedKPI.id", ondelete="SET NULL"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    target = Column(Numeric(15, 2), nullable=False)
    weight = Column(Integer, nullable=False)
    uom = Column(String(50), nullable=False)
    year = Column(Integer, nullable=False, default=lambda: datetime.datetime.utcnow().year)
    status = Column(String(50), default="Pending")
    locked = Column(Boolean, default=False)
    personal_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    owner = relationship("User", back_populates="goals")
    thrust_area = relationship("ThrustArea", back_populates="goals")
    shared_kpi = relationship("SharedKPI", back_populates="employee_goals")
    achievements = relationship("GoalAchievement", back_populates="goal", cascade="all, delete-orphan")
    checkins = relationship("GoalCheckin", back_populates="goal", cascade="all, delete-orphan")
    tasks = relationship("EmployeeTask", back_populates="goal", cascade="all, delete-orphan")
    audit_logs = relationship("GoalAuditLog", back_populates="goal", cascade="all, delete-orphan")

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
    quarter = Column(String(10), nullable=False)
    checkin_date = Column(DateTime, default=datetime.datetime.utcnow)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    goal = relationship("Goal", back_populates="checkins")
    manager = relationship("User", back_populates="checkins")

class EmployeeTask(Base):
    __tablename__ = "EmployeeTask"
    id = Column(Integer, primary_key=True, index=True)
    employee_goal_id = Column(Integer, ForeignKey("Goal.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    status = Column(String(50), default="Pending")
    progress = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    goal = relationship("Goal", back_populates="tasks")

class Cycle(Base):
    __tablename__ = "Cycle"
    id = Column(Integer, primary_key=True, index=True)
    quarter = Column(String(10), nullable=False) # "Q1", "Q2", "Q3", "Q4"
    year = Column(Integer, nullable=False)
    status = Column(String(50), default="Active") # "Active", "Closed"
    goal_setting_start = Column(DateTime, nullable=True)
    goal_setting_end = Column(DateTime, nullable=True)
    checkin_start = Column(DateTime, nullable=True)
    checkin_end = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class GoalAuditLog(Base):
    __tablename__ = "GoalAuditLog"
    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("Goal.id", ondelete="CASCADE"), nullable=True)
    user_id = Column(Integer, ForeignKey("User.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False) # e.g. "Unlock Goal", "Update Target"
    details = Column(Text, nullable=True)
    previous_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    goal = relationship("Goal", back_populates="audit_logs")
    user = relationship("User", back_populates="audit_logs")

class EscalationLog(Base):
    __tablename__ = "EscalationLog"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("User.id", ondelete="CASCADE"), nullable=False)
    manager_id = Column(Integer, ForeignKey("User.id", ondelete="SET NULL"), nullable=True)
    type = Column(String(100), nullable=False) # "Missed Goal Submission", "Missed Manager Approval", "Missed Quarterly Check-in"
    details = Column(Text, nullable=True)
    resolved = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", foreign_keys=[user_id])
    manager = relationship("User", foreign_keys=[manager_id])
