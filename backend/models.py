from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

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

class ThrustArea(Base):
    __tablename__ = "ThrustArea"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
