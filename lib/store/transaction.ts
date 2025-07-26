import { create } from "zustand"
import { persist } from "zustand/middleware"

export type TransactionType = "withdrawal" | "payment" | "recharge" | "refund" | "purchase"

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  currency: string
  status: string
  method?: string
  date: string
  description?: string
  meta?: Record<string, any>
}

interface TransactionState {
  transactions: Transaction[]
  addTransaction: (tx: Transaction) => void
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  getTransactionsByType: (type: TransactionType) => Transaction[]
  clearTransactions: () => void
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],
      addTransaction: (tx) => set({ transactions: [tx, ...get().transactions] }),
      updateTransaction: (id, updates) => set({
        transactions: get().transactions.map((tx) =>
          tx.id === id ? { ...tx, ...updates } : tx
        ),
      }),
      getTransactionsByType: (type) => get().transactions.filter((tx) => tx.type === type),
      clearTransactions: () => set({ transactions: [] }),
    }),
    { name: "transaction-storage" },
  ),
)
