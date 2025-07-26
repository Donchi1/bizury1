
import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "@supabase/supabase-js"
import type { Profile as SupaProfile } from "../types"
import { getRandomAvataaarsUrl } from "../utils"

/* -------------------------------------------------------------------------- */
/*                              AUTH - ZUSTAND                                */
/* -------------------------------------------------------------------------- */
interface AuthState {
  user: User | null
  profile: SupaProfile | null
  loading: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: SupaProfile | null) => void
  setLoading: (value: boolean) => void
  clearAuth: () => void

}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      loading: false,
      setUser: (user) => set({ user }),
      setProfile: (profile) => {
        if (!profile?.avatar_url) {
          const avaterUrl = getRandomAvataaarsUrl()
          set({ profile: { ...profile!, avatar_url: avaterUrl } })
        } else {
          set(
            { profile })
        }
      },
      clearAuth: () => set({ user: null, profile: null }),
      setLoading: (value) => set({ loading: value })
    }),
    { name: "auth-storage" },
  ),
)


