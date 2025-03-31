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

  hashed_authkey BYTEA NOT NULL,
  authkey_salt BYTEA NOT NULL,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_id ON users(id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow User Access Policies
CREATE POLICY "Allow User Access to Own User data"
ON users
FOR SELECT USING (id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID);