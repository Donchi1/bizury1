import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Address } from "@/lib/types";

interface AddressStore {
  addresses: Address[];
  loading: boolean;
  error: string | null;
  fetchAddressesByUser: (user_id: string) => Promise<void>;
  createAddress: (user_id: string, address: Omit<Address, "id" | "user_id" | "created_at" | "updated_at">) => Promise<void>;
  updateAddress: (id: string, address: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAddressStore = create<AddressStore>((set, get) => ({
  addresses: [],
  loading: false,
  error: null,
  setLoading: (loading) => set({ loading }),

  fetchAddressesByUser: async (user_id) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });
    if (error) {
      set({ error: error.message, loading: false });
      return;
    }
    set({ addresses: data as Address[], loading: false, error: null });
  },

  createAddress: async (user_id, address) => {
    set({ loading: true });
    // If is_default, set all others to false first
    if (address.is_default) {
      const { error } = await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user_id);
      if (error) {
        set({ loading: false, error: error.message });
        throw new Error(error.message);
      }
    }
    const { error } = await supabase.from("addresses").insert({
      ...address,
      user_id,
    });
    if (error) {
      set({ loading: false, error: error.message });
      throw new Error(error.message);
    }
    await get().fetchAddressesByUser(user_id);
    set({ loading: false, error: null });
  },

  updateAddress: async (id, address) => {
    set({ loading: true });
    const addresses = get().addresses;
    const current = addresses.find((a) => a.id === id);
    if (!current) {
      set({ loading: false, error: "Address not found" });
      throw new Error("Address not found");
    }
    // If is_default is being set, set all others to false first
    if (address.is_default) {
      const { error } = await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", current.user_id);
      if (error) {
        set({ loading: false, error: error.message });
        throw new Error(error.message);
      }
    }
    const { error } = await supabase.from("addresses").update(address).eq("id", id);
    if (error) {
      set({ loading: false, error: error.message });
      throw new Error(error.message);
    }
    await get().fetchAddressesByUser(current.user_id);
    set({ loading: false, error: null });
  },

  deleteAddress: async (id) => {
    set({ loading: true });
    const addresses = get().addresses;
    const current = addresses.find((a) => a.id === id);
    if (!current) {
      set({ loading: false, error: "Address not found" });
      throw new Error("Address not found");
    }
    const { error } = await supabase.from("addresses").delete().eq("id", id);
    if (error) {
      set({ loading: false, error: error.message });
      throw new Error(error.message);
    }
    await get().fetchAddressesByUser(current.user_id);
    set({ loading: false, error: null });
  },

  setDefaultAddress: async (id) => {
    set({ loading: true });
    const addresses = get().addresses;
    const current = addresses.find((a) => a.id === id);
    if (!current) {
      set({ loading: false, error: "Address not found" });
      throw new Error("Address not found");
    }
    // Set all to false, then set selected to true
    for (const addr of addresses) {
      await supabase.from("addresses").update({ is_default: addr.id === id }).eq("id", addr.id);
    }
    await get().fetchAddressesByUser(current.user_id);
    set({ loading: false, error: null });
  },
})); 