import { create } from "zustand"
import { supabase } from "../supabase"
import { useNotificationStore } from "./notificationStore"
import { Recharge } from "../types"




interface rechargeState {
  recharges: Recharge[]
  loading: boolean
  createRecharge: (p: Omit<Recharge, 'id'>) => Promise<void>
  updateRecharge: (id: string, updates: Partial<Recharge>) => Promise<void>
  deleteRecharge: (id: string) => Promise<void>
  getRechargesByUser: (user_id: string) => Promise<void >
  getRechargesByStatus: (status: Recharge["status"]) => Recharge[]
  setLoading: (loading: boolean) => void
}

export const useRechargeStore = create<rechargeState>()(
  (set, get) => ({
    recharges: [],
    loading: false,
    createRecharge: async (p) => {
      set({ loading: true })
      try {
          const { data, error } = await supabase.from("recharges").insert(p).select().single()
          if (error) {
              set({ loading: false })
              throw error
          }
          set({ recharges: [data, ...get().recharges], loading: false })
          // Send notification to user
          if (p.user_id) {
            const { createNotification } = useNotificationStore.getState()
            await createNotification({
              user_id: p.user_id,
              type: "payment",
              title: "Recharge Initiated",
              message: `Your recharge of ${p.amount} ${p.currency} has been initiated.`,
              data: { rechargeId: data.id },
            })
          }
      } catch (error) {
         set({ loading: false })
         throw  error
      }
    },
    updateRecharge: async (id, updates) => {
      set({ loading: true })
      const { data, error } = await supabase.from("recharges").update(updates).eq("id", id).select().single()
      if (error) {
        set({loading: false})
        throw error
      }
        set({
          recharges: get().recharges.map((p) =>
            p.id === id ? { ...p, ...data, updated_at: new Date().toISOString() } : p
          ),
          loading: false
        })
    },
    deleteRecharge: async (id) => {
      set({ loading: true })
      const { error } = await supabase.from("recharges").delete().eq("id", id)
      if (error) {
        set({loading: false})
        throw error
      }
      set({ recharges: get().recharges.filter((p) => p.id !== id), loading: false })
    },
    getRechargesByUser: async(user_id) => {
        set({loading: true})
        try {
            const {data, error} = await supabase.from("recharges").select().eq("user_id", user_id).order("id", { ascending: false })
            if(error){
              set({loading: false})
              throw error
            }
            set({recharges: data, loading: false })
        } catch (error) {
            set({loading: false})
            throw error
        }
    },
    getRechargesByStatus: (status) => get().recharges.filter((p) => p.status === status),
    setLoading: (loading) => set({ loading }),
  })
) 