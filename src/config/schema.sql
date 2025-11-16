-- Blood Donation App Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (main authentication table)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('donor', 'hospital', 'admin', 'rbc', 'ministry')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Donor profiles table
CREATE TABLE IF NOT EXISTS donor_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    age INTEGER NOT NULL,
    blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pin_code VARCHAR(20) NOT NULL,
    last_donation_month VARCHAR(20),
    last_donation_year VARCHAR(4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hospital profiles table
CREATE TABLE IF NOT EXISTS hospital_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hospital_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    head_of_hospital VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    district VARCHAR(100),
    state VARCHAR(100),
    pin_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin profiles table
CREATE TABLE IF NOT EXISTS admin_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RBC (Rwanda Biomedical Center) profiles table
CREATE TABLE IF NOT EXISTS rbc_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    office_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ministry profiles table
CREATE TABLE IF NOT EXISTS ministry_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_donor_profiles_user_id ON donor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_donor_profiles_blood_group ON donor_profiles(blood_group);
CREATE INDEX IF NOT EXISTS idx_hospital_profiles_user_id ON hospital_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_user_id ON admin_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_rbc_profiles_user_id ON rbc_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_ministry_profiles_user_id ON ministry_profiles(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at (drop if exists first)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Events table (for community)
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    organizer VARCHAR(255) NOT NULL,
    attendees INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer);

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Community posts table
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'story',
    likes INTEGER NOT NULL DEFAULT 0,
    comments INTEGER NOT NULL DEFAULT 0,
    image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_community_posts_author_id ON community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at);

