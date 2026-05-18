from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
from sqlalchemy.orm import joinedload
from database import get_db
from models import User, Role
from typing import List
from security import get_current_user
from schemas import UserSnapshot, ManagerUpdate

router = APIRouter(prefix="/api/users", tags=["users"])

async def auto_assign_managers_logic(db: AsyncSession):
    """
    Core logic to automatically and sequentially assign existing Employees to existing Managers
    in a round-robin fashion. Prints detailed steps to the console.
    """
    # 1. Fetch all users who have the 'Manager' role
    manager_role_result = await db.execute(select(Role).where(Role.name == "Manager"))
    manager_role = manager_role_result.scalar_one_or_none()
    
    if not manager_role:
        return {"message": "Manager role does not exist yet.", "assigned_count": 0}

    managers_result = await db.execute(select(User).where(User.role_id == manager_role.id))
    managers = managers_result.scalars().all()

    if not managers:
        return {"message": "No users with Manager role found.", "assigned_count": 0}

    # 2. Fetch all users who have the 'Employee' role AND currently have manager_id == None
    employee_role_result = await db.execute(select(Role).where(Role.name == "Employee"))
    employee_role = employee_role_result.scalar_one_or_none()

    if not employee_role:
        return {"message": "Employee role does not exist yet.", "assigned_count": 0}

    # We also consider users with role_id as None to be basic employees
    employees_result = await db.execute(
        select(User).where(
            or_(User.role_id == employee_role.id, User.role_id.is_(None)),
            User.manager_id.is_(None)
        )
    )
    employees = employees_result.scalars().all()

    if not employees:
        return {"message": "No employees without managers found to assign.", "assigned_count": 0}

    print(f"\n🔄 Starting Round-Robin Manager Auto-Assignment...")
    print(f"   Available Managers: {', '.join([f'{m.name} (ID: {m.id})' for m in managers])}")
    print(f"   Employees to Assign: {len(employees)}")

    # 3. Loop through the employees and sequentially assign them to the managers (round-robin)
    assigned_count = 0
    for i, employee in enumerate(employees):
        manager = managers[i % len(managers)]
        # 4. Update the manager_id for each employee in the User table
        employee.manager_id = manager.id
        assigned_count += 1
        print(f"   👉 Assigned Employee '{employee.name}' (ID: {employee.id}) to Manager '{manager.name}' (ID: {manager.id}) using index {i} % {len(managers)} = {i % len(managers)}")

    # 5. Commit the session to the database
    try:
        await db.commit()
        print(f"✅ Auto-assignment committed successfully! {assigned_count} employees assigned.\n")
    except Exception as e:
        await db.rollback()
        raise e

    # 6. Return a success message detailing how many employees were assigned
    return {
        "message": f"Successfully assigned {assigned_count} employees to {len(managers)} managers.",
        "assigned_count": assigned_count
    }

@router.post("/auto-assign-managers")
async def auto_assign_managers(db: AsyncSession = Depends(get_db)):
    try:
        result = await auto_assign_managers_logic(db)
        if "does not exist" in result["message"] or "No users with Manager" in result["message"]:
            raise HTTPException(status_code=400, detail=result["message"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/managers", response_model=List[UserSnapshot])
async def get_managers(db: AsyncSession = Depends(get_db)):
    manager_role_result = await db.execute(select(Role).where(Role.name == "Manager"))
    manager_role = manager_role_result.scalar_one_or_none()
    if not manager_role:
        return []
    managers_result = await db.execute(select(User).where(User.role_id == manager_role.id))
    return managers_result.scalars().all()

@router.get("/me")
async def get_my_profile(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_result = await db.execute(
        select(User)
        .where(User.id == current_user["id"])
        .options(joinedload(User.manager))
    )
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "manager_id": user.manager_id,
        "manager_name": user.manager.name if user.manager else None
    }

@router.put("/me/manager")
async def update_my_manager(
    manager_update: ManagerUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user = await db.get(User, current_user["id"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify manager exists
    manager = await db.get(User, manager_update.manager_id)
    if not manager:
        raise HTTPException(status_code=400, detail="Invalid manager selected")

    user.manager_id = manager.id
    
    try:
        await db.commit()
        return {"success": True, "message": "Manager updated successfully"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
