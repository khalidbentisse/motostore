
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wniwqxfeprjcjertvwug.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduaXdxeGZlcHJqY2plcnR2d3VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MDc5OTQsImV4cCI6MjA3OTM4Mzk5NH0.98Tmg8jLb0lQe_NVSIL8_L7c22RIXR-y-bqSkU92x3w';

export const supabase = createClient(supabaseUrl, supabaseKey);
