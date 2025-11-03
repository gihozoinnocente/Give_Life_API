-- Create blood_inventory table
CREATE TABLE IF NOT EXISTS blood_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blood_type VARCHAR(5) NOT NULL CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    units_available INTEGER NOT NULL DEFAULT 0,
    units_used INTEGER DEFAULT 0,
    critical_level INTEGER DEFAULT 15,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_hospital_blood_type UNIQUE (hospital_id, blood_type)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_blood_inventory_hospital_id ON blood_inventory(hospital_id);
CREATE INDEX IF NOT EXISTS idx_blood_inventory_blood_type ON blood_inventory(blood_type);

-- Create trigger
DROP TRIGGER IF EXISTS update_blood_inventory_updated_at ON blood_inventory;
CREATE TRIGGER update_blood_inventory_updated_at BEFORE UPDATE ON blood_inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Initialize inventory for existing hospital (replace with your hospital ID)
-- Get your hospital ID by running: SELECT id, email FROM users WHERE role = 'hospital';

-- Example: Initialize inventory for a hospital
-- INSERT INTO blood_inventory (hospital_id, blood_type, units_available, critical_level)
-- VALUES 
--   ('YOUR_HOSPITAL_ID', 'O+', 50, 25),
--   ('YOUR_HOSPITAL_ID', 'O-', 15, 15),
--   ('YOUR_HOSPITAL_ID', 'A+', 40, 20),
--   ('YOUR_HOSPITAL_ID', 'A-', 12, 10),
--   ('YOUR_HOSPITAL_ID', 'B+', 35, 20),
--   ('YOUR_HOSPITAL_ID', 'B-', 10, 10),
--   ('YOUR_HOSPITAL_ID', 'AB+', 20, 15),
--   ('YOUR_HOSPITAL_ID', 'AB-', 8, 10)
-- ON CONFLICT (hospital_id, blood_type) DO NOTHING;

-- Or use this dynamic query to initialize for all hospitals:
INSERT INTO blood_inventory (hospital_id, blood_type, units_available, critical_level)
SELECT 
    u.id as hospital_id,
    bt.blood_type,
    CASE 
        WHEN bt.blood_type IN ('O+', 'A+') THEN 50
        WHEN bt.blood_type IN ('B+', 'AB+') THEN 30
        WHEN bt.blood_type IN ('O-', 'A-') THEN 15
        ELSE 10
    END as units_available,
    CASE 
        WHEN bt.blood_type IN ('O+', 'A+') THEN 25
        WHEN bt.blood_type IN ('B+', 'AB+') THEN 20
        ELSE 10
    END as critical_level
FROM users u
CROSS JOIN (
    VALUES ('A+'), ('A-'), ('B+'), ('B-'), ('AB+'), ('AB-'), ('O+'), ('O-')
) AS bt(blood_type)
WHERE u.role = 'hospital'
ON CONFLICT (hospital_id, blood_type) DO NOTHING;
