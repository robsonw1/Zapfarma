import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import type { Receipt } from '@/data/medications';

interface ReceiptStore {
  receipts: Receipt[];
  isLoading: boolean;
  error: string | null;

  // Queries
  getByCustomer: (customerId: string) => Receipt[];
  getByCustomerAndMedication: (customerId: string, medicationId: string) => Receipt[];
  getByStatus: (status: 'pendente' | 'verificada' | 'rejeitada') => Receipt[];

  // Mutations
  addReceipt: (receipt: Receipt) => void;
  updateReceipt: (id: string, updates: Partial<Receipt>) => void;
  deleteReceipt: (id: string) => void;
  
  // Server actions
  loadReceiptsFromSupabase: (customerId: string) => Promise<void>;
  verifyReceipt: (id: string, verified: boolean) => Promise<void>;
  rejectReceipt: (id: string, reason: string) => Promise<void>;
}

export const useReceiptStore = create<ReceiptStore>((set, get) => ({
  receipts: [],
  isLoading: false,
  error: null,

  getByCustomer: (customerId: string) => {
    return get().receipts.filter(r => r.customerId === customerId);
  },

  getByCustomerAndMedication: (customerId: string, medicationId: string) => {
    return get().receipts.filter(r => r.customerId === customerId && r.medicationId === medicationId);
  },

  getByStatus: (status: 'pendente' | 'verificada' | 'rejeitada') => {
    return get().receipts.filter(r => r.status === status);
  },

  addReceipt: (receipt: Receipt) => {
    set(state => ({
      receipts: [...state.receipts, receipt]
    }));
  },

  updateReceipt: (id: string, updates: Partial<Receipt>) => {
    set(state => ({
      receipts: state.receipts.map(r => r.id === id ? { ...r, ...updates } : r)
    }));
  },

  deleteReceipt: (id: string) => {
    set(state => ({
      receipts: state.receipts.filter(r => r.id !== id)
    }));
  },

  loadReceiptsFromSupabase: async (customerId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await (supabase as any)
        .from('receipts')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const receipts = (data || []).map((r: any) => ({
        id: r.id,
        customerId: r.customer_id,
        medicationId: r.medication_id,
        medicationName: r.medication_name,
        doctorName: r.doctor_name,
        doctorCRM: r.doctor_crm,
        dosage: r.dosage,
        quantity: r.quantity,
        dateIssued: r.date_issued,
        dateExpires: r.date_expires,
        imageUrl: r.image_url,
        isVerified: r.is_verified,
        status: r.status,
        rejectionReason: r.rejection_reason,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));

      set({ receipts, isLoading: false });
      console.log(`✅ Carregadas ${receipts.length} receitas do cliente`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar receitas';
      set({ error: message, isLoading: false });
      console.error('❌ Erro:', message);
    }
  },

  verifyReceipt: async (id: string, verified: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from('receipts')
        .update({
          is_verified: verified,
          status: verified ? 'verificada' : 'pendente',
          verified_at: verified ? new Date().toISOString() : null,
        })
        .eq('id', id);

      if (error) throw error;

      get().updateReceipt(id, {
        isVerified: verified,
        status: verified ? 'verificada' : 'pendente',
      });

      console.log(`✅ Receita ${verified ? 'verificada' : 'desverificada'}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao verificar receita';
      set({ error: message });
      console.error('❌ Erro:', message);
    }
  },

  rejectReceipt: async (id: string, reason: string) => {
    try {
      const { error } = await (supabase as any)
        .from('receipts')
        .update({
          status: 'rejeitada',
          rejection_reason: reason,
          verified_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      get().updateReceipt(id, {
        status: 'rejeitada',
        rejectionReason: reason,
      });

      console.log(`✅ Receita rejeitada: ${reason}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao rejeitar receita';
      set({ error: message });
      console.error('❌ Erro:', message);
    }
  },
}));
