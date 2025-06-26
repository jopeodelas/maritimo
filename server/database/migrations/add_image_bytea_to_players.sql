-- Add BYTEA columns for storing images directly in database
-- This resolves Vercel's read-only filesystem limitations

ALTER TABLE players
ADD COLUMN image_data BYTEA,
ADD COLUMN image_mime TEXT;

-- Add index for performance when serving images
CREATE INDEX idx_players_image_data ON players(id) WHERE image_data IS NOT NULL;

COMMENT ON COLUMN players.image_data IS 'Binary image data stored directly in database';
COMMENT ON COLUMN players.image_mime IS 'MIME type of the stored image (e.g., image/jpeg, image/png)'; 