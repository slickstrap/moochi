import { createClient } from '@supabase/supabase-js';


const supabaseUrl = 'https://mwwzzmxybsefpejovmam.supabase.co'; // ✅ Note: .co NOT .com
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13d3p6bXh5YnNlZnBlam92bWFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MDEwNTgsImV4cCI6MjA2ODQ3NzA1OH0.rKfOPHMqowmA-rddIwV4UBXPP103ck_XGRjCebhgIsk';

export const supabase = createClient(supabaseUrl, supabaseKey);
