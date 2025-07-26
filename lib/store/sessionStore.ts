
import { UAParser } from "ua-parser-js";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { create } from "zustand";

interface Session {
    id: string;
    user_id: string;
    user_agent: string;
    ip_address: string;
    device_type: string;
    os: string;
    browser: string;
    created_at: string;
    last_active: string;
    is_active: boolean;
}

interface SessionStore {
    sessions: Session[];
    isLoading: boolean;
    error: string | null;
    fetchSessions: (userId?: string) => Promise<void>;
    trackUserLogin: (userId: string) => Promise<void>;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
    sessions: [],
    isLoading: false,
    error: null,


  // Track user login/session
  trackUserLogin: async (userId: string) => {
    try {
      const userAgent = window.navigator.userAgent;
      const parser = new UAParser(userAgent);
      const { name: browser, version: browserVersion } = parser.getBrowser();
      const { name: os } = parser.getOS();
      const { type: deviceType } = parser.getDevice();

      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const { ip: ipAddress } = await ipResponse.json();

      await supabase.from('sessions').insert({
        user_id: userId,
        user_agent: userAgent,
        ip_address: ipAddress,
        device_type: deviceType || 'desktop',
        os: `${os} ${parser.getOS().version || ''}`.trim(),
        browser: `${browser} ${browserVersion}`,
        is_active: true,
      });
    } catch (error) {
      console.error('Error tracking user login:', error);
    }
  },

  // Fetch all sessions (or for a specific user)
  fetchSessions: async (userId?: string) => {
    set({ isLoading: true, error: null });
    try {
      let query = supabase
        .from('sessions')
        .select('*')
        .order('last_active', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      set({ sessions: data || [] });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch sessions';
      set({ error: message });
      toast.error(message);
    } finally {
      set({ isLoading: false });
    }
  },

}))