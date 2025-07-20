-- Fix missing foreign key constraints for sos_events table
-- This script should be run on your existing Supabase database

-- Add foreign key constraint for assigned_helper_id
ALTER TABLE public.sos_events 
ADD CONSTRAINT fk_sos_events_assigned_helper_id 
FOREIGN KEY (assigned_helper_id) REFERENCES public.helpers(id) ON DELETE SET NULL;

-- Add foreign key constraint for assigned_responder_id
ALTER TABLE public.sos_events 
ADD CONSTRAINT fk_sos_events_assigned_responder_id 
FOREIGN KEY (assigned_responder_id) REFERENCES public.responders(id) ON DELETE SET NULL;

-- Verify the constraints were added
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'sos_events'
    AND (kcu.column_name = 'assigned_helper_id' OR kcu.column_name = 'assigned_responder_id'); 