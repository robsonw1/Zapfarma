import { Clock, MapPin, Phone, Truck, Store } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Badge } from '@/components/ui/badge';

export function HeroSection() {
  const slogan = useSettingsStore((s) => s.settings.slogan);
  const phone = useSettingsStore((s) => s.settings.phone);
  const deliveryTimeMin = useSettingsStore((s) => s.settings.deliveryTimeMin);
  const deliveryTimeMax = useSettingsStore((s) => s.settings.deliveryTimeMax);
  const pickupTimeMin = useSettingsStore((s) => s.settings.pickupTimeMin);
  const pickupTimeMax = useSettingsStore((s) => s.settings.pickupTimeMax);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-secondary/50 to-background py-12 md:py-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-primary blur-3xl" />
        <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-accent blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <span className="text-xl">🇮🇹</span>
            <span className="text-sm font-medium">{slogan}</span>
          </div>

          {/* Delivery & Pickup Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <Badge
              variant="outline"
              className="gap-2 bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950 cursor-default"
            >
              <Truck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-semibold">
                {deliveryTimeMin}–{deliveryTimeMax}min
              </span>
            </Badge>
            
            <Badge
              variant="outline"
              className="gap-2 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950 cursor-default"
            >
              <Store className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-semibold">
                {pickupTimeMin}–{pickupTimeMax}min
              </span>
            </Badge>
          </div>

          {/* Main Title */}
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4">
            Sabor que vem do
            <span className="text-gradient-warm block mt-2">forno para sua mesa</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {slogan} Ingredientes frescos, massa artesanal 
            e o carinho de uma receita passada por gerações.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <a
              href="#cardapio"
              className="w-full sm:w-auto px-8 py-4 rounded-xl btn-cta text-center"
            >
              Ver Catálogo Completo
            </a>
            <a
              href="#combos"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/80 transition-colors text-center"
            >
              Combos Especiais
            </a>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-card border border-border">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-xs text-muted-foreground">Entrega em</p>
                <p className="font-semibold text-foreground">{deliveryTimeMin}-{deliveryTimeMax} min</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-card border border-border">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-xs text-muted-foreground">Atendemos</p>
                <p className="font-semibold text-foreground">20+ bairros</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-card border border-border">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-xs text-muted-foreground">WhatsApp</p>
                <p className="font-semibold text-foreground">{phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
