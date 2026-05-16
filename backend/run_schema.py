import asyncio
import os
import asyncpg
from dotenv import load_dotenv

async def run_schema():
    load_dotenv()
    database_url = os.getenv("DATABASE_URL")
    
    # Clean up the URL for asyncpg (remove sslmode if present)
    database_url = database_url.replace("?sslmode=require", "").replace("&sslmode=require", "")
    
    print("Connecting to database...")
    try:
        conn = await asyncpg.connect(database_url)
        print("Connected!")
        
        with open("schema.sql", "r") as f:
            schema_sql = f.read()
        
        print("Executing schema.sql...")
        await conn.execute(schema_sql)
        print("Database schema updated successfully!")
        
        await conn.close()
    except Exception as e:
        print(f"Error updating database: {e}")

if __name__ == "__main__":
    asyncio.run(run_schema())
