import { Order, Profile } from "@/lib/types";
import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export type ProfileWithOrders = Profile & {
    orders?: Order[]
}

interface UsersStore {
    isLoading: boolean;
    error: string | null;
    profiles: ProfileWithOrders[];
    fetchProfiles: () => Promise<ProfileWithOrders[] | null>;
    createProfile: (user: Profile) => Promise<void>;
    updateProfile: (id: Profile["id"], user: Profile) => Promise<void>;
    deleteProfile: (id: Profile["id"]) => Promise<boolean>;
    setProfiles: (profiles: ProfileWithOrders[]) => void;
}

export const useAdminUsersStore = create<UsersStore>((set, get) => ({
    isLoading: false,
    error: null,
    profiles: [],
    fetchProfiles: async () => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase
            .from('profiles')
            .select('*, orders(*)')
            .neq('role', 'admin')
            if (error) throw error;
            set({ profiles: data });
            return data || null;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch users';
            set({ error: message });
            throw error
        } finally {
            set({ isLoading: false });
        }
    },
    createProfile: async (user: Profile) => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase.from('profiles').insert(user).select().single();
            if (error) throw error;
            set({ profiles: [data, ...get().profiles] });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create user';
            set({ error: message });
            throw error
        } finally {
            set({ isLoading: false });
        }
    },
    updateProfile: async (id, user) => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase.from('profiles').update(user).eq('id', id).select().single();
            if (error) throw error;
            set({ profiles: get().profiles.map(u => u.id === data.id ? {...u, ...data} : u) });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update user';
            set({ error: message });
            throw error
        } finally {
            set({ isLoading: false });
        }
    },
    deleteProfile: async (id: Profile["id"]) => {
        set({ isLoading: true, error: null });
        try {
            const { error } = await supabase.from('profiles').delete().eq('id', id);
            console.log(error)
            if (error) throw error;
            
            // Optimistically update the UI
            set(state => ({
                profiles: state.profiles.filter(u => u.id !== id)
            }));
            
            return true;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete user';
            set({ error: message });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },
    setProfiles: (profiles: ProfileWithOrders[]) => {
        set({ profiles });
    }
}))