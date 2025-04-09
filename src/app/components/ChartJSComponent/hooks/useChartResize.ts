import { Chart } from "chart.js";
import { RefObject, useCallback, useEffect, useRef } from "react";

/**
 * Хук для управления размерами графика
 * @param chartRef - Ссылка на canvas элемент
 * @param chartInstanceRef - Ссылка на экземпляр графика
 * @param chartContainerRef - Ссылка на контейнер графика
 * @param aspectRatio - Соотношение сторон графика
 */
export const useChartResize = (
  chartRef: RefObject<HTMLCanvasElement | null>,
  chartInstanceRef: RefObject<Chart | null>,
  chartContainerRef: RefObject<HTMLDivElement | null>,
  aspectRatio: number
) => {
  const isResizingRef = useRef(false);

  // Изменение размера графика под размер контейнера
  const resizeChartToContainer = useCallback(() => {
    if (isResizingRef.current) return;
    if (!chartContainerRef.current || !chartRef.current || !chartInstanceRef.current) return;
    
    isResizingRef.current = true;
    
    // Рассчитываем размеры контейнера с учетом отступов
    const containerRect = chartContainerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    
    // Применяем отступы
    const horizontalPadding = 30; // Общий отступ слева+справа
    const verticalPadding = 30;   // Общий отступ сверху+снизу
    
    // Рассчитываем целевые размеры
    let targetWidth = containerWidth - horizontalPadding;
    let targetHeight = containerHeight - verticalPadding;
    
    // Применяем соотношение сторон, если задано
    if (aspectRatio > 0) {
      // Рассчитываем высоту на основе ширины и соотношения сторон
      const heightFromWidth = targetWidth / aspectRatio;
      
      // Если рассчитанная высота помещается в контейнер, используем её
      if (heightFromWidth <= targetHeight) {
        targetHeight = heightFromWidth;
      } else {
        // Иначе рассчитываем ширину на основе высоты
        targetWidth = targetHeight * aspectRatio;
      }
    }

    if (targetWidth <= 0 || targetHeight <= 0) {
      isResizingRef.current = false;
      return;
    }
    
    // Обновляем размеры canvas - устанавливаем ТОЛЬКО атрибуты, не стили
    const canvas = chartRef.current;
    canvas.width = targetWidth * window.devicePixelRatio;
    canvas.height = targetHeight * window.devicePixelRatio;
    
    // Устанавливаем стили с правильными размерами для отображения
    canvas.style.width = `${targetWidth}px`;
    canvas.style.height = `${targetHeight}px`;
    
    // Обновляем график с учетом новых размеров
    chartInstanceRef.current.resize();
    
    // Короткий таймаут для предотвращения бесконечных циклов изменения размера
    setTimeout(() => {
      isResizingRef.current = false;
    }, 100);
  }, [aspectRatio, chartContainerRef, chartInstanceRef, chartRef]);

  // Добавляем ResizeObserver для отслеживания изменений размера контейнера
  useEffect(() => {
    if (!chartContainerRef.current) return;
    
    const resizeObserver = new ResizeObserver(() => {
      resizeChartToContainer();
    });
    
    resizeObserver.observe(chartContainerRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [resizeChartToContainer, chartContainerRef]);

  return { resizeChartToContainer };
};
