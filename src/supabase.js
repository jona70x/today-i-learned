import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xqfarinlmqkhlrosatsu.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxZmFyaW5sbXFraGxyb3NhdHN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzkwMDQ1NzksImV4cCI6MTk5NDU4MDU3OX0.FTGjz71KUJL1qDTjO1OcOFlCHwVqgndoF0_M45IsIjM";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
