import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://eoiqxmwqjttxtsxxmgms.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvaXF4bXdxanR0eHRzeHhtZ21zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NjA5MjMsImV4cCI6MjA3OTMzNjkyM30.igJDHT37NfneynJ45t1IBdz3gqjnXrqUrT8KmsntEr8'

export const supabase = createClient(supabaseUrl, supabaseKey)
