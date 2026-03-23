-- ========================================
-- FIX: Habilitar RLS e Policies na Tabela TENANTS
-- ========================================
-- Problema: 401 Unauthorized ao buscar tenants
-- Solução: Adicionar RLS policies permitindo leitura pública

-- ✅ Passo 1: Habilitar RLS na tabela tenants
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- ✅ Passo 2: Criar policy de LEITURA PÚBLICA (anon users podem buscar tenant padrão)
-- Isso permite que o CheckoutModal busque o tenant padrão sem autenticação
CREATE POLICY "Tenant Read Public" ON tenants
  FOR SELECT
  USING (true);  -- Permite que QUALQUER um leia

-- ✅ Passo 3: Criar policy de ATUALIZAÇÃO para admin (para futuros updates)
CREATE POLICY "Tenant Update Admin" ON tenants
  FOR UPDATE
  USING (
    -- Verificar se é admin (usa a tabela admin_users)
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = auth.jwt() ->> 'email'
        AND is_active = true
    )
  );

-- ✅ Passo 4: Criar policy de DELETE para admin
CREATE POLICY "Tenant Delete Admin" ON tenants
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = auth.jwt() ->> 'email'
        AND is_active = true
    )
  );

-- ✅ Passo 5: Criar policy de INSERT para admin
CREATE POLICY "Tenant Insert Admin" ON tenants
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = auth.jwt() ->> 'email'
        AND is_active = true
    )
  );

-- ========================================
-- VERIFICAÇÃO: Confirmar que policies foram criadas
-- ========================================
-- Execute esta query para confirmar:
-- SELECT * FROM pg_policies WHERE tablename = 'tenants';

-- ========================================
-- TESTE: Verificar se consegue ler tenants
-- ========================================
-- Execute como usuário anon (dev):
-- SELECT id FROM tenants LIMIT 1;
-- Deve retornar a primeira linha sem erro 401

-- Se não há nenhum tenant no banco, insira um padrão:
INSERT INTO tenants (name, slug) 
VALUES ('Default', 'default')
ON CONFLICT (slug) DO NOTHING;
