import { mockProducts } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";
import { Order } from "@/lib/types";
import { create } from "zustand";


interface OrdersStore {
    isLoading: boolean;
    error: string | null;
    orders: Order[];
    fetchOrders: () => Promise<Order[] | null>;
    createOrder: (order: Order) => Promise<void>;
    updateOrder: (id: Order["id"], update: Partial<Order>) => Promise<void>;
    deleteOrder: (id: Order["id"]) => Promise<void>;
}

export const useAdminOrdersStore = create<OrdersStore>((set, get) => ({
    isLoading: false,
    error: null,
    orders: [],

    // Actions

    fetchOrders: async () => {
        set({ isLoading: true, error: null });
        try {
            // First fetch orders with customer info
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('*, customer:profiles(*)')
                .order('created_at', { ascending: false });
            
            if (ordersError) throw ordersError;
            if (!ordersData?.length) {
                set({ orders: [] });
                return [];
            }
    
            // Get all order IDs
            const orderIds = ordersData.map(order => order.id);
            
            // Fetch only the order items for these orders
            const { data: orderItems, error: itemsError } = await supabase
                .from('order_items')
                .select('*')
                .in('order_id', orderIds);
                
            if (itemsError) throw itemsError;
    
            // Process order items to replace null products with mock products when available
            const processedOrderItems = orderItems.map(item => {
                // If product is null but we have a mock product with matching ASIN, use it
                if (!item.product) {
                    const mockProduct = mockProducts.find(p => p.asin === item.asin);
                    if (mockProduct) {
                        return {
                            ...item,
                            product: {
                                ...mockProduct,
                                id: `mock-${mockProduct.asin}`, // Ensure unique ID
                            }
                        };
                    }
                }
                return item;
            });
                
            // Create a map of order_id to order items for faster lookup
            const orderItemsMap = new Map();
            processedOrderItems?.forEach(item => {
                if (!orderItemsMap.has(item.order_id)) {
                    orderItemsMap.set(item.order_id, []);
                }
                orderItemsMap.get(item.order_id).push(item);
            });
            
            // Combine the data
            const ordersWithItems = ordersData.map(order => ({
                ...order,
                order_items: orderItemsMap.get(order.id) || []
            }));
            
            set({ orders: ordersWithItems, isLoading: false });
            return ordersWithItems;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch orders';
            set({ error: message });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },
    createOrder: async (order: Order) => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase.from('orders').insert(order).select().single();
            if (error) throw error;
            set({ orders: [data, ...get().orders], isLoading: false });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create order';
            set({ error: message });
            throw error
        } finally {
            set({ isLoading: false });
        }
    },
    updateOrder: async (id, update) => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase.from('orders').update(update).eq('id', id).select().single();
            if (error) throw error;
             await get().fetchOrders();
             return data;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update order';
            set({ error: message });
            throw error
        } finally {
            set({ isLoading: false });
        }
    },
    deleteOrder: async (id: Order["id"]) => {
        set({ isLoading: true, error: null });
        try {
            const { error } = await supabase.from('orders').delete().eq('id', id);
            if (error) throw error;
            set({ orders: get().orders.filter(o => o.id !== id), isLoading: false });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete order';
            set({ error: message });
            throw error
        } finally {
            set({ isLoading: false });
        }
    }
}))