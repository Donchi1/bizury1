// app/stores/contentStore.ts
import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '../auth'

// Align with the existing Notification type from notificationStore.ts
interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  data?: {
    target?: string
  }
  is_read: boolean
  created_at: string
  updated_at?: string
}

interface ContactInfo {
  address: string
  phone: string
  email: string
  whatsapp: string
  paypal: string
  wallet_trc20_code: string // TRC20 wallet code (string)
  wallet_erc20_code: string // ERC20 wallet code (string)
  usdt_wallet_trc20: string  // USDT wallet TRC20 (qr code)
  usdt_wallet_erc20: string // USDT wallet ERC20 (qr code)
  qr_paypal: string  // QR code (string)
  btc_wallet_code: string // BTC wallet code (string)
  btc_wallet: string      // BTC wallet (qr code)
  eth_wallet_code: string  // ETH wallet code (string)
  eth_wallet: string     // ETH wallet (qr code)
}

interface ContentStore {
  // Notifications
  isLoading: boolean,
  notifications: Notification[]
  adminNotifications: Notification[]
  selectedNotification: Notification | null
  selectedIds: string[]
  isEditing: boolean
  tab: 'admin' | 'users'
  fetchNotifications: () => Promise<void>
  fetchAdminNotifications: (id: string) => Promise<void>
  createNotification: (notification: Omit<Notification, 'id' | 'is_read' | 'created_at' | 'updated_at'>) => Promise<Notification | null>
  updateNotification: (id: string, updates: Partial<Notification>) => Promise<Notification | null>
  deleteNotification: (id: string) => Promise<void>
  setSelectedNotification: (notification: Notification | null) => void
  setIsEditing: (isEditing: boolean) => void
  setContactInfo: (contactInfo: ContactInfo | null) => void

  // Contact Info
  contactInfo: ContactInfo | null
  fetchContactInfo: () => Promise<ContactInfo | null>
  updateContactInfo: (updates: Partial<ContactInfo>) => Promise<ContactInfo | null>
  toggleSelect: (id: string) => void
  setTab: (tab: 'admin' | 'users') => void
  selectAll: (select: boolean) => void
  clearSelection: () => void,
  bulkMarkAsRead: () => Promise<void>,
  bulkDelete: () => Promise<void>,
}

export const useContentStore = create<ContentStore>((set, get) => {


  return {
    notifications: [],
    selectedNotification: null,
    isEditing: false,
    contactInfo: null,
    isLoading: false,
    adminNotifications: [],
    selectedIds: [],
    tab: 'admin',


    fetchNotifications: async () => {
      set({ isLoading: true })
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .not('data->>target', 'is', 'null')
          .order('created_at', { ascending: false })
          .limit(50) // Limit to recent notifications

        if (error) throw error
        set({ notifications: data || [] })
      } catch (error) {
        throw error
      } finally {
        set({ isLoading: false })
      }
    },
    fetchAdminNotifications: async (id: string) => {
      set({ isLoading: true })
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq("user_id", id)
          .order('created_at', { ascending: false })
          .limit(50) // Limit to recent notifications

        if (error) throw error
        set({ adminNotifications: data || [] })
      } catch (error) {
        throw error
      } finally {
        set({ isLoading: false })
      }
    },
    createNotification: async (notification) => {
      set({ isLoading: true })
      try {

        const { data, error } = await supabase
          .from('notifications')
          .insert([{
            ...notification,
            is_read: false,
            created_at: new Date().toISOString()
          }])
          .select()
          .single()

        if (error) throw error

        set(state => ({
          notifications: [data, ...state.notifications]
        }))

        return data
      } catch (error) {
        throw error
      } finally {
        set({ isLoading: false })
      }
    },

    updateNotification: async (id, updates) => {
      set({ isLoading: true })
      try {
        const { data, error } = await supabase
          .from('notifications')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        const profile = useAuthStore.getState().profile
        await get().fetchNotifications()
        await get().fetchAdminNotifications(profile?.id!)
        return data
      } catch (error) {
        throw error
      } finally {
        set({ isLoading: false })
      }
    },

    deleteNotification: async (id) => {
      set({ isLoading: true })
      try {
        const { error } = await supabase
          .from('notifications')
          .delete()
          .eq('id', id)

        if (error) throw error

        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id),
          selectedNotification: state.selectedNotification?.id === id
            ? null
            : state.selectedNotification
        }))
      } catch (error) {
        throw error
      } finally {
        set({ isLoading: false })
      }
    },

    setSelectedNotification: (notification) => {
      set({ selectedNotification: notification })
    },

    setIsEditing: (isEditing) => {
      set({ isEditing })
    },

    fetchContactInfo: async () => {
      set({ isLoading: true })
      try {
        const { data, error } = await supabase
          .from('contact_info')
          .select('*')
          .single()

        if (error && error.code !== 'PGRST116') throw error // Ignore no rows error

        set({ contactInfo: data })
        return data
      } catch (error) {
        throw error
      } finally {
        set({ isLoading: false })
      }
    },

    updateContactInfo: async (updates) => {
      set({ isLoading: true })
      try {
        const { data, error } = await supabase
          .from('contact_info')
          .upsert({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error

        set(state => ({
          contactInfo: { ...(state.contactInfo), ...data }
        }))
        return data
      } catch (error) {
        throw error
      } finally {
        set({ isLoading: false })
      }
    },
    setContactInfo: (contactInfo) => {
      set({ contactInfo })
    },
    toggleSelect: (id: string) => {
      set(state => ({
        selectedIds: state.selectedIds.includes(id)
          ? state.selectedIds.filter(i => i !== id)
          : [...state.selectedIds, id]
      }))
    },
    setTab: (tab) => {
      set({ tab })
    },
    selectAll: (select: boolean) => {
      const tab = get().tab
      if (tab === 'admin') {
        set({ selectedIds: select ? get().adminNotifications.map(n => n.id) : [] })
      } else {
        set({ selectedIds: select ? get().notifications.map(n => n.id) : [] })
      }
    },
    clearSelection: () => {
      set({ selectedIds: [] })
    },
    bulkMarkAsRead: async () => {
      set({ isLoading: true })
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .in('id', get().selectedIds)

        if (error) throw error
        const profile = useAuthStore.getState().profile
        await get().fetchNotifications()
        await get().fetchAdminNotifications(profile?.id!)
      } catch (error) {
        console.log("Error:", error)
        throw error
      } finally {
        set({ isLoading: false })
      }
    },
    bulkDelete: async () => {
      set({ isLoading: true })
      try {
        const { error } = await supabase
          .from('notifications')
          .delete()
          .in('id', get().selectedIds)

        if (error) throw error
        const profile = useAuthStore.getState().profile
        await get().fetchNotifications()
        await get().fetchAdminNotifications(profile?.id!)
      } catch (error) {
        throw error
      } finally {
        set({ isLoading: false })
      }
    },
  }
})

// function getDefaultContactInfo(): ContactInfo {
//   return {
//     address: '123 Business St, City, Country',
//     phone: '+1234567890',
//     email: 'support@bizury.info',
//     whatsapp: '+1234567890',
//     wallet_trc20: '',
//     wallet_erc20: '',
//     paypal: '',
//     qr_trc20: '',
//     qr_erc20: '',
//     qr_paypal: ''
//   }
// }