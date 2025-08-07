-- Create the user_request_data table for data access requests
CREATE TABLE IF NOT EXISTS user_request_data (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL
                   REFERENCES users(id)
                   ON DELETE CASCADE,
  data_name     VARCHAR(255) NOT NULL,
  purpose       TEXT NOT NULL,
  organization  VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  additional_info TEXT,
  requested_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_approved   BOOLEAN DEFAULT NULL,           -- NULL = pending, TRUE = approved, FALSE = rejected
  reviewed_at   TIMESTAMPTZ NULL,               -- review timestamp
  reviewed_by   INTEGER NULL
                   REFERENCES users(id)
                   ON DELETE SET NULL        -- reviewer user id
);

-- Create index for user_id to optimize user-specific queries
CREATE INDEX IF NOT EXISTS idx_user_request_data_user_id
  ON user_request_data(user_id);

-- Create index for approval status to optimize admin queries
CREATE INDEX IF NOT EXISTS idx_user_request_data_approval
  ON user_request_data(is_approved);

-- Create index for data_name to optimize queries by dataset
CREATE INDEX IF NOT EXISTS idx_user_request_data_name
  ON user_request_data(data_name);

-- Add comments to the table and columns
COMMENT ON TABLE user_request_data IS 'Stores user requests for dataset access';
COMMENT ON COLUMN user_request_data.id IS 'Primary key';
COMMENT ON COLUMN user_request_data.user_id IS 'ID of the user making the request';
COMMENT ON COLUMN user_request_data.data_name IS 'Name of the requested dataset';
COMMENT ON COLUMN user_request_data.purpose IS 'Research purpose for the data request';
COMMENT ON COLUMN user_request_data.organization IS 'User organization/institution';
COMMENT ON COLUMN user_request_data.contact_email IS 'Contact email for the request';
COMMENT ON COLUMN user_request_data.additional_info IS 'Additional information provided by user';
COMMENT ON COLUMN user_request_data.requested_at IS 'Timestamp when request was submitted';
COMMENT ON COLUMN user_request_data.is_approved IS 'Approval status: NULL=pending, TRUE=approved, FALSE=rejected';
COMMENT ON COLUMN user_request_data.reviewed_at IS 'Timestamp when request was reviewed';
COMMENT ON COLUMN user_request_data.reviewed_by IS 'ID of the admin who reviewed the request'; 