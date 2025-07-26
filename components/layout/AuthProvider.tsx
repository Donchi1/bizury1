"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { getProfile } from "@/lib/auth"
import { useAuthStore } from "@/lib/store/auth"
import { Header } from "./header"
import { Footer } from "./footer"
import { Loading } from "../ui/loading"
import { User } from "@supabase/supabase-js"

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { setUser, setProfile, clearAuth, setLoading, loading } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const syncSession = async (sessionUser: User | null) => {
      if (!sessionUser) {
        clearAuth()
        setLoading(false)
        return
      }
  
      setLoading(true)
      setUser(sessionUser)
      const profile = await getProfile(sessionUser.id)
      if (profile) setProfile(profile)
      setLoading(false)
    }
  
    const loadUser = async () => {
      setLoading(true)
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        clearAuth()
        setLoading(false)
        return
      }
      await syncSession(user)
    }
  
    loadUser()
  
    // const { data: { subscription } } = supabase.auth.onAuthStateChange(
    //   async (_, session) => {
    //     await syncSession(session?.user ?? null)
    //   }
    // )
  
    // return () => subscription.unsubscribe()
  }, [setUser, setProfile, setLoading])
  

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading variant="dots" size="lg" text="Loading..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

export default AuthProvider
