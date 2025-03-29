CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- For UUID generation

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,

  encrypted_dek_mk BYTEA NOT NULL,
  iv_mk BYTEA NOT NULL,

  encrypted_dek_rk BYTEA NOT NULL,
  iv_rk BYTEA NOT NULL,

  password_salt BYTEA NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Pages table to store document/note pages
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  
  entries TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  
  -- Encryption related fields
  content BYTEA NOT NULL,
  iv BYTEA NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_id ON users(id);
CREATE INDEX idx_pages_id ON pages(id);
CREATE INDEX idx_pages_user_id ON pages(user_id);
CREATE INDEX idx_pages_user_id_slug ON pages(user_id, slug);
CREATE INDEX idx_entries_id ON entries(id);
CREATE INDEX idx_entries_page_id ON entries(page_id);


-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- Allow User Access Policies
CREATE POLICY "Allow User Access to Own User data"
ON users
FOR SELECT USING (id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID);

CREATE POLICY "Allow User Access to Own Page data"
ON pages
FOR SELECT USING (user_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID);

CREATE POLICY "Allow User Access to Own Entry data"
ON entries
FOR SELECT USING (page_id IN (SELECT id FROM pages WHERE user_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID));
