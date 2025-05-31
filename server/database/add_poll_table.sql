-- Add poll votes table to the database

-- Add is_admin column to users table if it doesn't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Add is_banned column to users table if it doesn't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;

-- Create custom_polls table for admin-created polls
CREATE TABLE IF NOT EXISTS public.custom_polls (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    options TEXT[] NOT NULL,  -- Array of poll options
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create custom_poll_votes table for voting on custom polls
CREATE TABLE IF NOT EXISTS public.custom_poll_votes (
    id SERIAL PRIMARY KEY,
    poll_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    option_index INTEGER NOT NULL,  -- Index of the selected option
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (poll_id) REFERENCES public.custom_polls(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create unique constraint to prevent duplicate votes from same user for same poll
CREATE UNIQUE INDEX IF NOT EXISTS custom_poll_votes_user_poll_unique 
ON public.custom_poll_votes (user_id, poll_id);

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
CREATE INDEX IF NOT EXISTS custom_polls_created_by_idx ON public.custom_polls (created_by);
CREATE INDEX IF NOT EXISTS custom_poll_votes_poll_id_idx ON public.custom_poll_votes (poll_id);
CREATE INDEX IF NOT EXISTS custom_poll_votes_user_id_idx ON public.custom_poll_votes (user_id);

-- Grant permissions
ALTER TABLE public.poll_votes OWNER TO postgres;
ALTER TABLE public.custom_polls OWNER TO postgres;
ALTER TABLE public.custom_poll_votes OWNER TO postgres; 