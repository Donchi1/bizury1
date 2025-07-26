import { z } from "zod"
import { supabase } from "./supabase"
import { Profile } from "./types"
import { useSessionStore } from "./store/sessionStore"


export async function signUp(email: string, password: string, fullName: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) throw error

    // Create profile (in preview mode, this will be mocked)
    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        email: data.user.email!,
        full_name: fullName,
        phone: "",
        postal_code: "",
        gender: "other",
        address: "",
        avatar_url: "",
        created_at: new Date().toDateString(),
        is_verified: false,
        role: "customer",
        status: "active",
        withdrawal_pin: "",
        username: email.split("@")[0],
        wallet_balance: 0,
        state: "",
        country: "",
        date_of_birth: "",
        referred_by: "",
        city: "",
        preferred_currency: "USD",
        language: "en"
      } as Profile)

      if (profileError && !profileError.message.includes("Preview mode")) {
        throw profileError
      }
    }

    return data
  } catch (error) {
    throw error
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    useSessionStore.getState().trackUserLogin(data.user!.id)
    return data
  } catch (error) {
    console.error("SignIn error:", error)
    throw error
  }
}

export async function verifyEmail(token: string) {

  try {
    const user = await getCurrentUser()
    if ((user && user.email_confirmed_at) && new Date(user.email_confirmed_at).getTime() > new Date().getTime()) {
      throw new Error("Email already verified")
    }
    const userEmail = localStorage.getItem("userEmail")
    if (!userEmail) {
      throw new Error("User not found")
    }
    const { data, error } = await supabase.auth.verifyOtp({ email: userEmail as string, token, type: "signup" })
    if (error) throw error
    localStorage.removeItem("userEmail")
    return data
  } catch (error) {
    throw error
  }
}


export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    throw error
  }
}

export async function getCurrentUser() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  } catch (error) {
    return null
  }
}

export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error && !error.message.includes("Preview mode")) {
      return null
    }
    return data
  } catch (error) {
    return null
  }
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  try {
    const { data, error } = await supabase.from("profiles").update(updates).eq("id", userId).select().single()
    if (error && !error.message.includes("Preview mode")) {
      throw error
    }
    return data as Profile
  } catch (error) {
    console.error("UpdateProfile error:", error)
    throw error
  }
}



export const updatePassword = async (email: string, currentPassword: string, newPassword: string, callback: () => void) => {
  try {
    // Re-authenticate user

    const recentPassword = newPassword
   
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    })
    if (signInError) {
      throw signInError
    }
    callback()
    // Update password
    const { error: updateError, data } = await supabase.auth.updateUser({
      password: recentPassword,
    })
    if (updateError) {
      console.log(updateError)
      throw updateError
    }
    return data.user 
  } catch (error: any) {
    console.log("Password update error:", error)
    throw error
  }
}
