import { create } from "zustand"
import { supabase } from "../supabase"
import { Store, Product, Review, Profile, OrderItemWithDetails } from "../types"
import { mockProducts } from "../mock-data"


interface Message {
  id: string
  sender_id: string
  receiver_id: string
  sender_role: 'customer' | 'merchant'
  receiver_role: 'customer' | 'merchant'
  store_id: string
  order_id?: string
  message: string
  is_read: boolean
  created_at: string
  updated_at?: string
}

interface SellingStoreState {
  // State
  store: Store | null
  stores: Store[]
  messages: Message[]
  loading: boolean
  followedStores: Store[]
  error: string | null
  storeOrders: OrderItemWithDetails[]
  messageSubscription: any

  // Store management
  createStore: (store: Omit<Store, 'id'>) => Promise<Store>
  updateStore: (id: string, updates: Partial<Store>) => Promise<Store>
  deleteStore: (id: string) => Promise<void>
  fetchStoreByUser: (userId: string) => Promise<Store | null>
  fetchStoreById: (storeId: string, userId?: string) => Promise<Store | null>
  fetchAllStores: (userId: string) => Promise<Store[]>

  // Follow/Unfollow functionality
  followStore: (userId: string, storeId: string) => Promise<void>
  unfollowStore: (userId: string, storeId: string) => Promise<void>
  fetchFollowedStores: (userId: string) => Promise<Store[]>
  checkIfFollowing: (userId: string, storeId: string) => Promise<boolean>

  // Reviews
  fetchStoreReviews: (storeId: string) => Promise<Review[]>
  addReview: (review: Omit<Review, 'id'>) => Promise<Review>
  updateStoreRating: (store_id: string) => Promise<void>

  // Product management
  addProduct: (product: Product, store_id: string) => Promise<Product>
  updateProduct: (id: string, updates: Partial<Product>) => Promise<Product>
  deleteProduct: (id: string) => Promise<void>
  fetchProductsByStore: (storeId: string) => Promise<Product[]>

  // Message management
  fetchMessagesByStore: (storeId: string) => Promise<Message[]>
  markMessageRead: (messageId: string) => Promise<Message | undefined>
  deleteMessage: (messageId: string) => Promise<void>
  sendMessage: (msg: Omit<Message, 'id' | 'created_at' | 'is_read' | 'updated_at'>) => Promise<Message>
  subscribeToMessages: (storeId: string) => Promise<void>
  unsubscribeFromMessages: () => void

  // Order management
  fetchOrdersByStore: (storeId: string) => Promise<OrderItemWithDetails[]>
  updateStoreOrder: (orderId: string, updates: Partial<OrderItemWithDetails>) => Promise<OrderItemWithDetails>
  deleteStoreOrder: (orderId: string) => Promise<void>

  // Error handling
  setError: (error: string | null) => void
  clearError: () => void
  reset: () => void
  setLoading: (loading: boolean) => void
}

// Helper functions
const getProductsByAsins = (asins: string[] = []): Product[] => {
  if (!asins?.length) return []
  return mockProducts.filter(product => asins.includes(product.asin!))
}

const calculateNewRating = (currentRating: number, currentCount: number, newRating: number): number => {
  const total = (currentRating * currentCount) + newRating
  return total / (currentCount + 1)
}

