-- Add step fields to manuals table
ALTER TABLE manuals 
ADD COLUMN step_number INTEGER,
ADD COLUMN step_name TEXT;

-- Create index for step_number to improve query performance
CREATE INDEX idx_manuals_step_number ON manuals(step_number);

-- Add index for combination of main_category and step_number for efficient filtering
CREATE INDEX idx_manuals_category_step ON manuals(main_category, step_number);