import { Chart, ChartType } from "chart.js";
import { useCallback, useEffect, useRef } from "react";

/**
 * Хук для управления экземпляром графика
 * @returns Объект с методами для управления экземпляром графика
 */
export const useChartInstance = () => {
  const chartInstanceRef = useRef<Chart<ChartType> | null>(null);

  // Уничтожение экземпляра графика
  const destroyChart = useCallback(() => {
    if (chartInstanceRef.current) {
      try {
        chartInstanceRef.current.stop();
        chartInstanceRef.current.canvas.removeEventListener("click", () => {});

        // Принудительно очищаем canvas перед уничтожением
        const ctx = chartInstanceRef.current.canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, chartInstanceRef.current.canvas.width, chartInstanceRef.current.canvas.height);
        }

        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;

        setTimeout(() => {}, 0);
      } catch (error) {
        console.error("Ошибка при уничтожении графика:", error);
      }
    }
  }, []);

  // Сброс масштаба графика
  const resetZoom = useCallback(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.resetZoom();
    }
  }, []);

  // Очистка при размонтировании компонента
  useEffect(() => {
    return () => {
      destroyChart();
    };
  }, [destroyChart]);

  return { chartInstanceRef, destroyChart, resetZoom };
};
