import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCatalogStore } from '@/store/useCatalogStore';
import { useOrdersStore } from '@/store/useOrdersStore';
import { useNeighborhoodsStore } from '@/store/useNeighborhoodsStore';
import type { Order, Neighborhood } from '@/data/products';
import type { Medication } from '@/data/medications';

/**
 * Parser: Supabase → Medication
 * 🏥 FARMÁCIA
 */
const parseMedicationFromSupabase = (supabaseData: any): Medication => {
  const isActive = supabaseData.is_active === true || supabaseData.is_active !== false;

  return {
    id: supabaseData.id,
    name: supabaseData.name || '',
    description: supabaseData.description || '',
    activeIngredient: supabaseData.active_ingredient || '',
    category: supabaseData.category || 'generico',
    price: supabaseData.price ?? 0,
    image: supabaseData.image,
    isPopular: supabaseData.is_popular ?? false,
    isNew: supabaseData.is_new ?? false,
    isActive: isActive,
    requiresRecipe: supabaseData.requires_recipe ?? false,
    isControlled: supabaseData.is_controlled ?? false,
    stock: supabaseData.stock ?? 0,
    maxQuantityPerOrder: supabaseData.max_quantity_per_order,
  };
};

const parseNeighborhoodFromSupabase = (supabaseData: any): Neighborhood => ({
  id: supabaseData.id,
  name: supabaseData.name,
  deliveryFee: supabaseData.delivery_fee ?? 0,
  isActive: supabaseData.is_active === true,
});

/**
 * Sincroniza medicamentos + bairros + pedidos com Supabase em tempo real
 * 🏥 FARMÁCIA - Modo único otimizado
 */
