// lib/store/admin/adminStore.ts
import { create } from 'zustand';
import { toast } from 'sonner';
import { useAdminUsersStore } from './usersStore';
import { useAdminProductsStore } from './productsStore';
import { useAdminOrdersStore } from './ordersStore';
import { useAdminSellingStore } from './sellingsStore';
import { useAdminWithdrawalsStore } from './withdrawalsStore';
import { useAdminRechargesStore } from './rechargesStore';
import {supabase} from '@/lib/supabase';


export type SearchResults = {
  id: string;
  type: 'user' | 'product' | 'order' | 'store' | 'withdrawal' | 'recharge';
  title: string;
  description?: string;
  url: string;
}


interface AdminStore {
  // State
  isLoading: boolean;
  error: string | null;
  
  // Dashboard stats
  dashboardStats: {
    users: {
      total: number;
      active: number;
      new_today: number;
      growth: number;
    };
    products: {
      total: number;
      active: number;
      out_of_stock: number;
      pending_approval: number;
    };
    orders: {
      total: number;
      pending: number;
      processing: number;
      completed: number;
      revenue: number;
    };
    stores: {
      total: number;
      active: number;
      pending: number;
      blocked: number;
      inactive: number;
    };
    financial: {
      total_revenue: number;
      monthly_revenue: number;
      pending_payouts: number;
    };
  };
  recentActivities: Array<{
    id: string;
    type: string;
    title: string;
    description?: {
      amount?: number;
      currency?: string;
      method?: string;
    };  // Make it optional with ?
    timestamp: string;
    status: 'success' | 'pending' | 'failed' | 'cancelled';
  }>;
  
  // Actions
  fetchDashboardData: () => Promise<void>;
  refreshData: () => Promise<void>;
  clearError: () => void;


  
  // Search functionality
  search: (query: string) => Promise<Array<SearchResults>>;
}

