import { create } from "zustand"
import { supabase } from "../supabase"
import { Withdrawal } from "../types"



interface WithdrawalState {
    withdrawals: Withdrawal[]
    loading: boolean
    createWithdrawal: (w: Omit<Withdrawal, "id">) => Promise<void>
    updateWithdrawal: (id: string, updates: Partial<Withdrawal>) => Promise<void>
    deleteWithdrawal: (id: string) => Promise<void>
    getWithdrawalsByUser: (user_id: string) => Promise<void>
    getSingleWithdrawal: (id: string) => Withdrawal | null
    getWithdrawalsByMethod: (method: Withdrawal["method"]) => Withdrawal[]
    getWithdrawalsByStatus: (status: Withdrawal["status"]) => Withdrawal[]
    setLoading: (loading: boolean) => void
}

export const useWithdrawalStore = create<WithdrawalState>()(
    (set, get) => ({
        withdrawals: [],
        loading: false,
        createWithdrawal: async (w) => {
            set({ loading: true })
            try {
                const { error } = await supabase.from("withdrawals").insert(w)
                if (error) {
                    set({loading: false})
                    throw error
                }
                set({ withdrawals: [w as Withdrawal, ...get().withdrawals], loading: false })
            } catch (error) {
                set({loading: false})
                throw error
            } 
        },
        updateWithdrawal: async (id, updates) => {
            set({ loading: true })
            try {
                const { error } = await supabase.from("withdrawals").update(updates).eq("id", id)
                if (error){
                    set({loading: false})
                    throw error
                }
                set({
                    withdrawals: get().withdrawals.map((w) =>
                        w.id === id ? { ...w, ...updates, updated_at: new Date().toISOString() } : w
                    ),
                    loading: false
                })

            } catch (error) {
                set({loading: false})
                throw error
            } 
        },
        deleteWithdrawal: async (id) => {
            set({ loading: true })
            try {
                const { error } = await supabase.from("withdrawals").delete().eq("id", id)
                if (error) {
                    set({loading: false})
                    throw error
                }
                set({ withdrawals: get().withdrawals.filter((w) => w.id !== id), loading: false })

            } catch (error) {
                set({loading: false})
                throw error
            } 
        },
        getWithdrawalsByUser: async (user_id) => {
            set({loading: true})
            try {
                const {data, error} = await supabase.from("withdrawals").select().eq("user_id", user_id).order("id", { ascending: false })
                if(error){
                  set({loading: false})
                  throw error
                }
                set({withdrawals: data, loading: false })
            } catch (error) {
                set({loading: false})
                throw error
            }
        },
        getSingleWithdrawal: (withdrawalId) => get().withdrawals.find((w) => w.id === withdrawalId)!,
        getWithdrawalsByMethod: (method) => get().withdrawals.filter((w) => w.method === method),
        getWithdrawalsByStatus: (status) => get().withdrawals.filter((w) => w.status === status),
        setLoading: (loading) => set({ loading }),
    }),
) 