export const useRealtimeSync = () => {
  useEffect(() => {
    console.log('🏥 Iniciando Realtime Sync - FARMÁCIA');
    let isMounted = true;
    let medicationsPollInterval: NodeJS.Timeout | null = null;
    let neighborhoodsPollInterval: NodeJS.Timeout | null = null;

    const lastLocalUpdate = new Map<string, number>();

    // ✅ Sincronizar medicamentos
    const syncMedicationsFromSupabase = async () => {
      if (!isMounted) return;

      try {
        const { data: medications } = await (supabase as any)
          .from('medications')
          .select('*');

        if (!medications) return;

        const catalogStore = useCatalogStore.getState();
        const currentTime = Date.now();
        const currentMedicationIds = new Set(medications.map((m: any) => m.id));

        for (const medication of medications) {
          const lastUpdate = lastLocalUpdate.get(medication.id) || 0;
          const timeSinceLastUpdate = currentTime - lastUpdate;

          if (timeSinceLastUpdate < 3000) continue;

          catalogStore.upsertProduct(parseMedicationFromSupabase(medication) as any);
        }

        const storeItems = catalogStore.getAll();
        for (const storeItem of storeItems) {
          if (!currentMedicationIds.has(storeItem.id)) {
            catalogStore.removeProduct(storeItem.id);
          }
        }
      } catch (error) {
        console.error('❌ Erro ao sincronizar medicamentos:', error);
      }
    };

    // ✅ Sincronizar bairros
    const syncNeighborhoodsFromSupabase = async () => {
      if (!isMounted) return;

      try {
        const { data: neighborhoods } = await (supabase as any)
          .from('neighborhoods')
          .select('*');

        if (!neighborhoods) return;

        const neighborhoodsStore = useNeighborhoodsStore.getState();
        const currentNeighborhoodIds = new Set<string>();

        for (const neighborhood of neighborhoods) {
          const parsed = parseNeighborhoodFromSupabase(neighborhood);
          neighborhoodsStore.upsertNeighborhood(parsed);
          currentNeighborhoodIds.add(neighborhood.id);
        }

        const storedNeighborhoods = neighborhoodsStore.neighborhoods || [];
        for (const storedNeighborhood of storedNeighborhoods) {
          if (!currentNeighborhoodIds.has(storedNeighborhood.id)) {
            neighborhoodsStore.removeNeighborhood(storedNeighborhood.id);
          }
        }
      } catch (error) {
        console.error('❌ Erro ao sincronizar bairros:', error);
      }
    };

    // Carregar dados iniciais
    const loadInitialData = async () => {
      if (!isMounted) return;

      try {
        await new Promise(resolve => setTimeout(resolve, 100));

        const [medicationsRes, neighborhoodsRes] = await Promise.all([
          (supabase as any).from('medications').select('*'),
          (supabase as any).from('neighborhoods').select('*'),
        ]);

        if (medicationsRes.data && isMounted) {
          const catalogStore = useCatalogStore.getState();
          console.log(`✅ Carregados ${medicationsRes.data.length} medicamentos`);
          for (const medication of medicationsRes.data) {
            catalogStore.upsertProduct(parseMedicationFromSupabase(medication) as any);
          }
        }

        if (neighborhoodsRes.data && isMounted) {
          const neighborhoodsStore = useNeighborhoodsStore.getState();
          console.log(`✅ Carregados ${neighborhoodsRes.data.length} bairros`);
          for (const neighborhood of neighborhoodsRes.data) {
            neighborhoodsStore.upsertNeighborhood(parseNeighborhoodFromSupabase(neighborhood));
          }
        }
      } catch (error) {
        console.error('❌ Erro ao carregar dados iniciais:', error);
      }
    };

    loadInitialData();

    // ✅ WEBHOOK REALTIME - Medicamentos
    const medicationsChannel = supabase
      .channel('realtime:medications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'medications' },
        (payload: any) => {
          if (!isMounted) return;
          console.log(`🔔 Medicamento: ${payload.eventType} - ${payload.new?.name || payload.old?.name}`);

          const catalogStore = useCatalogStore.getState();

          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const medication = parseMedicationFromSupabase(payload.new);
            lastLocalUpdate.set(payload.new.id, Date.now() + 10000);
            catalogStore.upsertProduct(medication as any);
          } else if (payload.eventType === 'DELETE') {
            catalogStore.removeProduct(payload.old?.id);
          }
        }
      )
      .subscribe((status, error) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ [REALTIME-MEDICATIONS] ATIVO');
        } else if (error) {
          console.error('❌ [REALTIME-MEDICATIONS] Erro:', error?.message);
        }
      });

    // ⏰ POLLING FALLBACK - Medicamentos
    medicationsPollInterval = setInterval(async () => {
      if (!isMounted) return;
      try {
        console.log('🔄 [MEDICATIONS-POLLING] Verificando atualizações...');
        await syncMedicationsFromSupabase();
      } catch (err) {
        console.error('❌ [MEDICATIONS-POLLING] Erro:', err);
      }
    }, 10000);

    // ✅ WEBHOOK REALTIME - Neighborhoods
    const neighborhoodsChannel = supabase
      .channel('realtime:neighborhoods')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'neighborhoods' },
        (payload: any) => {
          if (!isMounted) return;
          console.log(`🔔 Bairro: ${payload.eventType} - ${payload.new?.name || payload.old?.name}`);

          const neighborhoodsStore = useNeighborhoodsStore.getState();

          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            neighborhoodsStore.upsertNeighborhood(parseNeighborhoodFromSupabase(payload.new));
          } else if (payload.eventType === 'DELETE') {
            neighborhoodsStore.removeNeighborhood(payload.old?.id);
          }
        }
      )
      .subscribe((status, error) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ [REALTIME-NEIGHBORHOODS] ATIVO');
        } else if (error) {
          console.error('❌ [REALTIME-NEIGHBORHOODS] Erro:', error?.message);
        }
      });

    // ⏰ POLLING FALLBACK - Neighborhoods
    neighborhoodsPollInterval = setInterval(async () => {
      if (!isMounted) return;
      try {
        console.log('🔄 [NEIGHBORHOODS-POLLING] Verificando atualizações...');
        await syncNeighborhoodsFromSupabase();
      } catch (err) {
        console.error('❌ [NEIGHBORHOODS-POLLING] Erro:', err);
      }
    }, 10000);

    // 🔄 Sincronizar pedidos
    const syncOrdersFromSupabaseWrapper = async () => {
      if (!isMounted) return;
      try {
        const ordersStore = useOrdersStore.getState();
        await ordersStore.syncOrdersFromSupabase();
      } catch (error) {
        console.error('❌ [ORDERS-SYNC] Erro:', error);
      }
    };

    const ordersChannel = supabase
      .channel('realtime:orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload: any) => {
          if (!isMounted) return;
          console.log('🔔 [ORDERS] Webhook:', payload.eventType);
          syncOrdersFromSupabaseWrapper();
        }
      )
      .subscribe((status, error) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ [REALTIME-ORDERS] ATIVO');
        } else if (error) {
          console.error('❌ [REALTIME-ORDERS] Erro:', error?.message);
        }
      });

    let ordersPollInterval: NodeJS.Timeout | null = null;
    const ordersPollingStartDelay = setTimeout(() => {
      if (!isMounted) return;
      console.log('🔄 [ORDERS-POLLING] Iniciando polling...');

      ordersPollInterval = setInterval(async () => {
        if (!isMounted) return;
        try {
          await syncOrdersFromSupabaseWrapper();
        } catch (err) {
          console.error('❌ [ORDERS-POLLING] Erro:', err);
        }
      }, 5000);
    }, 2000);

    // Cleanup
    return () => {
      isMounted = false;

      if (ordersPollingStartDelay) clearTimeout(ordersPollingStartDelay);
      if (ordersPollInterval) clearInterval(ordersPollInterval);
      if (medicationsPollInterval) clearInterval(medicationsPollInterval);
      if (neighborhoodsPollInterval) clearInterval(neighborhoodsPollInterval);

      medicationsChannel.unsubscribe();
      neighborhoodsChannel.unsubscribe();
      ordersChannel.unsubscribe();

      console.log('🛑 Realtime sync finalizado');
    };
  }, []);
};
