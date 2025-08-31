-- Migration to add subjects table with default data
-- Run this in your Supabase SQL Editor

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT 'bg-blue-500',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_id TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can only see their own subjects" ON subjects
    FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can only insert their own subjects" ON subjects
    FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can only update their own subjects" ON subjects
    FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can only delete their own subjects" ON subjects
    FOR DELETE USING (user_id = auth.jwt() ->> 'sub');

-- Create indexes for better performance
CREATE INDEX idx_subjects_user_id ON subjects (user_id);
CREATE INDEX idx_subjects_code ON subjects (code);

-- Insert default subjects for all existing users (you may want to customize this)
-- Note: Replace 'your-github-user-id' with your actual GitHub user ID
-- You can find your user ID by checking the user_files table or by logging in and checking the JWT token

INSERT INTO subjects (name, code, color, user_id) VALUES 
    ('Computer Science', 'CS101', 'bg-blue-500', 'your-github-user-id'),
    ('Mathematics', 'MATH201', 'bg-green-500', 'your-github-user-id'),
    ('Physics', 'PHY301', 'bg-purple-500', 'your-github-user-id'),
    ('Chemistry', 'CHEM201', 'bg-orange-500', 'your-github-user-id'),
    ('English Literature', 'ENG101', 'bg-red-500', 'your-github-user-id'),
    ('History', 'HIST101', 'bg-indigo-500', 'your-github-user-id')
ON CONFLICT (code) DO NOTHING;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_subjects_updated_at 
    BEFORE UPDATE ON subjects 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
