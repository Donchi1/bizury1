import { supabase } from "@/lib/supabase";
import { create } from "zustand";
import { Card } from "../cardStore";

interface CardsStore {
    cards: Card[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchCards: () => Promise<void>;
    fetchCardsByUser: (userId: string) => Promise<Card[] | null>;
    deleteCard: (id: string) => Promise<void>;
    updateCard: (id: string, updates: Partial<Card>) => Promise<void>;
    setDefaultCard: (id: string) => Promise<void>;
}


export const  useAdminCardsStore = create<CardsStore>((set, get) => ({
    cards: [],
    isLoading: false,
    error: null,

    fetchCards: async () => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase.from('cards').select('*, user:profiles(*)');
            if (error) throw error;
            set({ cards: data || [] });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch cards';
            set({ error: message });
            throw error
        } finally {
            set({ isLoading: false });
        }
    },
    fetchCardsByUser: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase.from('cards').select('*').eq('user_id', userId);
            if (error) throw error;
            set({ cards: data || [] });
            return (data  || []) as Card[];
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch cards';
            set({ error: message });
            throw error
        }
    },
    deleteCard: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const { error } = await supabase.from('cards').delete().eq('id', id);
            if (error) throw error;
            set({ cards: get().cards.filter(card => card.id !== id) });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete card';
            set({ error: message });
            throw error
        } finally {
            set({ isLoading: false });
        }
    },
    updateCard: async (id: string, updates: Partial<Card>) => {
        set({ isLoading: true, error: null });
        try {
            const { error } = await supabase.from('cards').update(updates).eq('id', id);
            if (error) throw error;
            set({ cards: get().cards.map(card => card.id === id ? { ...card, ...updates } : card) });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update card';
            set({ error: message });
            throw error
        } finally {
            set({ isLoading: false });
        }
    },
    setDefaultCard: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const { error } = await supabase.from('cards').update({ is_default: true }).eq('id', id);
            if (error) throw error;
            set({ cards: get().cards.map(card => card.id === id ? { ...card, is_default: true } : card) });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to set default card';
            set({ error: message });
            throw error
        } finally {
            set({ isLoading: false });
        }
    }



}))