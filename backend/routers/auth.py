from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from database import get_db
from models import User, Role
from schemas import UserCreate, UserLogin, UserResponse, Token
from security import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_in.email))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = get_password_hash(user_in.password)
    new_user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=hashed_password,
        role_id=user_in.role_id
    )
    db.add(new_user)
    try:
        await db.commit()
        await db.refresh(new_user)
        # Load the role to return it in the response
        result = await db.execute(select(User).options(selectinload(User.role)).where(User.id == new_user.id))
        new_user = result.scalars().first()
        
        print(f"[OK] NEW USER REGISTERED: {new_user.email} | Role ID: {new_user.role_id}")
        
        return UserResponse(
            id=new_user.id,
            name=new_user.name,
            email=new_user.email,
            role_name=new_user.role.name if new_user.role else None
        )
    except Exception as e:
        await db.rollback()
        print(f"[ERROR] DB INSERT ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/login", response_model=Token)
async def login(user_in: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).options(selectinload(User.role)).where(User.email == user_in.email))
    user = result.scalars().first()
    
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(
        data={"id": user.id, "role": user.role.name if user.role else "Employee", "name": user.name}
    )
    
    print(f"[SUCCESS] USER SUCCESSFUL LOGIN: {user.email}")
    return {"access_token": access_token, "token_type": "bearer"}
