import asyncio
import os
import asyncpg
from dotenv import load_dotenv

async def run_seed():
    load_dotenv()
    database_url = os.getenv("DATABASE_URL")
    database_url = database_url.replace("?sslmode=require", "").replace("&sslmode=require", "")
    
    print("Connecting to database for seeding...")
    try:
        conn = await asyncpg.connect(database_url)
        print("Connected!")
        
        with open("seed.sql", "r") as f:
            seed_sql = f.read()
        
        print("Executing seed.sql...")
        await conn.execute(seed_sql)
        print("Dummy data seeded successfully!")
        
        await conn.close()
    except Exception as e:
        print(f"Error seeding database: {e}")

if __name__ == "__main__":
    asyncio.run(run_seed())
