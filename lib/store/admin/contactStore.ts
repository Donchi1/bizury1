import { create } from "zustand";
import { supabase } from "../../supabase";
import { toast } from "sonner";
import { ContactForm } from "@/lib/types";



interface ContactState {
  contacts: ContactForm[];
  loading: boolean;
  error: string | null;
  fetchContacts: () => Promise<void>;
  getContact: (id: string) => ContactForm | undefined;
  updateContact: (id: string, updates: Partial<ContactForm>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  bulkUpdateStatus: (ids: string[], status: ContactForm['status']) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
  getFilteredContacts: (filters: {
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) => ContactForm[];
  getStats: () => {
    total: number;
    new: number;
    in_progress: number;
    resolved: number;
    spam: number;
  };
}

export const useContactStore = create<ContactState>((set, get) => ({
  contacts: [],
  loading: false,
  error: null,

  fetchContacts: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ contacts: data || [], loading: false });
    } catch (error) {
      console.error('Error fetching contacts:', error);
      set({ error: 'Failed to fetch contacts', loading: false });
      toast.error('Failed to load contact submissions');
    }
  },

  getContact: (id) => {
    return get().contacts.find(contact => contact.id === id);
  },

  updateContact: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          resolved_at: updates.status === 'resolved' && updates.status !== get().getContact(id)?.status 
            ? new Date().toISOString() 
            : undefined,
          resolved_by: updates.status === 'resolved' && updates.status !== get().getContact(id)?.status 
            ? (await supabase.auth.getSession()).data.session?.user.id
            : undefined,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        contacts: state.contacts.map(contact => 
          contact.id === id ? { ...contact, ...data } : contact
        ),
        loading: false
      }));
      
      toast.success('Contact submission updated');
    } catch (error) {
      console.error('Error updating contact:', error);
      set({ error: 'Failed to update contact', loading: false });
      toast.error('Failed to update submission');
    }
  },

  deleteContact: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        contacts: state.contacts.filter(contact => contact.id !== id),
        loading: false
      }));
      
      toast.success('Contact submission deleted');
    } catch (error) {
      console.error('Error deleting contact:', error);
      set({ error: 'Failed to delete contact', loading: false });
      toast.error('Failed to delete submission');
    }
  },

  bulkUpdateStatus: async (ids, status) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update({
          status,
          updated_at: new Date().toISOString(),
          ...(status === 'resolved' && {
            resolved_at: new Date().toISOString(),
            resolved_by: (await supabase.auth.getSession()).data.session?.user.id,
          }),
        })
        .in('id', ids)
        .select();

      if (error) throw error;

      const updatedIds = data?.map(item => item.id) || [];
      
      set(state => ({
        contacts: state.contacts.map(contact => 
          updatedIds.includes(contact.id) 
            ? { ...contact, status, updated_at: new Date().toISOString() }
            : contact
        ),
        loading: false
      }));
      
      toast.success(`Updated status for ${ids.length} submission${ids.length > 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Error bulk updating contacts:', error);
      set({ error: 'Failed to update submissions', loading: false });
      toast.error('Failed to update submissions');
    }
  },

  bulkDelete: async (ids) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .in('id', ids);

      if (error) throw error;

      set(state => ({
        contacts: state.contacts.filter(contact => !ids.includes(contact.id)),
        loading: false
      }));
      
      toast.success(`Deleted ${ids.length} submission${ids.length > 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Error bulk deleting contacts:', error);
      set({ error: 'Failed to delete submissions', loading: false });
      toast.error('Failed to delete submissions');
    }
  },

  getFilteredContacts: ({ search = '', status = '', startDate, endDate }) => {
    const { contacts } = get();
    const searchTerm = search.toLowerCase();
    
    return contacts.filter(contact => {
      const matchesSearch = 
        contact.name.toLowerCase().includes(searchTerm) ||
        contact.email.toLowerCase().includes(searchTerm) ||
        contact.subject?.toLowerCase().includes(searchTerm) ||
        contact.message.toLowerCase().includes(searchTerm) ||
        contact.company?.toLowerCase().includes(searchTerm) ||
        contact.phone?.includes(searchTerm);
      
      const matchesStatus = !status || contact.status === status;
      
      let matchesDate = true;
      if (startDate) {
        matchesDate = matchesDate && new Date(contact.created_at) >= new Date(startDate);
      }
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && new Date(contact.created_at) <= endOfDay;
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  },

  getStats: () => {
    const { contacts } = get();
    return {
      total: contacts.length,
      new: contacts.filter(c => c.status === 'new').length,
      in_progress: contacts.filter(c => c.status === 'in_progress').length,
      resolved: contacts.filter(c => c.status === 'resolved').length,
      spam: contacts.filter(c => c.status === 'spam').length,
    };
  },
}));
