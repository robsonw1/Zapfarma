import { useState, useRef, useEffect, useCallback } from 'react';

interface UseCarouselProps {
  totalItems: number;
  onCategoryChange?: (index: number) => void;
}

export const useCategoryCarousel = ({ totalItems, onCategoryChange }: UseCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Ir para próxima categoria
  const nextCategory = useCallback(() => {
    if (isAnimating || currentIndex >= totalItems - 1) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => prev + 1);
    setTimeout(() => setIsAnimating(false), 300);
  }, [currentIndex, totalItems, isAnimating]);

  // Ir para categoria anterior
  const prevCategory = useCallback(() => {
    if (isAnimating || currentIndex <= 0) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => prev - 1);
    setTimeout(() => setIsAnimating(false), 300);
  }, [currentIndex, isAnimating]);

  // Ir para categoria específica
  const goToCategory = useCallback((index: number) => {
    if (index < 0 || index >= totalItems || isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 300);
  }, [totalItems, isAnimating]);

  // Handle touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const swipeThreshold = 50;
    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swiped left - próxima categoria
        nextCategory();
      } else {
        // Swiped right - categoria anterior
        prevCategory();
      }
    }
  };

  // Scroll automático para a categoria atual
  useEffect(() => {
    if (!containerRef.current) return;

    const scrollBehavior = () => {
      if (containerRef.current) {
        const element = containerRef.current.children[currentIndex] as HTMLElement;
        if (element) {
          const container = containerRef.current;
          const elementLeft = element.offsetLeft;
          const elementWidth = element.offsetWidth;
          const containerWidth = container.clientWidth;
          const containerScroll = container.scrollLeft;

          // Calcular posição para centralizar a categoria
          const targetScroll = elementLeft - (containerWidth - elementWidth) / 2;

          container.scrollTo({
            left: Math.max(0, targetScroll),
            behavior: 'smooth',
          });
        }
      }
    };

    scrollBehavior();
    onCategoryChange?.(currentIndex);
  }, [currentIndex, onCategoryChange]);

  // Verificar visibilidade das setas
  const canGoNext = currentIndex < totalItems - 1;
  const canGoPrev = currentIndex > 0;

  return {
    currentIndex,
    containerRef,
    nextCategory,
    prevCategory,
    goToCategory,
    handleTouchStart,
    handleTouchEnd,
    canGoNext,
    canGoPrev,
    isAnimating,
  };
};
