import { useState, useEffect } from 'react';
import { MedicationCard } from '@/components/MedicationCard';
import { ReceiptUploadModal } from '@/components/ReceiptUploadModal';
import { useMedicationStore } from '@/store/useMedicationStore';
import { useLoyaltyStore } from '@/store/useLoyaltyStore';
import { useReceiptStore } from '@/store/useReceiptStore';
import { useMedicationCatalog } from '@/hooks/use-pharmacy';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Medication, medicationCategories } from '@/data/pharmacy';
import { Search, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function MedicationCatalog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('analgesicos');
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Carregar medicamentos do Supabase (com fallback para mock)
  const { medications } = useMedicationCatalog();
  
  // Store
  const store = useMedicationStore();
  const currentCustomer = useLoyaltyStore((s) => s.currentCustomer);
  const receipts = useReceiptStore((s) => s.receipts);
  const loadReceiptsFromSupabase = useReceiptStore((s) => s.loadReceiptsFromSupabase);

  // Sincronizar medicamentos carregados com o store
  useEffect(() => {
    store.setMedications(medications);
  }, [medications, store]);

  // Carregar receitas do cliente ao montar
  useEffect(() => {
    if (currentCustomer?.id) {
      loadReceiptsFromSupabase(currentCustomer.id);
    }
  }, [currentCustomer?.id, loadReceiptsFromSupabase]);

  const filterBySearch = (items: Medication[]) => {
    if (!searchQuery) return items;
    return items.filter(
      (m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.active_ingredient?.toLowerCase().includes(searchQuery.toLowerCase()) || true)
    );
  };

  const hasValidReceipt = (medicationId: string) => {
    return receipts.some(
      (r) =>
        r.medicationId === medicationId &&
        r.status === 'verificada' &&
        new Date(r.dateExpires) > new Date()
    );
  };

  const handleMedicationClick = (medication: Medication) => {
    if (medication.requires_recipe && !hasValidReceipt(medication.id)) {
      setSelectedMedication(medication);
      setShowReceiptModal(true);
    } else {
      // Adicionar ao carrinho
      store.addToCart({
        id: medication.id,
        medication,
        quantity: 1,
        totalPrice: medication.price,
      });
    }
  };

  // Medicamentos do store (sincronizados com dados do Supabase)
  const allMedications = store.medications;
  
  // Filtrar medicamentos por categoria ativa
  const medicationsByCategory = allMedications.filter((m: Medication) => m.category === activeTab);
  const filteredMedications = filterBySearch(medicationsByCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-xl">
              🏥
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">PharmaDrive</h1>
              <p className="text-sm text-gray-600">Medicamentos entregues em até 20 minutos</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar medicamento, ingrediente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Alerta importante */}
      {currentCustomer && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Alert>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription>
              👋 Bem-vindo(a), <strong>{currentCustomer.name}</strong>! Medicamentos que requerem receita serão validados antes da entrega.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-2 mb-8 h-auto">
            {Object.entries(medicationCategories).map(([id, name]) => (
              <TabsTrigger key={id} value={id} className="whitespace-nowrap text-sm">
                {name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab}>
            {/* Medicamentos Grid */}
            {(() => {
              console.log(`📦 Categoria ativa: "${activeTab}" | ${filteredMedications.length} medicamentos`);
              return (
                <div>
                  {filteredMedications.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredMedications.map((medication, index) => (
                        <div
                          key={medication.id}
                          onClick={() => handleMedicationClick(medication)}
                          className="cursor-pointer"
                        >
                          <MedicationCard medication={medication} index={index} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500 text-lg">
                        {searchQuery
                          ? `Nenhum medicamento encontrado para "${searchQuery}"`
                          : 'Nenhum medicamento disponível nesta categoria.'}
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </TabsContent>
        </Tabs>
      </div>

      {/* Receipt Upload Modal */}
      {selectedMedication && (
        <ReceiptUploadModal
          isOpen={showReceiptModal}
          medicationId={selectedMedication.id}
          medicationName={selectedMedication.name}
          customerId={currentCustomer?.id || ''}
          onClose={() => {
            setShowReceiptModal(false);
            setSelectedMedication(null);
          }}
          onSuccess={() => {
            console.log('✅ Receita enviada com sucesso!');
            // Recarregar receitas
            if (currentCustomer?.id) {
              loadReceiptsFromSupabase(currentCustomer.id);
            }
          }}
        />
      )}
    </div>
  );
}
