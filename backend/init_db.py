import asyncio
from database import engine, Base
from models import User, Role, ThrustArea, Goal

async def create_tables():
    print("Initializing database tables...")
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("Database tables created successfully!")
    except Exception as e:
        print(f"Failed to create tables: {e}")

if __name__ == "__main__":
    asyncio.run(create_tables())
