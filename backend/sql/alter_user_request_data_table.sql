-- Add missing columns to user_request_data table to support full application data

-- Add purpose column for research purpose
ALTER TABLE user_request_data 
ADD COLUMN IF NOT EXISTS purpose TEXT;

-- Add organization column for user's institution
ALTER TABLE user_request_data 
ADD COLUMN IF NOT EXISTS organization VARCHAR(255);

-- Add contact_email column for contact information
ALTER TABLE user_request_data 
ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);

-- Add additional_info column for extra information
ALTER TABLE user_request_data 
ADD COLUMN IF NOT EXISTS additional_info TEXT;

-- Add comments for the new columns
COMMENT ON COLUMN user_request_data.purpose IS 'Research purpose for the data request';
COMMENT ON COLUMN user_request_data.organization IS 'User organization/institution';
COMMENT ON COLUMN user_request_data.contact_email IS 'Contact email for the request';
COMMENT ON COLUMN user_request_data.additional_info IS 'Additional information provided by user';

-- Update existing records to have NULL for new fields (they will be NULL by default)
-- No action needed as ALTER TABLE with ADD COLUMN sets NULL for existing records

-- Show the updated table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_request_data' 
ORDER BY ordinal_position; 