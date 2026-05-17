import asyncio
from sqlalchemy import text
from database import engine

async def add_quarter_column():
    async with engine.begin() as conn:
        try:
            # We add it as nullable first, or with a default
            await conn.execute(text('ALTER TABLE "GoalCheckin" ADD COLUMN IF NOT EXISTS quarter VARCHAR(10) NOT NULL DEFAULT \'Q1\';'))
            print("Successfully added quarter column.")
        except Exception as e:
            print(f"Failed to add column: {e}")

if __name__ == "__main__":
    asyncio.run(add_quarter_column())
