-- Add thumbnail_url column to manuals table
ALTER TABLE public.manuals
ADD COLUMN thumbnail_url TEXT;

-- Set default thumbnail for existing manuals (optional)
UPDATE public.manuals
SET thumbnail_url = '/preview.png'
WHERE thumbnail_url IS NULL;