-- Add folder column to files table
ALTER TABLE files ADD COLUMN folder TEXT DEFAULT 'general';

-- Add index for folder queries
CREATE INDEX idx_files_folder ON files(folder);

-- Create subjects table
CREATE TABLE subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, code)
);

-- Add indexes for subjects table
CREATE INDEX idx_subjects_user_id ON subjects(user_id);
CREATE INDEX idx_subjects_code ON subjects(code);

-- Enable Row Level Security for subjects
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subjects table
CREATE POLICY "Users can view own subjects" ON subjects
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert own subjects" ON subjects
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own subjects" ON subjects
  FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can delete own subjects" ON subjects
  FOR DELETE USING (user_id = auth.jwt() ->> 'sub');

-- Insert default subjects for demonstration (these will be user-specific)
-- Users can delete these and add their own
