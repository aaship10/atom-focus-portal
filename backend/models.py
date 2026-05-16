from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
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
    goals = relationship("Goal", back_populates="employee")

class ThrustArea(Base):
    __tablename__ = "ThrustArea"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)
    
    goals = relationship("Goal", back_populates="thrust_area")

class Goal(Base):
    __tablename__ = "Goal"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String, nullable=True)
    weight = Column(Integer)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    employee_id = Column(Integer, ForeignKey("User.id"))
    thrust_area_id = Column(Integer, ForeignKey("ThrustArea.id"))
    
    employee = relationship("User", back_populates="goals")
    thrust_area = relationship("ThrustArea", back_populates="goals")
