import { create } from "zustand";
import { StoreNewsItem } from "@/lib/types";
import { supabase } from "@/lib/supabase";



interface SellingStoreNews {
    isLoading: boolean;
    error: string | null;
    news:  StoreNewsItem[];
    fetchNews: () => Promise<StoreNewsItem[] | null>;
    createNews: (news: StoreNewsItem) => Promise<void>;
    updateNews: (news: StoreNewsItem) => Promise<void>;
    deleteNews: (id: StoreNewsItem["id"]) => Promise<void>;
}



export const useAdminSellingStoreNews = create<SellingStoreNews>((set, get) => ({
    isLoading: false,
    error: null,
    news: [],
    fetchNews: async () => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase.from('store_news').select('*');
            if (error) throw error;
            set({ news: data });
            return data || null;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch news';
            set({ error: message });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },
    createNews: async (news: StoreNewsItem) => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase.from('store_news').insert(news).select().single();
            if (error) throw error;
            set({ news: [data, ...get().news] });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create news';
            set({ error: message });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },
            
    updateNews: async (news: StoreNewsItem) => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase.from('store_news').update(news).eq('id', news.id).select().single();
            if (error) throw error;
            set({ news: get().news.map(n => n.id === news.id ? data : n) });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update news';
            set({ error: message });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },
        
    deleteNews: async (id: StoreNewsItem["id"]) => {
        set({ isLoading: true, error: null });
        try {
            const { error } = await supabase.from('store_news').delete().eq('id', id);
            if (error) throw error;
            set({ news: get().news.filter(n => n.id !== id) });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete news';
            set({ error: message });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },
        
    refreshData: () => {
        set({ isLoading: true, error: null });
        get().fetchNews();
    },
    clearNewsStore: async () => {
        set({ isLoading: false, error: null });
        try {
            const {error} = await supabase.from('store_news').delete();
            if (error) throw error;
            set({ news: [] });
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to clear news store' });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },
    
}));
    