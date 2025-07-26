

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vafizfllkkrsdxepqdik.supabase.co"
const supabaseAnon =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhZml6Zmxsa2tyc2R4ZXBxZGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4MjU2NzQsImV4cCI6MjA1MDQwMTY3NH0.mock-key-for-preview"

export { supabaseUrl, supabaseAnon }
