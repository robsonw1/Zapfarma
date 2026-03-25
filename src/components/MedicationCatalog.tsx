import { useState } from 'react';
import { MedicationCard } from '@/components/MedicationCard';
import { MedicationDetailsModal } from '@/components/MedicationDetailsModal';
import { useMedicationCatalog } from '@/hooks/use-pharmacy';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Medication, medicationCategories } from '@/data/pharmacy';
import { Search } from 'lucide-react';
import { useCartStore } from '@/store/useStore';

export function MedicationCatalog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('analgesicos');
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { medications = [] } = useMedicationCatalog();
  const typedMedications = (Array.isArray(medications) ? medications : []) as Medication[];
  const cartStore = useCartStore();

  const filterBySearch = (items: Medication[]) => {
    if (!searchQuery) return items;
    return items.filter(
      (m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const medicationsByCategory = typedMedications.filter((m: Medication) => m.category === activeTab);
  const filteredMedications = filterBySearch(medicationsByCategory);

  const handleMedicationClick = (medication: Medication) => {
    setSelectedMedication(medication);
    setIsModalOpen(true);
  };

  const handleAddToCart = (medication: Medication, quantity: number) => {
    cartStore.addItem({
      id: `med-${medication.id}`,
      product: medication as any,
      quantity,
      totalPrice: medication.price * quantity,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
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
            {filteredMedications.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMedications.map((medication) => (
                  <div
                    key={medication.id}
                    className="cursor-pointer"
                    onClick={() => handleMedicationClick(medication)}
                  >
                    <MedicationCard medication={medication} index={0} />
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
          </TabsContent>
        </Tabs>
      </div>

      <MedicationDetailsModal
        medication={selectedMedication}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMedication(null);
        }}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