export const useSellingStore = create<SellingStoreState>((set, get) => ({
  // Initial state
  store: null,
  stores: [],
  messages: [],
  loading: false,
  followedStores: [],
  error: null,
  storeOrders: [],
  messageSubscription: null,

  // Error handling
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  reset: () => {
    const { messageSubscription } = get()
    if (messageSubscription) {
      supabase.removeChannel(messageSubscription)
    }
    set({
      store: null,
      stores: [],
      messages: [],
      followedStores: [],
      error: null,
      storeOrders: [],
      messageSubscription: null,
      loading: false
    })
  },
  setLoading: (loading) => set({ loading }),

  // Store management
  createStore: async (storeData) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from("stores")
        .insert(storeData)
        .select()
        .single()
      if (error) throw error
      set({ store: data })
      return data
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create store'
      set({ error: message })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  updateStore: async (id, updates) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from("stores")
        .update(updates)
        .eq("id", id)
        .select()
        .single()
      if (error) throw error
      set({ store: data })
      return data
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update store'
      set({ error: message })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  deleteStore: async (id) => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase
        .from("stores")
        .delete()
        .eq("id", id)
      if (error) throw error
      set({ store: null })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete store'
      set({ error: message })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  fetchStoreByUser: async (userId) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from("stores")
        .select(`
      *,
      products(*),
      followers(*),
      store_reviews(*, profile:user_id(*))
    `)
        .eq("owner_id", userId)
        .single()
      if (error) throw error
      set({ store: data })
      return data
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch user store'
      set({ error: message })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  fetchStoreById: async (storeId, userId) => {
    set({ loading: true, error: null })
    try {
      const { data: store, error } = await supabase
        .from("stores")
        .select(`
        *,
        products(*),
        followers(*),
        store_reviews(*, profile:user_id(*))
      `)
        .eq("id", storeId)
        .single();

      if (error) throw error
      if (!store) return null

      let isFollowing = false
      if (userId) {
        isFollowing = !!store?.followers?.find((f: any) => f.follower_id === userId)
      }


      const storeWithDetails = {
        ...store,
        isFollowing,
        followers: store?.followers || [],
        reviews: store?.store_reviews || [],
        products: store?.products || [],
      }
      set({ store: storeWithDetails })
      return storeWithDetails
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch store'
      set({ error: message })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  // In fetchAllStores method of sellingStore.ts
  fetchAllStores: async (userId) => {
    set({ loading: true, error: null });
    try {
      // 1. Fetch all stores
      const { data: stores, error: storesError } = await supabase
        .from("stores")
        .select("*, products(*), followers(*)")
      if (storesError) throw storesError

      // 5. Attach followers and isFollowing to each store
      const storesWithFollowers = stores.map(store => ({
        ...store,
        isFollowing: userId ? !!store.followers.find((f: any) => f.follower_id === userId) : false,
      }))

      set({ stores: storesWithFollowers })
      return storesWithFollowers
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch stores';
      set({ error: message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Follow/Unfollow functionality
  followStore: async (userId, storeId) => {
    set({ loading: true, error: null })
    try {
      const { error, data:updatedFollower } = await supabase
        .from("followers")
        .insert({
          follower_id: userId,
          store_id: storeId,
          created_at: new Date().toISOString()
        })
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
      if (error) throw error

      const { store, stores } = get()
      if (store?.id === storeId) {
        set({
          store: {
            ...store,
            isFollowing: true,
            followers: [...(store.followers || []), updatedFollower[0]]
          }
        })
      }

      if (stores.some(s => s.id === storeId)) {
        set({
          stores: stores.map(s =>
            s.id === storeId
              ? {
                ...s,
                isFollowing: true,
                followers: [...(s.followers || []), updatedFollower[0]]
              }
              : s
          )
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to follow store'
      set({ error: message })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  unfollowStore: async (userId, storeId) => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase
        .from("followers")
        .delete()
        .eq("follower_id", userId)
        .eq("store_id", storeId)

      if (error) throw error

      const { store, stores, followedStores } = get()
      if (store?.id === storeId) {
        set({
          store: {
            ...store,
            isFollowing: false,
            followers: (store.followers || []).filter(follower => follower.follower_id !== userId)
          }
        })
      }

      if (stores.some(s => s.id === storeId)) {
        set({
          stores: stores.map(s =>
            s.id === storeId
              ? {
                ...s,
                isFollowing: false,
                followers: (s.followers || []).filter(follower => follower.follower_id !== userId)
              }
              : s
          )
        })
      }

      set({
        followedStores: followedStores.filter(store => store.id !== storeId)
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to unfollow store'
      set({ error: message })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  fetchFollowedStores: async (userId) => {
    set({ loading: true, error: null })

    try {
      const { data: followedStores, error } = await supabase
        .from("followers")
        .select("store_id")
        .eq("follower_id", userId);

      if (error) throw error
      
      const storeIds = followedStores.map((f: any) => f.store_id);

      const { data: stores, error: storeError } = await supabase
        .from("stores")
        .select(`*,products (*)`)
        .in("id", storeIds)

      if (storeError) throw storeError


  

      set({ followedStores: stores })
      return stores
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch followed stores'
      set({ error: message })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  checkIfFollowing: async (userId, storeId) => {
    try {
      const { data, error } = await supabase
        .from("followers")
        .select("*")
        .eq("follower_id", userId)
        .eq("store_id", storeId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return !!data
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to check follow status'
      set({ error: message })
      throw error
    }
  },

  // Reviews
  fetchStoreReviews: async (storeId) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from("store_reviews")
        .select("*, profile:user_id(*)")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false })

      if (error) throw error

      set(state => ({
        store: {
          ...state.store,
          reviews: data || []
        } as Store
      }))
      return data || []
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch reviews'
      set({ error: message })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  updateStoreRating: async (store_id: string) => {
    const reviews = await get().fetchStoreReviews(store_id)
    const avgRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0
    await supabase.from("stores").update({ rating: avgRating }).eq("id", store_id)
    set(state => ({
      store: state.store ? { ...state.store, rating: avgRating } : null
    }))
  },

  addReview: async (review) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from("store_reviews")
        .insert({
          ...review,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      await get().updateStoreRating(review.store_id)

      return data
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add review'
      set({ error: message })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  // Product management
  addProduct: async (product, store_id) => {
    set({ loading: true, error: null })
    try {
      if (!store_id) throw new Error("Store not found")
      const { data, error } = await supabase
        .from("products")
        .insert({ ...product, store_id })
        .select()
        .single()
      if (error) throw error
      set(state => ({
        store: {
          ...state.store,
          products: [data, ...state.store?.products!]
        } as Store
      }))
      return data
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add product'
      set({ error: message })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  updateProduct: async (id, updates) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", id)
        .select()
        .single()
      if (error) throw error
      set(state => ({
        store: {
          ...state.store,
          products: state.store?.products?.map((p) =>
            p.asin === id ? { ...p, ...data } : p
          )
        } as Store
      }))
      return data
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update product'
      set({ error: message })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)
      if (error) throw error
      set(state => ({
        store: {
          ...state.store,
          products: state.store?.products?.filter((p) => p.id !== id)
        } as Store
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete product'
      set({ error: message })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  fetchProductsByStore: async (storeId) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", storeId)
      if (error) throw error
      set(state => ({
        store:
          { ...state.store, products: data || [] } as Store
      }))
      return data || []
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch products'
      set({ error: message })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  // Message management
  fetchMessagesByStore: async (storeId) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false })
      if (error) throw error
      console.log(data)
      set({ messages: data || [] })
      return data || []
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch messages'
      set({ error: message })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  markMessageRead: async (messageId) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("id", messageId)
        .select()
        .single()
      if (error) throw error
      set(state => ({
        messages: state.messages.map((m) =>
          m.id === messageId ? { ...m, ...data } : m
        )
      }))
      return data
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to mark message as read'
      set({ error: message })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  deleteMessage: async (messageId) => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId)
      if (error) throw error
      set(state => ({
        messages: state.messages.filter((m) => m.id !== messageId)
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete message'
      set({ error: message })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  sendMessage: async (msg) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          ...msg,
          is_read: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Add the new message to local state
      set(state => ({
        messages: [data, ...state.messages]
      }))

      return data
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send message'
      set({ error: message })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  subscribeToMessages: async (storeId) => {
    // Unsubscribe from any existing subscription
    get().unsubscribeFromMessages()

    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `store_id=eq.${storeId}`
        },
        (payload) => {
          const newMessage = payload.new as Message
          set(state => ({
            messages: [newMessage, ...state.messages]
          }))
        }
      )
      .subscribe()

    set({ messageSubscription: subscription })
  },

  unsubscribeFromMessages: () => {
    const { messageSubscription } = get()
    if (messageSubscription) {
      supabase.removeChannel(messageSubscription)
      set({ messageSubscription: null })
    }
  },

  // Order management
  fetchOrdersByStore: async (storeId) => {
    set({ loading: true, error: null });

    try {
      // First, get all products that belong to this store
      const { data: storeProducts, error: productsError } = await supabase
        .from("products")
        .select("id")
        .eq("store_id", storeId)

      if (productsError) throw productsError;

      // If store has no products, return empty array
      if (!storeProducts || storeProducts.length === 0) {
        set({ storeOrders: [] });
        return [];
      }

      const productIds = storeProducts.map(p => p.id);

      // Now get order items for these specific products
      const { data: orderItems, error } = await supabase
        .from("order_items")
        .select(`
          *,
          order:order_id(
            *,
            customer:user_id(*)
          ),
          product:product_id(*)
        `)
        .in("product_id", productIds);

      if (error) throw error;

      if (!orderItems || orderItems.length === 0) {
        set({ storeOrders: [] });
        return [];
      }

      // Group order items by order_id
      const ordersMap = new Map();

      for (const item of orderItems) {
        const orderId = item.order_id;
        if (!ordersMap.has(orderId)) {
          ordersMap.set(orderId, {
            ...item.order,
            order_items: []
          });
        }
        ordersMap.get(orderId).order_items.push({
          ...item,
          order: undefined // Remove circular reference
        });
      }

      const orders = Array.from(ordersMap.values());
      set({ storeOrders: orders });
      return orders;

    } catch (error: any) {
      const message = error instanceof Error ? error.message : String(error);
      set({ error: message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteStoreOrder: async (orderId) => {
    set({ loading: true, error: null });
    try {
      // First delete order items
      const { error: itemsError } = await supabase
        .from("order_items")
        .delete()
        .eq("order_id", orderId);

      if (itemsError) throw itemsError;

      // Then delete the order itself
      const { error: orderError } = await supabase
        .from("orders")
        .delete()
        .eq("id", orderId);

      if (orderError) throw orderError;

      // Update local state
      set(state => ({
        storeOrders: state.storeOrders.filter(order => order.id !== orderId)
      }));

    } catch (error: any) {
      const message = error instanceof Error ? error.message : String(error);
      set({ error: message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateStoreOrder: async (orderId, updates) => {
    set({ loading: true, error: null });
    try {
      const { data: updatedOrder, error } = await supabase
        .from("orders")
        .update(updates)
        .eq("id", orderId)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      set(state => ({
        storeOrders: state.storeOrders.map(order =>
          order.id === orderId ? { ...order, ...updatedOrder } : order
        )
      }));

      return updatedOrder;
    } catch (error: any) {
      const message = error instanceof Error ? error.message : String(error);
      set({ error: message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Rest of the implementation...
}))