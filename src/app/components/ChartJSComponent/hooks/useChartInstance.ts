import { Chart } from "chart.js";
import { useCallback, useEffect, useRef } from "react";

/**
 * Хук для управления экземпляром графика
 * @returns Объект с методами для управления экземпляром графика
 */
export const useChartInstance = () => {
  const chartInstanceRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Уничтожение экземпляра графика
  const destroyChart = useCallback(() => {
    if (chartInstanceRef.current) {
      try {
        chartInstanceRef.current.stop();

        if (chartInstanceRef.current.canvas) {
          chartInstanceRef.current.canvas.removeEventListener("click", () => {});
        }

        // Принудительно очищаем canvas перед уничтожением
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          }
        }

        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;

      } catch (error) {
        console.error("Ошибка при уничтожении графика:", error);
      }
    }
  }, []);

  // Сброс масштаба графика
  const resetZoom = useCallback(() => {
    if (chartInstanceRef.current) {
      if (typeof chartInstanceRef.current.resetZoom === "function") {
        chartInstanceRef.current.resetZoom();
      }
    }
  }, []);

  // Очистка при размонтировании компонента
  useEffect(() => {
    return () => {
      destroyChart();
    };
  }, [destroyChart]);

  return { chartInstanceRef, canvasRef, destroyChart, resetZoom };
};
