import asyncio
from sqlalchemy import text
from database import engine

async def run_migration():
    print("Running Shared KPI database migration...")
    async with engine.begin() as conn:
        try:
            # 1. Create SharedKPI table
            await conn.execute(text('''
                CREATE TABLE IF NOT EXISTS "SharedKPI" (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    target DECIMAL(15, 2) NOT NULL,
                    uom VARCHAR(50) NOT NULL,
                    timeline VARCHAR(50) NOT NULL,
                    department VARCHAR(255) NOT NULL,
                    created_by INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
                    current_achievement DECIMAL(15, 2) DEFAULT 0.0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            '''))
            print("OK: Created SharedKPI table.")

            # 2. Add columns to Goal table and drop NOT NULL constraint on thrust_area_id
            await conn.execute(text('ALTER TABLE "Goal" ADD COLUMN IF NOT EXISTS shared_kpi_id INTEGER REFERENCES "SharedKPI"(id) ON DELETE SET NULL;'))
            await conn.execute(text('ALTER TABLE "Goal" ADD COLUMN IF NOT EXISTS personal_notes TEXT;'))
            await conn.execute(text('ALTER TABLE "Goal" ALTER COLUMN thrust_area_id DROP NOT NULL;'))
            print("OK: Updated Goal table columns and constraints.")

            # 3. Create EmployeeTask table
            await conn.execute(text('''
                CREATE TABLE IF NOT EXISTS "EmployeeTask" (
                    id SERIAL PRIMARY KEY,
                    employee_goal_id INTEGER NOT NULL REFERENCES "Goal"(id) ON DELETE CASCADE,
                    title VARCHAR(255) NOT NULL,
                    status VARCHAR(50) DEFAULT 'Pending',
                    progress INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            '''))
            print("OK: Created EmployeeTask table.")

            # 4. Add department column to User table
            await conn.execute(text('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS department VARCHAR(255);'))
            
            # Seed departments for existing users to make testing assign-by-department easy!
            await conn.execute(text("UPDATE \"User\" SET department = 'Sales' WHERE email = 'aashita@gmail.com' OR email = 'aashi@gmail.com';"))
            await conn.execute(text("UPDATE \"User\" SET department = 'Engineering' WHERE department IS NULL;"))
            
            print("OK: Updated User table and seeded default departments.")
            print("Migration completed successfully!")
        except Exception as e:
            print(f"Migration failed: {e}")

if __name__ == "__main__":
    asyncio.run(run_migration())
