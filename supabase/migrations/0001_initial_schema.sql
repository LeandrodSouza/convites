-- Create Gifts Table
CREATE TABLE gifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    link TEXT,
    image_path TEXT,
    taken BOOLEAN DEFAULT FALSE,
    taken_by TEXT,
    taken_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create Invites Table
CREATE TABLE invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT UNIQUE NOT NULL,
    email TEXT,
    name TEXT,
    confirmed BOOLEAN DEFAULT FALSE,
    gift_id UUID REFERENCES gifts(id),
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY, -- Comes from Supabase Auth
    email TEXT UNIQUE,
    display_name TEXT,
    photo_url TEXT,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    selected_gifts UUID[],
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create Email Logs Table
CREATE TABLE email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT,
    recipient_email TEXT,
    status TEXT, -- success, error
    error TEXT,
    sent_at TIMESTAMPTZ DEFAULT now()
);

-- Create Event Settings Table
CREATE TABLE event_settings (
    id INT PRIMARY KEY DEFAULT 1,
    address TEXT,
    latitude TEXT,
    longitude TEXT,
    event_date DATE,
    event_time TIME,
    require_approval BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_settings ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Gifts: Authenticated users can read. All writes are done by the backend.
CREATE POLICY "Allow read access to authenticated users" ON gifts
FOR SELECT
TO authenticated
USING (true);

-- Invites: All access is through the backend.
-- No policies needed, as by default, access is denied.

-- Users: Users can read and update their own data.
CREATE POLICY "Allow users to read their own data" ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Allow users to update their own data" ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Email Logs: Authenticated users can read. All writes are done by the backend.
CREATE POLICY "Allow read access to authenticated users" ON email_logs
FOR SELECT
TO authenticated
USING (true);

-- Event Settings: Authenticated users can read. All writes are done by the backend.
CREATE POLICY "Allow read access to authenticated users" ON event_settings
FOR SELECT
TO authenticated
USING (true);
