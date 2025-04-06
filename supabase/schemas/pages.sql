CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- For UUID generation


-- Pages table to store document/note pages
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pages_id ON pages(id);
CREATE INDEX idx_pages_user_id ON pages(user_id);
CREATE INDEX idx_pages_user_id_date ON pages(user_id, created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Allow User Access Policies
CREATE POLICY "Allow User Access to Own Page data"
ON pages
FOR SELECT USING (user_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID);
