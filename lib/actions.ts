"use server"

import { AdminUserAttributes, User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "./supabaseServer";


export const createUser = async ({
  email, 
  password, 
  full_name,
  role = 'authenticated' // Default role
}: {
  email: string, 
  password: string, 
  full_name: string,
  role?: 'authenticated'
}) => {
    const supabase = await createSupabaseServerClient()
    
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email confirmation
      user_metadata: { full_name },
      role: role || "authenticated"
    })
    
    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create user');

    return authData.user;
}

export const updateUser = async (id: string, updates: AdminUserAttributes ) => {
    const supabase = await createSupabaseServerClient()

    const { role, ...rest } = updates
    
    // 1. Update auth user
    const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(id, rest)
    
    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to update user');
    
    return authData.user;
}

export const deleteUser = async (id: string) => {
    const supabase = await createSupabaseServerClient()

    // 2. Delete user profile
    const { error: authError } = await supabase.auth.admin.deleteUser(id)
    
    if (authError) throw authError;


    
    return true;
}

