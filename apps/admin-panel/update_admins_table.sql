-- Update admins table to add missing columns
-- Run this in your Supabase SQL editor

-- Add organization and phone columns to admins table
ALTER TABLE public.admins 
ADD COLUMN IF NOT EXISTS organization TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Update the default admin record if it exists
UPDATE public.admins 
SET organization = 'Emergency Response System', 
    phone = '+91-0000000000'
WHERE email = 'advancesossystem@gmail.com';

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'admins' 
AND table_schema = 'public'
ORDER BY ordinal_position; 