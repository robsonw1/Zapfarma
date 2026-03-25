import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Copy, Plus } from 'lucide-react';

export const TenantManagementPanel = () => {
  const [tenantName, setTenantName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const currentTenantId = localStorage.getItem('admin-tenant-id') || 'Não configurado';

  const handleCreateTenant = async () => {
    if (!tenantName.trim()) {
      toast.error('Nome do tenant é obrigatório');
      return;
    }

    setIsLoading(true);
    try {
      const newTenantId = crypto.randomUUID();

      // Insert new tenant into the tenants table
      const { error } = await supabase
        .from('tenants')
        .insert([
          {
            id: newTenantId,
            name: tenantName,
            slug: tenantName.toLowerCase().replace(/\s+/g, '-'),
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) throw error;

      // Save new tenant_id to localStorage
      localStorage.setItem('admin-tenant-id', newTenantId);
      toast.success(`Tenant "${tenantName}" criado com sucesso! Recarregando...`);

      // Reload the page to apply new tenant_id
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Erro ao criar tenant:', error);
      toast.error('Erro ao criar tenant');
    } finally {
      setIsLoading(false);
    }
  };

  const copyTenantId = () => {
    if (currentTenantId !== 'Não configurado') {
      navigator.clipboard.writeText(currentTenantId);
      toast.success('Tenant ID copiado!');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Tenant Atual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>ID do Tenant</Label>
            <div className="flex gap-2">
              <code className="flex-1 bg-muted p-2 rounded text-sm break-all">
                {currentTenantId}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={copyTenantId}
                disabled={currentTenantId === 'Não configurado'}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Criar Novo Tenant</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tenant-name">Nome do Tenant</Label>
              <Input
                id="tenant-name"
                placeholder="Ex: ZapFarma, MeuNegócio..."
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleCreateTenant}
              disabled={isLoading || !tenantName.trim()}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isLoading ? 'Criando...' : 'Criar Tenant'}
            </Button>
            <p className="text-xs text-muted-foreground">
              ⚠️ Ao criar um novo tenant, você será desconectado do tenant atual e levado ao novo.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