DROP TRIGGER IF EXISTS update_community_posts_updated_at ON community_posts;
CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON community_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_donor_profiles_updated_at ON donor_profiles;
CREATE TRIGGER update_donor_profiles_updated_at BEFORE UPDATE ON donor_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hospital_profiles_updated_at ON hospital_profiles;
CREATE TRIGGER update_hospital_profiles_updated_at BEFORE UPDATE ON hospital_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_profiles_updated_at ON admin_profiles;
CREATE TRIGGER update_admin_profiles_updated_at BEFORE UPDATE ON admin_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rbc_profiles_updated_at ON rbc_profiles;
CREATE TRIGGER update_rbc_profiles_updated_at BEFORE UPDATE ON rbc_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ministry_profiles_updated_at ON ministry_profiles;
CREATE TRIGGER update_ministry_profiles_updated_at BEFORE UPDATE ON ministry_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Blood requests table
CREATE TABLE IF NOT EXISTS blood_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hospital_name VARCHAR(255) NOT NULL,
    blood_type VARCHAR(5) NOT NULL CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    units_needed INTEGER NOT NULL CHECK (units_needed > 0),
    urgency VARCHAR(20) NOT NULL CHECK (urgency IN ('critical', 'urgent', 'normal')),
    patient_condition TEXT NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    location VARCHAR(255) NOT NULL,
    additional_notes TEXT,
    expiry_date TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'expired')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL DEFAULT 'blood_request',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    blood_request_id UUID REFERENCES blood_requests(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for notifications and blood requests
CREATE INDEX IF NOT EXISTS idx_blood_requests_hospital_id ON blood_requests(hospital_id);
CREATE INDEX IF NOT EXISTS idx_blood_requests_blood_type ON blood_requests(blood_type);
CREATE INDEX IF NOT EXISTS idx_blood_requests_status ON blood_requests(status);
CREATE INDEX IF NOT EXISTS idx_blood_requests_urgency ON blood_requests(urgency);
CREATE INDEX IF NOT EXISTS idx_blood_requests_expiry_date ON blood_requests(expiry_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_blood_request_id ON notifications(blood_request_id);

-- Trigger for blood_requests updated_at
DROP TRIGGER IF EXISTS update_blood_requests_updated_at ON blood_requests;
CREATE TRIGGER update_blood_requests_updated_at BEFORE UPDATE ON blood_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hospital_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time VARCHAR(20) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('regular', 'platelet', 'plasma', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_hospital_date_time UNIQUE (hospital_id, date, time, status)
);

-- Create indexes for appointments
CREATE INDEX IF NOT EXISTS idx_appointments_donor_id ON appointments(donor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_hospital_id ON appointments(hospital_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_hospital_date ON appointments(hospital_id, date);

-- Trigger for appointments updated_at
DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Donations table (tracks each donation event)
CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hospital_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date TIMESTAMP NOT NULL,
    blood_type VARCHAR(5) NOT NULL CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    units INTEGER NOT NULL CHECK (units > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'cancelled')),
    certificate TEXT,
    impact INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for donations
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_hospital_id ON donations(hospital_id);
CREATE INDEX IF NOT EXISTS idx_donations_date ON donations(date);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_blood_type ON donations(blood_type);

-- Trigger for donations updated_at
DROP TRIGGER IF EXISTS update_donations_updated_at ON donations;
CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON donations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Donor badges table (earned achievements)
CREATE TABLE IF NOT EXISTS donor_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_key VARCHAR(100) NOT NULL,
    earned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    meta JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_donor_badge UNIQUE (donor_id, badge_key)
);

-- Indexes for donor_badges
CREATE INDEX IF NOT EXISTS idx_donor_badges_donor_id ON donor_badges(donor_id);
CREATE INDEX IF NOT EXISTS idx_donor_badges_badge_key ON donor_badges(badge_key);

-- Trigger for donor_badges updated_at
DROP TRIGGER IF EXISTS update_donor_badges_updated_at ON donor_badges;
CREATE TRIGGER update_donor_badges_updated_at BEFORE UPDATE ON donor_badges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Blood inventory table
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

-- Create indexes for blood_inventory
CREATE INDEX IF NOT EXISTS idx_blood_inventory_hospital_id ON blood_inventory(hospital_id);
CREATE INDEX IF NOT EXISTS idx_blood_inventory_blood_type ON blood_inventory(blood_type);

-- Trigger for blood_inventory updated_at
DROP TRIGGER IF EXISTS update_blood_inventory_updated_at ON blood_inventory;
CREATE TRIGGER update_blood_inventory_updated_at BEFORE UPDATE ON blood_inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Hospital-Donor memberships (donor opt-in to be discoverable by a hospital)
CREATE TABLE IF NOT EXISTS hospital_donor_memberships (
    donor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hospital_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    consented BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (donor_id, hospital_id)
);

-- Indexes for memberships
CREATE INDEX IF NOT EXISTS idx_memberships_hospital_id ON hospital_donor_memberships(hospital_id);
CREATE INDEX IF NOT EXISTS idx_memberships_donor_id ON hospital_donor_memberships(donor_id);

-- Hospital health records table (per-donor clinical information captured by hospitals)
CREATE TABLE IF NOT EXISTS hospital_health_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    donor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_name TEXT,
    blood_type VARCHAR(5),
    status VARCHAR(20) DEFAULT 'stable',
    last_visit TIMESTAMP,
    age INTEGER,
    weight NUMERIC,
    height NUMERIC,
    temperature NUMERIC,
    blood_pressure TEXT,
    heart_rate INTEGER,
    hemoglobin NUMERIC,
    average_hemoglobin NUMERIC,
    allergies TEXT,
    medications TEXT,
    chronic_conditions TEXT,
    hospital_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for hospital_health_records
CREATE INDEX IF NOT EXISTS idx_hospital_health_records_hospital_id ON hospital_health_records(hospital_id);
CREATE INDEX IF NOT EXISTS idx_hospital_health_records_donor_id ON hospital_health_records(donor_id);
CREATE INDEX IF NOT EXISTS idx_hospital_health_records_status ON hospital_health_records(status);

-- Trigger for hospital_health_records updated_at
DROP TRIGGER IF EXISTS update_hospital_health_records_updated_at ON hospital_health_records;
CREATE TRIGGER update_hospital_health_records_updated_at BEFORE UPDATE ON hospital_health_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
