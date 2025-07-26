
import { createBrowserClient } from "@supabase/ssr"
import { supabaseAnon, supabaseUrl } from "./config"


export const supabase = createBrowserClient(supabaseUrl, supabaseAnon)

