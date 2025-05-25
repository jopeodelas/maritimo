-- Add poll votes table to the database

-- Create poll_votes table
CREATE TABLE IF NOT EXISTS public.poll_votes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    position_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create unique constraint to prevent duplicate votes from same user for same position
CREATE UNIQUE INDEX IF NOT EXISTS poll_votes_user_position_unique 
ON public.poll_votes (user_id, position_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS poll_votes_user_id_idx ON public.poll_votes (user_id);
CREATE INDEX IF NOT EXISTS poll_votes_position_id_idx ON public.poll_votes (position_id);

-- Grant permissions
ALTER TABLE public.poll_votes OWNER TO postgres; 