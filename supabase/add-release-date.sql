-- Add release_date column to manuals table
ALTER TABLE manuals ADD COLUMN release_date date;

-- Optionally, set a default value for existing rows (e.g., use created_at date)
UPDATE manuals SET release_date = created_at::date WHERE release_date IS NULL;