-- Add folder column to files table
ALTER TABLE files ADD COLUMN folder TEXT DEFAULT 'general';

-- Add index for folder queries
CREATE INDEX idx_files_folder ON files(folder);

-- Update existing RLS policies to include folder access
-- (The existing policies will continue to work as they only check user_id)
