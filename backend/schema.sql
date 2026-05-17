-- AtomQuest Portal: Complete Database Schema

-- Drop existing tables (COMMENTED OUT TO PRESERVE DATA)
-- DROP TABLE IF EXISTS "GoalCheckin" CASCADE;
-- DROP TABLE IF EXISTS "GoalAchievement" CASCADE;
-- DROP TABLE IF EXISTS "Goal" CASCADE;
-- DROP TABLE IF EXISTS "ThrustArea" CASCADE;
-- DROP TABLE IF EXISTS "User" CASCADE;
-- DROP TABLE IF EXISTS "Role" CASCADE;

-- Table: Role
CREATE TABLE IF NOT EXISTS "Role" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Table: User
CREATE TABLE IF NOT EXISTS "User" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES "Role"(id) ON DELETE SET NULL,
    manager_id INTEGER REFERENCES "User"(id) ON DELETE SET NULL
);

-- Table: ThrustArea
CREATE TABLE IF NOT EXISTS "ThrustArea" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT
);

-- Table: Goal
CREATE TABLE IF NOT EXISTS "Goal" (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    thrust_area_id INTEGER NOT NULL REFERENCES "ThrustArea"(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target DECIMAL(15, 2) NOT NULL,
    weight INTEGER NOT NULL,
    uom VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: GoalAchievement
CREATE TABLE IF NOT EXISTS "GoalAchievement" (
    id SERIAL PRIMARY KEY,
    goal_id INTEGER NOT NULL REFERENCES "Goal"(id) ON DELETE CASCADE,
    quarter VARCHAR(10) NOT NULL,
    actual_value DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: GoalCheckin
CREATE TABLE IF NOT EXISTS "GoalCheckin" (
    id SERIAL PRIMARY KEY,
    goal_id INTEGER NOT NULL REFERENCES "Goal"(id) ON DELETE CASCADE,
    manager_id INTEGER NOT NULL REFERENCES "User"(id),
    checkin_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating timestamps
DROP TRIGGER IF EXISTS update_goal_modtime ON "Goal";
CREATE TRIGGER update_goal_modtime BEFORE UPDATE ON "Goal" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_achievement_modtime ON "GoalAchievement";
CREATE TRIGGER update_achievement_modtime BEFORE UPDATE ON "GoalAchievement" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_checkin_modtime ON "GoalCheckin";
CREATE TRIGGER update_checkin_modtime BEFORE UPDATE ON "GoalCheckin" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
