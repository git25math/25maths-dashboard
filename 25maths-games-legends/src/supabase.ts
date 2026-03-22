import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jjjigohjvmyewasmmmyf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impqamlnb2hqdm15ZXdhc21tbXlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzOTgzNDYsImV4cCI6MjA4Njk3NDM0Nn0.P2L7t9v7Cj89vwkPHjRyp-h70Mawwov6mHyw7u6ALcY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
