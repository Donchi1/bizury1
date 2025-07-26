import { create } from "zustand";
import { supabase } from "@/lib/supabase";
// Use native crypto.randomUUID for id generation
import { createHash} from "crypto";
import { decryptCardNumber, encryptCardNumber } from "../utils";
import { Profile } from "../types";

export type Card = {
  id: string;
  user_id: string;
  card_type: string;
  card_number_last4: string;
  card_number_hash: string;
  cardholder_name: string;
  expiry_date: string;
  billing_address: string;
  city: string;
  state: string;
  zip_code: string;
  cvv: string
  country: string;
  user?:Profile
  is_default: boolean;
  added_date: string;
};

type CardStore = {
  cards: Card[];
  loading: boolean;
  error: string | null;
  fetchCardsByUser: (user_id: string) => Promise<void>;
  createCard: (user_id: string, card: Omit<Card, "id" | "user_id" | "card_number_hash" | "card_number_last4" | "added_date"> & { card_number: string }) => Promise<void>;
  updateCard: (id: string, card: Partial<Card> & { card_number?: string }) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  setDefaultCard: (id: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
};

function hashCardNumber(card_number: string) {
  // Use SHA-256 for hashing
  return createHash("sha256").update(card_number).digest("hex");
}

export const useCardStore = create<CardStore>((set, get) => ({
  cards: [],
  loading: false,
  error: null,
  setLoading: (loading) => set({ loading }),

  fetchCardsByUser: async (user_id) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .eq("user_id", user_id)
      .order("added_date", { ascending: false });
    if (error) {
      set({ error: error.message, loading: false });
      return;
    }
    set({ cards: data as Card[], loading: false, error: null });
  },

  createCard: async (user_id, card) => {
    set({ loading: true });
    const { card_type, card_number, ...rest } = card;
    const card_number_last4 = card_number.slice(-4);
    const card_number_hash = encryptCardNumber(card_number);
    // Enforce max 3 cards
    const cards = get().cards;
    if (cards.length >= 3) {
      set({ loading: false, error: "You can only add up to 3 cards." });
      throw new Error("You can only add up to 3 cards.");
    }
    // Enforce unique card type
    if (cards.some((c) => c.card_type.toLowerCase() === card_type.toLowerCase())) {
      set({ loading: false, error: "You already have a card of this type." });
      throw new Error("You already have a card of this type.");
    }
    // Enforce unique card number (hash)

    if (cards.some((c) => decryptCardNumber(c.card_number_hash) === card_number)) {
      set({ loading: false, error: "This card number is already added." });
      throw new Error("This card number is already added.");
    }
    // If first card, set as default
    const is_default = cards.length === 0;
    const { error } = await supabase.from("cards").insert({
      user_id,
      card_type,
      card_number_last4,
      card_number_hash,
      cardholder_name: rest.cardholder_name,
      expiry_date: rest.expiry_date,
      billing_address: rest.billing_address,
      city: rest.city,
      state: rest.state,
      zip_code: rest.zip_code,
      country: rest.country,
      is_default,
    });
    if (error) {
      set({ loading: false, error: error.message });
      throw new Error(error.message);
    }
    await get().fetchCardsByUser(user_id);
    set({ loading: false, error: null });
  },

  updateCard: async (id, card) => {

    set({ loading: true });
    //get all local cards
    const cards = get().cards;
    const currentCard = cards.find((c) => c.id === id);
    let updateData = { ...card };
    // If card_number is being updated, update hash and last4, and check uniqueness
    if ((card as any).card_number) {
      const card_number = (card as any).card_number;
      const card_number_last4 = card_number.slice(-4);
      // Enforce unique card number (hash), except for this card
      const checkDD = (hash: string) => {
        const cardInfo = decryptCardNumber(hash)
        return cardInfo
      }
      if (cards.some((c) => checkDD(c.card_number_hash) === card_number && c.id !== id)) {
        set({ loading: false, error: "This card number is already added." });
        throw new Error("This card number is already added.");
      }
      updateData.card_number_hash = encryptCardNumber(card_number);
      updateData.card_number_last4 = card_number_last4;
      delete (updateData as any).card_number; // Don't store raw number
    }
    const { error } = await supabase.from("cards").update(updateData).eq("id", id);
    if (error) {
      set({ loading: false, error: error.message });
      throw new Error(error.message);
    }
    // Refetch
    const user_id = currentCard?.user_id;
    if (user_id) await get().fetchCardsByUser(user_id);
    set({ loading: false, error: null });
  },

  deleteCard: async (id) => {
    set({ loading: true });
    console.log("I am deleting card")
    const cards = get().cards;
    const user_id = cards.find((c) => c.id === id)?.user_id;
    const { error } = await supabase.from("cards").delete().eq("id", id);
    if (error) {
      set({ loading: false, error: error.message });
      throw new Error(error.message);
    }
    await get().fetchCardsByUser(user_id!);
    set({ loading: false, error: null });
  },

  setDefaultCard: async (id) => {
    set({ loading: true });
    const cards = get().cards;
    const user_id = cards.find((c) => c.id === id)?.user_id;
    // Set all to false, then set selected to true
    for (const card of cards) {
      await supabase.from("cards").update({ is_default: card.id === id }).eq("id", card.id);
    }
    await get().fetchCardsByUser(user_id!);
    set({ loading: false, error: null });
  },
})); 