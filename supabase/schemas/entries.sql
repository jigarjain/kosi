CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- For UUID generation

CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  
  content BYTEA NOT NULL,
  iv BYTEA NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_entries_id ON entries(id);
CREATE INDEX idx_entries_page_id ON entries(page_id);

-- Enable Row Level Security (RLS)
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- Allow User Access Policies
CREATE POLICY "Allow User Access to Own Entry data"
ON entries
FOR SELECT USING (page_id IN (SELECT id FROM pages WHERE user_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID));
