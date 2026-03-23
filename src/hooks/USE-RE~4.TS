import { useMemo } from 'react';
import { CartItem } from '@/data/products';

export function useReceiptValidation(items: CartItem[]) {
  const medicationsRequiringReceipt = useMemo(() => {
    return items.filter((item) => {
      const requiresRecipe = (item.product as any).requires_recipe;
      const isControlled = (item.product as any).is_controlled;
      return requiresRecipe || isControlled;
    });
  }, [items]);

  const hasUnvalidatedMedications = medicationsRequiringReceipt.length > 0;
  const medicationNames = medicationsRequiringReceipt
    .map((item) => item.product.name)
    .join(', ');

  const validateReceipts = (): boolean => {
    if (!hasUnvalidatedMedications) {
      return true; // Nenhum medicamento requer receita
    }

    // TODO: Em produção, validar se receitas foram uploadadas
    // Por enquanto, apenas alertar que medicamentos requerem receita
    return true; // Permitir por enquanto (receita será uploadada no ProductModal)
  };

  return {
    hasUnvalidatedMedications,
    medicationsRequiringReceipt,
    medicationNames,
    validateReceipts,
  };
}
