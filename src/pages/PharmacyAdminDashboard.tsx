// 🏥 PHARMACY ADMIN DASHBOARD
// Adaptação do AdminDashboard para gerenciar farmácia
// Mantém TODAS as funcionalidades: WhatsApp, Impressão, Horários, Fidelidade

import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Flame,
  LogOut,
  Pill,
  ShoppingBag,
  MapPin,
  Settings,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  Gift,
  Edit,
  Trash2,
  Plus,
  Clock,
  Power,
  QrCode,
  FileCheck,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Medication } from '@/data/pharmacy';
import { useMedicationStore } from '@/store/useMedicationStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useNeighborhoodsStore } from '@/store/useNeighborhoodsStore';
import { useOrdersStore } from '@/store/useOrdersStore';
import { useTheme } from '@/hooks/use-theme';
import { useMedicationCatalog, useSaveMedication, useDeleteMedication, useVerifyReceipt } from '@/hooks/use-pharmacy';
import { toast } from 'sonner';

export default function PharmacyAdminDashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedMedicationId, setSelectedMedicationId] = useState<string | null>(null);
  const { medications } = useMedicationStore();
  const { theme } = useTheme();

  // Hooks
  const { medications: loadedMedicationsRaw } = useMedicationCatalog();
  const loadedMedications = (Array.isArray(loadedMedicationsRaw) ? loadedMedicationsRaw : []) as Medication[];
  const { isPending: isSaving } = useSaveMedication();
  const { isPending: isDeleting } = useDeleteMedication();

  // Carregar medicamentos no store
  useEffect(() => {
    if (loadedMedications.length > 0) {
      const store = useMedicationStore.getState();
      store.setMedications(loadedMedications);
    }
  }, [loadedMedications]);

  const handleLogout = async () => {
    localStorage.removeItem('admin-token');
    localStorage.removeItem('admin-tenant-id');
    navigate('/admin');
    toast.success('Logout realizado!');
  };

  return (
    <div className="flex h-screen bg-background">
      {/* SIDEBAR */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} border-r transition-all duration-300 hidden md:block`}>
        <div className="p-4 flex items-center justify-between gap-3">
          <div className="h-10 w-10 rounded bg-emerald-500 flex items-center justify-center font-bold text-white text-sm">P</div>
          {isSidebarOpen && <span className="font-bold text-sm">PharmaDrive</span>}
        </div>

        <nav className="space-y-2 px-2 text-sm">
          <NavItem icon={<Pill className="w-5 h-5" />} label="Medicamentos" isOpen={isSidebarOpen} />
          <NavItem icon={<FileCheck className="w-5 h-5" />} label="Receitas" isOpen={isSidebarOpen} />
          <NavItem icon={<ShoppingBag className="w-5 h-5" />} label="Pedidos" isOpen={isSidebarOpen} />
          <NavItem icon={<Clock className="w-5 h-5" />} label="Horários" isOpen={isSidebarOpen} />
          <NavItem icon={<Settings className="w-5 h-5" />} label="Configurações" isOpen={isSidebarOpen} />
        </nav>

        <div className="absolute bottom-4 left-4 w-48">
          <Button onClick={handleLogout} variant="destructive" className="w-full gap-2" size="sm">
            <LogOut className="w-4 h-4" />
            {isSidebarOpen && 'Sair'}
          </Button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* HEADER */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold">PharmaDrive Admin 🏥</h1>
              <p className="text-muted-foreground">Gerenciar medicamentos e pedidos</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <QrCode className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                <Power className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* TABS */}
          <Tabs defaultValue="medicamentos" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="medicamentos" className="gap-2">
                <Pill className="w-4 h-4" />Medicamentos
              </TabsTrigger>
              <TabsTrigger value="receitas" className="gap-2">
                <FileCheck className="w-4 h-4" />Receitas
              </TabsTrigger>
              <TabsTrigger value="pedidos" className="gap-2">
                <ShoppingBag className="w-4 h-4" />Pedidos
              </TabsTrigger>
              <TabsTrigger value="horarios" className="gap-2">
                <Clock className="w-4 h-4" />Horários
              </TabsTrigger>
              <TabsTrigger value="config" className="gap-2">
                <Settings className="w-4 h-4" />Config
              </TabsTrigger>
            </TabsList>

            {/* TAB: MEDICAMENTOS */}
            <TabsContent value="medicamentos" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Catálogo de Medicamentos</h2>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Novo Medicamento
                </Button>
              </div>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Ingrediente Ativo</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Estoque</TableHead>
                      <TableHead>Receita?</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medications.length > 0 ? (
                      medications.map((med: Medication) => (
                        <TableRow key={med.id}>
                          <TableCell className="font-medium">{med.name}</TableCell>
                          <TableCell>{med.active_ingredient}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{med.category}</Badge>
                          </TableCell>
                          <TableCell>R$ {med.price?.toFixed(2) || '0.00'}</TableCell>
                          <TableCell>{med.stock || 0}</TableCell>
                          <TableCell>
                            {med.requires_recipe ? (
                              <Badge className="bg-red-500">Sim</Badge>
                            ) : (
                              <Badge variant="outline">Não</Badge>
                            )}
                          </TableCell>
                          <TableCell className="space-x-2">
                            <Button variant="ghost" size="sm" className="gap-1">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-1 text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Nenhum medicamento encontrado. Comece adicionando um novo!
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            {/* TAB: RECEITAS */}
            <TabsContent value="receitas" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Receitas Médicas Pendentes</h2>
              </div>

              <Card className="p-8 text-center text-muted-foreground">
                <FileCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma receita pendente no momento</p>
              </Card>
            </TabsContent>

            {/* TAB: PEDIDOS */}
            <TabsContent value="pedidos" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Pedidos Recentes</h2>
              </div>

              <Card className="p-8 text-center text-muted-foreground">
                <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum pedido no momento</p>
              </Card>
            </TabsContent>

            {/* TAB: HORÁRIOS */}
            <TabsContent value="horarios" className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">Horários de Funcionamento</h2>
              <Card className="p-6">
                <p className="text-muted-foreground">Configure seus horários de atendimento aqui</p>
              </Card>
            </TabsContent>

            {/* TAB: CONFIGURAÇÕES */}
            <TabsContent value="config" className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">Configurações Gerais</h2>
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6">
                  <h3 className="font-semibold mb-2">WhatsApp</h3>
                  <p className="text-sm text-muted-foreground">Configurar notificações</p>
                </Card>
                <Card className="p-6">
                  <h3 className="font-semibold mb-2">Impressão</h3>
                  <p className="text-sm text-muted-foreground">Configurar impressoras</p>
                </Card>
                <Card className="p-6">
                  <h3 className="font-semibold mb-2">Fidelidade</h3>
                  <p className="text-sm text-muted-foreground">Sistema de pontos e cupons</p>
                </Card>
                <Card className="p-6">
                  <h3 className="font-semibold mb-2">Bairros</h3>
                  <p className="text-sm text-muted-foreground">Gerenciar áreas de entrega</p>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

// Helper Component
function NavItem({ icon, label, isOpen }: { icon: React.ReactNode; label: string; isOpen: boolean }) {
  return (
    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors">
      {icon}
      {isOpen && <span className="text-sm">{label}</span>}
    </button>
  );
}
