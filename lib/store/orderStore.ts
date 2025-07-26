// Tracked order store for order tracking page

import { create } from "zustand"
import { supabase } from "../supabase"
import { Order } from "../types"
import { useNotificationStore } from "./notificationStore"
import { mockProducts } from "../mock-data"

// interface TrackedOrderItem {
//   id: string
//   product_name: string
//   quantity: number
//   unit_price: number
//   total_price: number
//   image_url: string
// }

// interface TrackedOrder {
//   id: string
//   order_number: string
//   store_name: string
//   store_logo: string
//   total_amount: number
//   status: string
//   payment_status: string
//   items_count: number
//   created_at: string
//   items: TrackedOrderItem[]
// }

interface OrderState {
  orders: Order[]
  trackedOrder: Order | null
  loading: boolean
  createOrder: (order: Order) => Promise<void>
  updateOrder: (id: string, updates: Partial<Order>) => Promise<void>
  deleteOrder: (id: string) => Promise<void>
  fetchOrdersByUser: (userId: string) => Promise<void>
  getOrdersByStatus: (status: Order["payment_status"]) => Order[] | null
  getSingleOrder: (orderId: string) => Order | null
  setLoading: (loading: boolean) => void
  setTrackedOrder: (trackedOrder: Order | null) => void
  trackOrder: (identifier: string) => Promise<void>
  getLatestOrders: (userId: string) => Order[] | null
}

export const useOrderStore = create<OrderState>()(
  (set, get) => ({
    orders: [],
    trackedOrder: null,
    loading: false,
    createOrder: async (order) => {
      set({ loading: true })
      try {
        const { data, error } = await supabase.from("orders").insert(order).select().single()
        if (error) throw error
        set({ orders: [data, ...get().orders] })
        // Send notification to user
        if ((order as any).user_id) {
          const { createNotification } = useNotificationStore.getState()
          await createNotification({
            user_id: (order as any).user_id,
            type: "order",
            title: "Order Placed",
            message: `Your order ${data.order_number || "#"} has been placed successfully!`,
            data: { orderId: data.id, orderNumber: data.order_number },
          })
        }
      } catch (error) {
        throw error
      } finally {
        set({ loading: false })
      }
    },
    updateOrder: async (id, updates) => {
      set({ loading: true })
      try {
        const { data, error } = await supabase.from("orders").update(updates).eq("id", id).select().single()
        if (error) throw error
        set({
          orders: get().orders.map((o) => (o.id === id ? { ...o, ...data } : o)),
        })
      } catch (error) {
        throw error
      } finally {
        set({ loading: false })
      }
    },
    deleteOrder: async (id) => {
      set({ loading: true })
      try {
        const { error } = await supabase.from("orders").delete().eq("id", id)
        if (error) throw error
        set({ orders: get().orders.filter((o) => o.id !== id) })
      } catch (error) {
        throw error
      } finally {
        set({ loading: false })
      }
    },
    fetchOrdersByUser: async (userId) => {
      set({ loading: true });
      try {
        const { data, error } = await supabase
          .from("orders")
          .select(`*`)
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
    
        if (error) throw error;

        const orderIds = data.map((order) => order.id);

        const orderItems = await supabase
          .from("order_items")
          .select(`*`)
          .in("order_id", orderIds )
          .order("created_at", { ascending: false });

          if (orderItems.error) throw orderItems.error;

           const orderItemsData = orderItems.data;

           const updatedOrders = data.map((order) => {
            const orderItems = orderItemsData.filter((item) => item.order_id === order.id);
            return {
              ...order,
              order_items: orderItems,
            };
          } ) as Order[];

        set({ orders: updatedOrders });
      } catch (error) {
        throw error;
      } finally {
        set({ loading: false });
      }
    },
    trackOrder: async (identifier: string) => {
      set({ loading: true });
      try {
        // First, fetch the order by either ID or tracking number
        const { data: orders, error } = await supabase
          .from("orders")
          .select(`*`)
          .or(`id.eq.${identifier},tracking_number.eq.${identifier}`)
          .order("created_at", { ascending: false });
    
        if (error) throw error;
        if (!orders || orders.length === 0) {
          throw new Error("Order not found");
        }
        
        const order = orders[0];
        
        // Fetch order items with product info
        const { data: orderItems, error: itemsError } = await supabase
          .from("order_items")
          .select(`*, product:product_id(*, stores(*))`)
          .eq("order_id", order.id);
        
        if (itemsError) throw itemsError;
        
        // Process items to handle company orders and missing products
        const processedItems = (orderItems || []).map((item) => {
            // If product exists and is not a company order, return as is
            if (item.product && !item.products.is_company_order) {
              return {
                ...item,
                product: item.products,
              };
            }
              const mockProduct = mockProducts.find((product) => product.asin === item.asin)  
              return {
                ...item,
                product: mockProduct
              };
          })
        
    
        // Update the order with processed items
        const updatedOrder = {
          ...order,
          order_items: processedItems,
        };
    
        set({ trackedOrder: updatedOrder });
        return updatedOrder;
      } catch (error) {
        console.error('Error tracking order:', error);
        throw error;
      } finally {
        set({ loading: false });
      }
    },
    
    getOrdersByStatus: (status) => get().orders.filter((order) => order.status === status)!,
    getSingleOrder: (orderId) => get().orders.find((order) => order.id === orderId)!,
    getLatestOrders: () => get().orders?.slice(-5),
    setTrackedOrder: (order) => set({ trackedOrder: order}),

    setLoading: (value) => set({loading: value})
    
}))
