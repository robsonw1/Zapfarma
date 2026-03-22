import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Carrega configuração em runtime (prioridade: config.json > variáveis de ambiente > valores padrão)
async function loadSupabaseConfig() {
  try {
    // Tentar carregar config.json (gerado em tempo de build)
    const response = await fetch('/config.json');
    if (response.ok) {
      const config = await response.json();
      console.log('[Supabase] ✅ Config carregada de /config.json');
      return {
        url: config.supabaseUrl,
        key: config.supabasePublishableKey,
      };
    }
  } catch (error) {
    console.warn('[Supabase] ⚠️  Não foi possível carregar /config.json:', error);
  }

  // Fallback para variáveis de ambiente (desenvolvimento local)
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (envUrl && envKey) {
    console.log('[Supabase] ✅ Config carregada de variáveis de ambiente');
    return {
      url: envUrl,
      key: envKey,
    };
  }

  // Se nada funcionar, usar valores padrão (devem estar em config.json ou .env)
  console.warn('[Supabase] ⚠️  Usando config padrão');
  return {
    url: 'https://towmfxficdkrgfwghcer.supabase.co',
    key: 'sb_live_O5iF9eHqrKkxQPvASr7RvxZcTwEm1hq1nJOvTKzAZjWOjdVCM3x4zFLu5wPOhXkc8aZxGOqL7sNR0qrXEY9L',
  };
}

// Criar cliente com configuração padrão na inicialização
const defaultConfig = {
  url: 'https://towmfxficdkrgfwghcer.supabase.co',
  key: 'sb_live_O5iF9eHqrKkxQPvASr7RvxZcTwEm1hq1nJOvTKzAZjWOjdVCM3x4zFLu5wPOhXkc8aZxGOqL7sNR0qrXEY9L',
};

// Cliente singleton
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

function getSupabaseInstance(): ReturnType<typeof createClient<Database>> {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(defaultConfig.url, defaultConfig.key, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return supabaseInstance;
}

// Exportar cliente sincronamente
export const supabase = getSupabaseInstance();

// Função para reinicializar com config dinâmica (quando config.json fica disponível)
export async function initSupabase() {
  try {
    const config = await loadSupabaseConfig();
    
    // Se config mudou comparado ao padrão, reconstruir cliente
    if (config.url !== defaultConfig.url || config.key !== defaultConfig.key) {
      supabaseInstance = createClient<Database>(config.url, config.key, {
        auth: {
          storage: localStorage,
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      console.log('[Supabase] ✅ Cliente reinicializado com nova configuração');
    }
    
    return supabaseInstance!;
  } catch (error) {
    console.error('[Supabase] ❌ Erro ao inicializar:', error);
    return supabase;
  }
}