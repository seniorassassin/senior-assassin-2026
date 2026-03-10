// @ts-nocheck
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://qgwvtpuvinvjrmipixcv.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnd3Z0cHV2aW52anJtaXBpeGN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwOTMwNzIsImV4cCI6MjA4ODY2OTA3Mn0.DW8pjkC4ysQP8tL6P1shbziP77F5VJ-JWiNDZVtfx9M'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
