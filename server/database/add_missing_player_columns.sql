-- Add missing columns to players table
-- This migration adds the image_data and image_mime columns that the PlayerModel expects

-- Add image_data column (for storing image as BYTEA)
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS image_data BYTEA;

-- Add image_mime column (for storing image MIME type)
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS image_mime VARCHAR(100);

-- Add index for better performance when querying image data
CREATE INDEX IF NOT EXISTS idx_players_image_data 
ON public.players (image_data) 
WHERE image_data IS NOT NULL;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'players'
  AND column_name IN ('image_data', 'image_mime')
ORDER BY column_name;

-- Final verification: show all columns in players table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'players'
ORDER BY ordinal_position; 