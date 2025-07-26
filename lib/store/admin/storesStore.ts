import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Store } from "@/lib/types";

export type StoreStatus = 'active' | 'pending' | 'suspended';
export type VerificationStatus = 'verified' | 'pending' | 'rejected';



interface StoresStore {
  isLoading: boolean;
  error: string | null;
  stores: Store[];
  fetchStores: () => Promise<Store[] | null>;
  createStore: (storeData: Omit<Store, 'id' | 'created_at' | 'updated_at'>) => Promise<Store>;
  updateStore: (id: string, updates: Partial<Store>) => Promise<void>;
  deleteStore: (id: string) => Promise<boolean>;
  approveStore: (id: string) => Promise<void>;
  suspendStore: (id: string) => Promise<void>;
  deleteStores: (ids: string[]) => Promise<number>;
  activateStore: (id: string) => Promise<void>;
}

export const useAdminStoresStore = create<StoresStore>((set, get) => ({
  isLoading: false,
  error: null,
  stores: [],

  fetchStores: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*, owner:profiles(*), products(*), reviews:store_reviews(*)')
        .order('created_at', { ascending: false });

        if (error) throw error;
      set({ stores: data });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch stores';
      set({ error: message });
      toast.error('Error', { description: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  createStore: async (storeData) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('stores')
        .insert(storeData)
        .select()
        .single();

      if (error) throw error;
      
      // Refresh stores list
      await get().fetchStores();
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create store';
      set({ error: message });
      toast.error('Error', { description: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateStore: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('stores')
        .update({...updates, updated_at: new Date().toISOString()})
        .eq('id', id);

      if (error) throw error;
      
      // Refresh stores list
      await get().fetchStores();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update store';
      set({ error: message });
      toast.error('Error', { description: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteStore: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.from('stores').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({
        stores: state.stores.filter((store) => store.id !== id),
      }));
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete store';
      set({ error: message });
      toast.error('Error', { description: message });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteStores: async (ids) => {
    set({ isLoading: true, error: null });
    try {
      const { error, count } = await supabase
        .from('stores')
        .delete()
        .in('id', ids);

      if (error) throw error;
      
      set((state) => ({
        stores: state.stores.filter((store) => !ids.includes(store.id)),
      }));
      return count || 0;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete stores';
      set({ error: message });
      toast.error('Error', { description: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  approveStore: async (id) => {
    
    try {
      await get().activateStore(id)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to approve store';
      toast.error('Error', { description: message });
      throw error;
    }
  },

  suspendStore: async (id) => {
    try {
      await get().updateStore(id, { status: 'suspended' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to suspend store';
      toast.error('Error', { description: message });
      throw error;
    }
  },
  activateStore: async (id) => {     
    try {
      await get().updateStore(id, { status: 'active' });
      const storeOwner = get().stores.find(store => store.id === id)?.owner
      if (storeOwner && storeOwner.role === 'customer') {
        await supabase.from('profiles').update({ role: 'merchant' }).eq('id', storeOwner.id)
      }
    } catch (error) {
      throw error;
    }
  },
}));
