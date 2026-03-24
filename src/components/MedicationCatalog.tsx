import { useState, useEffect } from 'react';
import { MedicationCard } from '@/components/MedicationCard';
import { useMedicationStore } from '@/store/useMedicationStore';
import { useMedicationCatalog } from '@/hooks/use-pharmacy';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Medication, medicationCategories } from '@/data/pharmacy';
import { Search } from 'lucide-react';

export function MedicationCatalog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('analgesicos');

  // Carregar medicamentos
  const { medications: rawMedications = [] } = useMedicationCatalog();
  const medications = (Array.isArray(rawMedications) ? rawMedications : []) as import('@/data/pharmacy').Medication[];
  const store = useMedicationStore();

  // Sincronizar com store (sem condição)
  useEffect(() => {
    store.setMedications(medications);
  }, [medications]);

  const filterBySearch = (items: Medication[]) => {
    if (!searchQuery) return items;
    return items.filter(
      (m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Medicamentos do store
  const allMedications = store.medications;
  
  // Filtrar por categoria e busca
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
                        <div key={medication.id} className="cursor-pointer">
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
    </div>
  );
}
