import { Medication } from '@/data/pharmacy';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, Pill } from 'lucide-react';
import { useUIStore } from '@/store/useStore';
import { motion } from 'framer-motion';

interface MedicationCardProps {
  medication: Medication;
  index?: number;
}

export function MedicationCard({ medication, index = 0 }: MedicationCardProps) {
  const { setSelectedProduct, setProductModalOpen } = useUIStore();

  const isUnavailable = !medication.is_active || medication.stock <= 0;

  const handleClick = () => {
    if (isUnavailable) return;
    // Usar o mesmo modal, mas passando como medication
    setSelectedProduct(medication as any);
    setProductModalOpen(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={
        "card-product group relative " +
        (isUnavailable ? "cursor-not-allowed" : "cursor-pointer")
      }
      onClick={handleClick}
    >
      {/* Overlay para medicamento indisponível */}
      {isUnavailable && (
        <div className="absolute inset-0 bg-black/15 rounded-xl flex flex-col items-center justify-center z-10 group-hover:bg-black/20 transition-all duration-300">
          <AlertCircle className="w-10 h-10 text-red-500 mb-1.5" />
          <div className="text-center">
            <p className="text-white font-bold text-sm">Medicamento</p>
            <p className="text-white font-bold text-sm">indisponível</p>
          </div>
        </div>
      )}

      {/* Badges - Avisos importantes */}
      <div className="flex flex-wrap gap-2 p-4 pb-0">
        {medication.is_active && (
          <Badge variant="default" className="badge-popular flex items-center gap-1">
            <Pill className="w-3 h-3" />
            Disponível
          </Badge>
        )}
        {medication.requires_recipe && (
          <Badge variant="destructive" className="flex items-center gap-1 bg-orange-600">
            <AlertTriangle className="w-3 h-3" />
            Requer Receita
          </Badge>
        )}
        {medication.is_controlled && (
          <Badge variant="destructive" className="flex items-center gap-1 bg-red-700">
            <AlertTriangle className="w-3 h-3" />
            Controlado
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-heading text-lg font-semibold text-foreground mb-1 line-clamp-1">
          {medication.name}
        </h3>
        
        <p className="text-xs text-muted-foreground mb-1 italic">
          {medication.active_ingredient}
        </p>
        
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {medication.description}
        </p>

        {/* Stock Info */}
        <div className="mb-3 flex items-center justify-between text-xs">
          <span className={medication.stock > 10 ? "text-green-600" : medication.stock > 0 ? "text-orange-600" : "text-red-600"}>
            📦 {medication.stock > 0 ? `${medication.stock} em estoque` : '❌ Esgotado'}
          </span>
          {medication.max_quantity_per_order && (
            <span className="text-blue-600 font-semibold">
              Máx: {medication.max_quantity_per_order}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-primary">
              {formatPrice(medication.price)}
            </span>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="text-primary hover:bg-primary/10"
            disabled={isUnavailable}
          >
            {isUnavailable ? "Indisponível" : "Ver detalhes"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
