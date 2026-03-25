import { useState } from 'react';
import { Medication } from '@/data/pharmacy';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface MedicationDetailsModalProps {
  medication: Medication | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (medication: Medication, quantity: number) => void;
}

export function MedicationDetailsModal({
  medication,
  isOpen,
  onClose,
  onAddToCart,
}: MedicationDetailsModalProps) {
  const [quantity, setQuantity] = useState(1);

  if (!medication) return null;

  const handleAddToCart = () => {
    if (quantity < 1) {
      toast.error('Quantidade deve ser maior que 0');
      return;
    }

    const maxQty = medication.max_quantity_per_order || 10;
    if (quantity > maxQty) {
      toast.error(`Máximo ${maxQty} unidades por pedido`);
      return;
    }

    onAddToCart(medication, quantity);
    toast.success(`${medication.name} adicionado ao carrinho!`);
    setQuantity(1);
    onClose();
  };

  const handleQuantityChange = (value: number) => {
    const maxQty = medication.max_quantity_per_order || 10;
    if (value >= 1 && value <= maxQty) {
      setQuantity(value);
    }
  };

  const isOutOfStock = !medication.is_active || (medication.stock === 0);
  const maxQty = medication.max_quantity_per_order || 10;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{medication.name}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {medication.is_active && (
                <Badge variant="outline" className="bg-green-50">
                  ✅ Disponível
                </Badge>
              )}
              {medication.requires_recipe && (
                <Badge variant="destructive">Requer Receita</Badge>
              )}
              {medication.is_controlled && (
                <Badge className="bg-red-600">⚠️ Controlado</Badge>
              )}
              {medication.stock !== undefined && (
                <Badge variant="secondary">
                  Stock: {medication.stock} un.
                </Badge>
              )}
            </div>

            {/* Descrição */}
            <div>
              <h3 className="font-semibold mb-2">Descrição</h3>
              <p className="text-gray-700 text-sm">{medication.description}</p>
            </div>

            {/* Ingrediente Ativo */}
            {medication.active_ingredient && (
              <div>
                <h3 className="font-semibold mb-2">Ingrediente Ativo</h3>
                <p className="text-gray-700 text-sm italic">
                  {medication.active_ingredient}
                </p>
              </div>
            )}

            {/* Categoria */}
            <div>
              <h3 className="font-semibold mb-2">Categoria</h3>
              <Badge variant="outline">{medication.category}</Badge>
            </div>

            {/* Avisos */}
            {medication.requires_recipe && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  Este medicamento requer receita médica. Você precisará fazer upload de uma receita válida antes da entrega.
                </AlertDescription>
              </Alert>
            )}

            {medication.is_controlled && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Medicamento controlado. Requer documentação especial na entrega.
                </AlertDescription>
              </Alert>
            )}

            {isOutOfStock && (
              <Alert className="border-gray-300 bg-gray-50">
                <AlertCircle className="h-4 w-4 text-gray-600" />
                <AlertDescription className="text-gray-700">
                  Medicamento indisponível no momento.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </ScrollArea>

        {/* Rodapé - Preço e Adicionar */}
        <div className="border-t pt-4 space-y-4">
          {/* Preço */}
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-green-600">
              R$ {medication.price.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500">por unidade</span>
          </div>

          {/* Quantidade */}
          {!isOutOfStock && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Quantidade:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(quantity - 1)}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                type="number"
                min="1"
                max={maxQty}
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                className="w-16 text-center"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(quantity + 1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
              <span className="text-xs text-gray-500">Máx: {maxQty}</span>
            </div>
          )}

          {/* Botão Adicionar */}
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-full"
            size="lg"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {isOutOfStock
              ? 'Indisponível'
              : `Adicionar ao Carrinho - R$ ${(medication.price * quantity).toFixed(2)}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
