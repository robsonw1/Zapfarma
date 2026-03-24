// 💊 MEDICATION STORE - Gerenciamento de estado da farmácia
// Reutiliza padrão do CatalogStore mas para medicamentos

import { create } from 'zustand';
import { Medication, MedicationCartItem } from '@/data/pharmacy';

interface MedicationStoreState {
  // Medicamentos
  medications: Medication[];
  setMedications: (medications: Medication[]) => void;
  addMedication: (medication: Medication) => void;
  updateMedication: (id: string, medication: Partial<Medication>) => void;
  removeMedication: (id: string) => void;

  // Catálogo visível
  visibleMedications: Medication[];
  filterByCategory: (category: string | null) => void;
  searchMedications: (query: string) => void;
  selectedCategory: string | null;
  searchQuery: string;

  // Selected
  selectedMedication: Medication | null;
  setSelectedMedication: (medication: Medication | null) => void;

  // Cart (mesmo padrão de antes)
  cart: MedicationCartItem[];
  addToCart: (item: MedicationCartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItem: (itemId: string, updates: Partial<MedicationCartItem>) => void;
  clearCart: () => void;
  getCartTotal: () => number;

  // Sync status
  isSyncing: boolean;
  setIsSyncing: (syncing: boolean) => void;
}

export const useMedicationStore = create<MedicationStoreState>((set, get) => ({
  // MEDICAMENTOS
  medications: [],
  setMedications: (medications) => set({ medications }),
  
  addMedication: (medication) =>
    set((state) => ({
      medications: [...state.medications, medication],
    })),
  
  updateMedication: (id, updates) =>
    set((state) => ({
      medications: state.medications.map((med) =>
        med.id === id ? { ...med, ...updates } : med
      ),
    })),
  
  removeMedication: (id) =>
    set((state) => ({
      medications: state.medications.filter((med) => med.id !== id),
    })),

  // FILTROS E BUSCA
  visibleMedications: [],
  selectedCategory: null,
  searchQuery: '',

  filterByCategory: (category) => {
    set((state) => {
      const filtered = category
        ? state.medications.filter((m) => m.category === category)
        : state.medications;
      return {
        selectedCategory: category,
        visibleMedications: filtered.filter((m) =>
          m.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          m.active_ingredient.toLowerCase().includes(state.searchQuery.toLowerCase())
        ),
      };
    });
  },

  searchMedications: (query) => {
    set((state) => {
      const filtered = state.medications.filter((m) => {
        const matchesSearch =
          m.name.toLowerCase().includes(query.toLowerCase()) ||
          m.active_ingredient.toLowerCase().includes(query.toLowerCase());
        const matchesCategory =
          !state.selectedCategory || m.category === state.selectedCategory;
        return matchesSearch && matchesCategory;
      });
      return {
        searchQuery: query,
        visibleMedications: filtered,
      };
    });
  },

  // SELEÇÃO
  selectedMedication: null,
  setSelectedMedication: (medication) => set({ selectedMedication: medication }),

  // CARRINHO
  cart: [],

  addToCart: (item) =>
    set((state) => {
      // Check if already in cart
      const existing = state.cart.find((i) => i.id === item.id);
      if (existing) {
        return {
          cart: state.cart.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
          ),
        };
      }
      return { cart: [...state.cart, item] };
    }),

  removeFromCart: (itemId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== itemId),
    })),

  updateCartItem: (itemId, updates) =>
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
    })),

  clearCart: () => set({ cart: [] }),

  getCartTotal: () => {
    const state = get();
    return state.cart.reduce((total, item) => total + item.totalPrice, 0);
  },

  // SYNC
  isSyncing: false,
  setIsSyncing: (syncing) => set({ isSyncing: syncing }),
}));
