// 🏥 FARMÁCIA - Página principal pivotada de Pizzaria para PharmaDrive
// Mantém 100% compatibilidade com sistema de pedidos, WhatsApp, impressão, fidelidade, etc

import { Header } from '@/components/Header';
import { MedicationCatalog } from '@/components/MedicationCatalog';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { SchedulingCheckoutModal } from '@/components/SchedulingCheckoutModal';
import { Footer } from '@/components/Footer';
import { CustomerLoginModal } from '@/components/CustomerLoginModal';
import { DeliveryAddressDialog } from '@/components/DeliveryAddressDialog';
import { useLoyaltyStore } from '@/store/useLoyaltyStore';
import { useLoyaltyRealtimeSync } from '@/hooks/use-loyalty-realtime-sync';
import { useRealtimeSync } from '@/hooks/use-realtime-sync';
import { useSettingsRealtimeSync } from '@/hooks/use-settings-realtime-sync';
import { useState, useEffect } from 'react';
import { AlertCircle, Clock, Truck, Heart } from 'lucide-react';

const Index = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDeliveryAddressOpen, setIsDeliveryAddressOpen] = useState(false);
  const currentCustomer = useLoyaltyStore((s) => s.currentCustomer);
  const restoreRememberedLogin = useLoyaltyStore((s) => s.restoreRememberedLogin);

  // ✅ Sincronizar dados em tempo real (MEDICAMENTOS, pedidos, configurações)
  useRealtimeSync();
  useLoyaltyRealtimeSync();
  useSettingsRealtimeSync();

  // Restaurar login lembrado ao inicializar
  useEffect(() => {
    const restoreLogin = async () => {
      console.log('🔄 [PHARMACY-INIT] Tentando restaurar login lembrado...');
      const remembered = localStorage.getItem('loyalty_remembered_login');
      console.log('🔄 [PHARMACY-INIT] localStorage.getItem resultado:', remembered);
      
      const restored = await restoreRememberedLogin();
      if (restored) {
        console.log('✅ [PHARMACY-INIT] Login automático restaurado com sucesso!');
      } else {
        console.log('❌ [PHARMACY-INIT] Falha ao restaurar login');
      }
    };

    restoreLogin();
  }, [restoreRememberedLogin]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex flex-col">
      <Header onLoginClick={() => setIsLoginModalOpen(true)} />

      {/* HERO SECTION - Farmácia */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">PharmaDrive</h1>
              <p className="text-green-100">Medicamentos entregues em até 20 minutos</p>
            </div>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6" />
              <div>
                <p className="font-semibold">20 Minutos</p>
                <p className="text-sm opacity-90">Entrega garantida</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Truck className="w-6 h-6" />
              <div>
                <p className="font-semibold">Rastreamento Live</p>
                <p className="text-sm opacity-90">Siga seu pedido em tempo real</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6" />
              <div>
                <p className="font-semibold">Confiança Total</p>
                <p className="text-sm opacity-90">Medicamentos 100% originais</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1">
        <MedicationCatalog />
      </main>

      {/* Footer */}
      <Footer
        onLoginClick={() => setIsLoginModalOpen(true)}
        onAdminClick={() => {}}
      />

      {/* Modals & Drawers */}
      <CustomerLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => setIsLoginModalOpen(false)}
        onSignupSuccess={() => {
          setIsLoginModalOpen(false);
          // Toast com ação será mostrado pelo componente
        }}
        onOpenAddressDialog={() => setIsDeliveryAddressOpen(true)}
      />
      <DeliveryAddressDialog
        isOpen={isDeliveryAddressOpen}
        onClose={() => setIsDeliveryAddressOpen(false)}
      />
      <CartDrawer />
      <CheckoutModal />
      <SchedulingCheckoutModal />
    </div>
  );
};

export default Index;
