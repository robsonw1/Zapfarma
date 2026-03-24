// 🏥 PHARMACY PAGE - Página principal da farmácia
// Substitui a página Index (pizzaria) por farmácia

import { MedicationCatalog } from '@/components/MedicationCatalog';
import { CartDrawer } from '@/components/CartDrawer';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AlertCircle, Clock, Truck, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * 🏥 PharmacyPage - Página principal da farmácia
 * Reutiliza mesma estrutura de Index mas com dados de medicamentos
 */
export function PharmacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header - mesmo do app original */}
      <Header />

      {/* Hero Section - Adaptado para farmácia */}
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

      {/* Main Content - Catálogo */}
      <main className="max-w-7xl mx-auto">
        <MedicationCatalog />
      </main>

      {/* Modals */}
      <CartDrawer />

      {/* Footer - mesmo do app original */}
      <Footer />
    </div>
  );
}

export default PharmacyPage;