const useAdminStore = create<AdminStore>((set, get) => ({
  // Initial state
  isLoading: false,
  error: null,
  dashboardStats: {
    users: { total: 0, active: 0, new_today: 0, growth: 0 },
    products: { total: 0, active: 0, out_of_stock: 0, pending_approval: 0 },
    orders: { total: 0, pending: 0, processing: 0, completed: 0, revenue: 0 },
    stores: { total: 0, active: 0, pending: 0, blocked: 0, inactive: 0 },
    financial: { total_revenue: 0, monthly_revenue: 0, pending_payouts: 0 },
  },
  recentActivities: [],

  // Main dashboard data fetch
  fetchDashboardData: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Fetch all data in parallel
      const [
        users,
        products,
        orders,
        sellingData,
        withdrawals,
        recharges
      ] = await Promise.all([
        useAdminUsersStore.getState().fetchProfiles(),
        useAdminProductsStore.getState().fetchProducts(),
        useAdminOrdersStore.getState().fetchOrders(),
        useAdminSellingStore.getState().fetchSellingStores(),
        useAdminWithdrawalsStore.getState().fetchWithdrawals(),
        useAdminRechargesStore.getState().fetchRecharges()
      ]);

      // Calculate time periods
      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      
      const lastMonth = new Date(now);
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      // Calculate user stats
      const newToday = users?.filter(user => 
        new Date(user.created_at) >= today
      ).length || 0;

      // Calculate product stats
      const productStats = {
        total: products?.length || 0,
        active: products?.filter(p => p.is_available === true).length || 0,
        out_of_stock: products?.filter(p => p.is_available === false).length || 0,
        pending_approval: products?.filter(p => p.sponsered === true).length || 0,
      };

      // Calculate order stats
      const completedOrders = orders?.filter(o => o.status === 'delivered') || [];
      const orderStats = {
        total: orders?.length || 0,
        pending: orders?.filter(o => o.status === 'pending').length || 0,
        processing: orders?.filter(o => o.status === 'processing').length || 0,
        completed: completedOrders.length,
        revenue: completedOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
      };

      // Calculate store stats
      const storeStats = {
        total: sellingData?.length || 0,
        active: sellingData?.filter(s => s.status === 'active').length || 0,
        pending: sellingData?.filter(s => s.status === 'pending').length || 0,
        blocked: sellingData?.filter(s => s.status === 'blocked').length || 0,
        inactive: sellingData?.filter(s => s.status === 'suspended').length || 0,
      };

      // Calculate financial stats
      const monthlyRevenue = completedOrders
        .filter(o => new Date(o.created_at) >= lastMonth)
        .reduce((sum, order) => sum + (order.total_amount || 0), 0);

      const pendingPayouts = withdrawals
        ?.filter(w => w.status === 'pending')
        .reduce((sum, w) => sum + (w.amount || 0), 0) || 0;

      // Process activities from different sources
      const activities = [
        ...(recharges?.map(r => ({
          id: `recharge-${r.id}`,
          type: 'recharge',
          message: `User recharged $${r.amount}`,
          timestamp: r.created_at,
          status: r.status,
          user_id: r.user_id,
          metadata: { amount: r.amount, currency: r.currency,method: r.method }
        })) || []),
        
        ...(withdrawals?.map(w => ({
          id: `withdrawal-${w.id}`,
          type: 'withdrawal',
          message: `Withdrawal request for $${w.amount}`,
          timestamp: w.created_at,
          status: w.status,
          user_id: w.user_id,
          metadata: { amount: w.amount, method: w.method, currency: w.currency }
        })) || [])
      ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10); // Get top 10 most recent

      // Update state with all calculated data
      set({
        dashboardStats: {
          users: {
            total: users?.length || 0,
            active: 0, // You'll need to implement active users tracking
            new_today: newToday,
            growth: 0, // You can implement growth calculation
          },
          products: productStats,
          orders: orderStats,
          stores: storeStats,
          financial: {
            total_revenue: orderStats.revenue,
            monthly_revenue: monthlyRevenue,
            pending_payouts: pendingPayouts,
          },
        },
        recentActivities: activities.map(activity => ({
          id: activity.id,
          type: activity.type,
          title: activity.message,
          description: activity.metadata,
          timestamp: activity.timestamp,
          status: activity.status as 'success' | 'pending' | 'failed' | 'cancelled',
        })),
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard data';
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  refreshData: async () => {
    await get().fetchDashboardData();
    toast.success('Dashboard data refreshed');
  },

  clearError: () => set({ error: null }),

  // Search implementation
  search: async (query: string) => {
    if (!query.trim()) return [];
    
    try {
      set({ isLoading: true });
      
      // Search across different entities in parallel
      const [users, products, orders, stores] = await Promise.all([
        // Search users
        supabase
          .from('profiles')
          .select('id, email, full_name, created_at')
          .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
          .limit(5),
          
        // Search products
        supabase
          .from('products')
          .select('id, name, description, created_at')
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(5),
          
        // Search orders
        supabase
          .from('orders')
          .select('id, order_number, status, created_at')
          .or(`order_number.ilike.%${query}%,status.ilike.%${query}%`)
          .limit(5),
          
        // Search stores
        supabase
          .from('stores')
          .select('id, name, slug, status, created_at')
          .or(`name.ilike.%${query}%,slug.ilike.%${query}%`)
          .limit(5),
      ]);
      
      // Transform results into a unified format
      const results = [
        ...(users.data?.map(item => ({
          id: item.id,
          type: 'user' as const,
          title: item.full_name || item.email,
          description: item.email,
          url: `/admin/users/${item.id}`,
          timestamp: item.created_at,
        })) || []),
        
        ...(products.data?.map(item => ({
          id: item.id,
          type: 'product' as const,
          title: item.name,
          description: item.description?.substring(0, 100) + (item.description?.length > 100 ? '...' : ''),
          url: `/admin/products/${item.id}`,
          timestamp: item.created_at,
        })) || []),
        
        ...(orders.data?.map(item => ({
          id: item.id,
          type: 'order' as const,
          title: `Order #${item.order_number}`,
          description: `Status: ${item.status}`,
          url: `/admin/orders/${item.id}`,
          timestamp: item.created_at,
        })) || []),
        
        ...(stores.data?.map(item => ({
          id: item.id,
          type: 'store' as const,
          title: item.name,
          description: `Status: ${item.status}`,
          url: `/admin/stores/${item.id}`,
          timestamp: item.created_at,
        })) || []),
      ];
      
      // Sort by most recent first
      results.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      return results;
      
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to perform search');
      return [];
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useAdminStore;