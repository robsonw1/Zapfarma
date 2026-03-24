import { useState, useEffect } from 'react';
import { MedicationCard } from '@/components/MedicationCard';
import { ReceiptUploadModal } from '@/components/ReceiptUploadModal';
import { useCatalogStore } from '@/store/useCatalogStore';
import { useLoyaltyStore } from '@/store/useLoyaltyStore';
import { useReceiptStore } from '@/store/useReceiptStore';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Medication, medicationCategories } from '@/data/medications';
import { Search, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function MedicationCatalog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('analgesicos');
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const allMedications = useCatalogStore((s) => s.getAll());
  const currentCustomer = useLoyaltyStore((s) => s.currentCustomer);
  const receipts = useReceiptStore((s) => s.receipts);
  const loadReceiptsFromSupabase = useReceiptStore((s) => s.loadReceiptsFromSupabase);

  // Carregar receitas do cliente ao montar
  useEffect(() => {
    if (currentCustomer?.id) {
      loadReceiptsFromSupabase(currentCustomer.id);
    }
  }, [currentCustomer?.id, loadReceiptsFromSupabase]);

  const filterBySearch = (items: any[]) => {
    if (!searchQuery) return items;
    return items.filter(
      (m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.activeIngredient?.toLowerCase().includes(searchQuery.toLowerCase()) || true)
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
    if (medication.requiresRecipe && !hasValidReceipt(medication.id)) {
      setSelectedMedication(medication);
      setShowReceiptModal(true);
    } else {
      // Adicionar ao carrinho (integrar com checkout)
      console.log('Adicionar ao carrinho:', medication.name);
    }
  };

  // Filtrar medicamentos por categoria ativa
  const medicationsByCategory = allMedications.filter((m: any) => m.category === activeTab);
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
            {medicationCategories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="whitespace-nowrap text-sm">
                {category.name}
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
