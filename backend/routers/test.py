from fastapi import APIRouter, Depends
from dependencies import get_current_user, RoleChecker
from models import User

router = APIRouter(prefix="/api/test", tags=["test"])

@router.get("/admin-only")
async def admin_only(current_user: User = Depends(RoleChecker(["Admin"]))):
    return {"message": f"Welcome Admin {current_user.name}!"}
