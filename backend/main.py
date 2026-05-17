from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from database import engine, Base
from routers import auth, test, goals, dashboard, manager, users
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup event: create tables and test connection
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            print("DATABASE CONNECTED SUCCESSFULLY!")
            
        # Automatically auto-assign managers on startup
        from database import AsyncSessionLocal
        from routers.users import auto_assign_managers_logic
        async with AsyncSessionLocal() as db:
            print("🚀 Running startup auto-assignment of managers...")
            try:
                result = await auto_assign_managers_logic(db)
                print(f"⚙️ Startup assignment status: {result.get('message')}")
            except Exception as ex:
                print(f"⚠️ Startup manager assignment failed: {ex}")
    except Exception as e:
        print(f"DATABASE CONNECTION FAILED: {e}")
        
    yield
    # Shutdown event
    pass

app = FastAPI(title="Focus Portal API", lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(test.router)
app.include_router(goals.router)
app.include_router(dashboard.router)
app.include_router(manager.router)
app.include_router(users.router)

@app.get("/")
async def root():
    return {"message": "FastAPI Backend is running."}
