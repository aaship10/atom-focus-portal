import asyncio
from sqlalchemy.future import select
from database import AsyncSessionLocal
from models import Role, ThrustArea

async def seed_data():
    print("Seeding database...")
    async with AsyncSessionLocal() as db:
        try:
            # Seed Roles
            roles_to_insert = ["Employee", "Manager", "Admin"]
            for role_name in roles_to_insert:
                result = await db.execute(select(Role).where(Role.name == role_name))
                if not result.scalars().first():
                    db.add(Role(name=role_name))
            
            # Seed Thrust Areas
            thrust_areas_to_insert = ["Sales", "Innovation", "Product", "Growth"]
            for ta_name in thrust_areas_to_insert:
                result = await db.execute(select(ThrustArea).where(ThrustArea.name == ta_name))
                if not result.scalars().first():
                    db.add(ThrustArea(name=ta_name))
            
            await db.commit()
            print("Default Roles and Thrust Areas seeded successfully!")
        except Exception as e:
            await db.rollback()
            print(f"Failed to seed database: {e}")

if __name__ == "__main__":
    asyncio.run(seed_data())
