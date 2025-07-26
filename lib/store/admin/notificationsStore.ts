import { create } from 'zustand';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

type NotificationType = 'system' | 'account' | 'transaction' | 'alert';
type NotificationStatus = 'unread' | 'read' | 'archived';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    status: NotificationStatus;
    is_read: boolean;
    created_at: string;
    read_at?: string | null;
    metadata?: Record<string, any>;
}

interface NotificationsState {
    notifications: Notification[];
    loading: boolean;
    error: string | null;
    selectedIds: string[];
    totalCount: number;
    page: number;
    pageSize: number;
    filters: {
        search: string;
        type: string | null;
        status: string | null;
    };

    // Core Methods
    fetchNotifications: () => Promise<void>;
    createNotification: (data: Omit<Notification, 'id' | 'created_at' | 'is_read'>) => Promise<void>;
    updateNotification: (id: string, updates: Partial<Notification>) => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;

    // Bulk Actions
    toggleSelect: (id: string) => void;
    selectAll: (select: boolean) => void;
    bulkMarkAsRead: () => Promise<void>;
    bulkDelete: () => Promise<void>;

    // UI State
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
    setSearch: (search: string) => void;
    setTypeFilter: (type: string | null) => void;
    setStatusFilter: (status: string | null) => void;
    clearFilters: () => void;
}



export const useAdminNotificationsStore = create<NotificationsState>((set, get) => ({
    notifications: [],
    loading: false,
    error: null,
    selectedIds: [],
    totalCount: 0,
    page: 1,
    pageSize: 10,
    filters: {
        search: '',
        type: null,
        status: null
    },

    fetchNotifications: async () => {
        set({ loading: true, error: null });
        try {
            const { page, pageSize, filters } = get();
            let query = supabase
                .from('notifications')
                .select('*').eq('status', 'unread');

            if (filters.search) {
                query = query.or(`title.ilike.%${filters.search}%,message.ilike.%${filters.search}%`);
            }

            if (filters.type) query = query.eq('type', filters.type);
            if (filters.status === 'read') query = query.eq('is_read', true);
            if (filters.status === 'unread') query = query.eq('is_read', false);
            if (filters.status === 'archived') query = query.eq('status', 'archived');

            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;

            const { data, error, count } = await query
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;

            set({
                notifications: data || [],
                totalCount: count || 0,
                loading: false
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch',
                loading: false
            });
            toast.error('Failed to load notifications');
        }
    },

    createNotification: async (data) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .insert({
                    ...data,
                    status: 'unread',
                    is_read: false,
                    created_at: new Date().toISOString()
                });

            if (error) throw error;

            await get().fetchNotifications();
            toast.success('Notification created');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to create notification');
        }
    },

    updateNotification: async (id, updates) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            await get().fetchNotifications();
            toast.success('Notification updated');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to update');
        }
    },

    deleteNotification: async (id) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', id);

            if (error) throw error;

            await get().fetchNotifications();
            toast.success('Notification deleted');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to delete');
        }
    },

    // Bulk Actions
    toggleSelect: (id) => {
        set(state => ({
            selectedIds: state.selectedIds.includes(id)
                ? state.selectedIds.filter(selectedId => selectedId !== id)
                : [...state.selectedIds, id]
        }));
    },

    selectAll: (select) => {
        set({
            selectedIds: select ? get().notifications.map(n => n.id) : []
        });
    },

    bulkMarkAsRead: async () => {
        const { selectedIds } = get();
        if (selectedIds.length === 0) return;

        try {
            const { error } = await supabase
                .from('notifications')
                .update({
                    is_read: true,
                    status: 'read',
                    read_at: new Date().toISOString()
                })
                .in('id', selectedIds);

            if (error) throw error;

            await get().fetchNotifications();
            set({ selectedIds: [] });
            toast.success(`Marked ${selectedIds.length} as read`);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to update');
        }
    },

    bulkDelete: async () => {
        const { selectedIds } = get();
        if (selectedIds.length === 0) return;

        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .in('id', selectedIds);

            if (error) throw error;

            await get().fetchNotifications();
            set({ selectedIds: [] });
            toast.success(`Deleted ${selectedIds.length} notifications`);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to delete');
        }
    },

    // UI State
    setPage: (page) => {
        set({ page })
        get().fetchNotifications()
    },
    setPageSize: (size) => {
        set({ pageSize: size, page: 1 })
        get().fetchNotifications()
    },
    setSearch: (search) => {
        set(
            state => ({ filters: { ...state.filters, search } }),
        )
        get().fetchNotifications()
    },
    setTypeFilter: (type) => {
        set(
            state => ({ filters: { ...state.filters, type }, page: 1 }),
        )
        get().fetchNotifications()
    },
    setStatusFilter: (status) => {
        set(state => ({ filters: { ...state.filters, status: status === "all" ? null : status }, page: 1 }))
        get().fetchNotifications()
    },
    clearFilters: () => {
        set({
            filters: { search: '', type: null, status: null },
            page: 1
        }),
            get().fetchNotifications()
    }
}));
