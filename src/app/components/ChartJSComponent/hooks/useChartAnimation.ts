import { Chart, ChartType, EasingFunction, Plugin } from "chart.js";
import { RefObject, useCallback, useEffect } from "react";
import { ChartTypeEnum } from "../types";

/**
 * Хук для управления анимациями графика
 * @param chartInstanceRef - Ссылка на экземпляр графика
 * @param chartType - Тип графика
 * @param animationPlaying - Режим воспроизведения анимации
 * @param animationDuration - Длительность анимации
 * @param animationType - Тип анимации (функция плавности)
 */
export const useChartAnimation = (
  chartInstanceRef: RefObject<Chart<ChartType> | null>,
  chartType: ChartTypeEnum,
  animationPlaying: string,
  animationDuration: number,
  animationType: EasingFunction
) => {
    // Анимация для линейных графиков
  const setupLineAnimation = useCallback(() => {
    if (!chartInstanceRef.current) return;
    
    chartInstanceRef.current.options.animations = {
      tension: {
        duration: animationDuration,
        easing: animationType,
        from: 0,
        to: 1,
        loop: true
      }
    };

    // Обновляем все датасеты, чтобы применить tension
    chartInstanceRef.current.data.datasets.forEach(dataset => {
      if ("tension" in dataset) {
        dataset.tension = 0; // Начальное значение
      }
    });
  }, [animationDuration, animationType, chartInstanceRef]);

  // Анимация для круговых диаграмм
  const setupPieAnimation = useCallback(() => {
    // Добавляем плагин для вращения
    const rotatePlugin = {
      id: "rotateAnimation",
      beforeDraw(chart: Chart) {
        const ctx = chart.ctx;
        const centerX = chart.chartArea.left + chart.chartArea.width / 2;
        const centerY = chart.chartArea.top + chart.chartArea.height / 2;
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate((Date.now() / 3000) % (Math.PI * 2));
        ctx.translate(-centerX, -centerY);
      },
      afterDraw(chart: Chart) {
        chart.ctx.restore();
      }
    };
    
    // Регистрируем плагин
    Chart.register(rotatePlugin);
  }, []);

  // Анимация для столбчатых диаграмм
  const setupBarAnimation = useCallback(() => {
    const barAnimationPlugin: Plugin<"bar"> = {
      id: "barAnimation",
      beforeDraw(chart: Chart) {
        if (animationPlaying !== "loop") return;
        
        const meta = chart.getDatasetMeta(0);
        const factor = Math.abs(Math.sin(Date.now() / 1000) * 0.2 + 0.8); // 0.8-1.0 range
        
        meta.data.forEach((element) => {
          // First cast to unknown, then to our desired type
          const bar = element as unknown as {
            base?: number;
            y?: number;
            x?: number;
            [key: string]: unknown;
          };
          
          if (bar && typeof bar.base === "number" && typeof bar.y === "number") {
            const height = bar.base - bar.y;
            bar.y = bar.base - (height * factor);
          }
        });
      }
    };
    
    // Регистрируем плагин
    Chart.register(barAnimationPlugin);
  }, [animationPlaying]);

  // Анимация для радарных диаграмм
  const setupRadarAnimation = useCallback(() => {
    const scalePlugin: Plugin<"radar"> = {
      id: "scalePlugin",
      beforeDraw(chart: Chart) {
        const scale = 0.8 + Math.abs(Math.sin(Date.now() / 1000) * 0.2);
        const ctx = chart.ctx;
        ctx.save();
        // Масштабируем только данные, не сетку
        const centerX = chart.chartArea.left + chart.chartArea.width / 2;
        const centerY = chart.chartArea.top + chart.chartArea.height / 2;
        
        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale);
        ctx.translate(-centerX, -centerY);
      },
      afterDraw(chart: Chart) {
        chart.ctx.restore();
      }
    };
    
    // Регистрируем плагин
    Chart.register(scalePlugin);
  }, []);
  
  // Настройка циклической анимации
  const setupLoopAnimation = useCallback((chartType: ChartTypeEnum) => {
    if (!chartInstanceRef.current) return;
    
    switch (chartType) {
      case ChartTypeEnum.LINE:
        setupLineAnimation();
        break;
      case ChartTypeEnum.PIE:
      case ChartTypeEnum.DOUGHNUT:
        setupPieAnimation();
        break;
      case ChartTypeEnum.BAR:
        setupBarAnimation();
        break;
      case ChartTypeEnum.RADAR:
      case ChartTypeEnum.POLAR_AREA:
        setupRadarAnimation();
        break;
    }
  }, [chartInstanceRef, setupLineAnimation, setupPieAnimation, setupBarAnimation, setupRadarAnimation]);

  // Настройка анимации в зависимости от типа графика
  const setupAnimation = useCallback(() => {
    if (!chartInstanceRef.current) return;
    
    // Сначала удалим все предыдущие плагины анимации
    const pluginsToRemove = ["rotateAnimation", "scalePlugin", "barAnimation"];
    pluginsToRemove.forEach(pluginId => {
      const plugin = Chart.registry.plugins.get(pluginId);
      if (plugin) {
        Chart.unregister(plugin);
      }
    });
    
    // Сбрасываем анимации
    chartInstanceRef.current.options.animations = {};

    // Настраиваем анимацию только если выбран режим "loop"
    if (animationPlaying === "loop") {
      setupLoopAnimation(chartType);
    }
    
    chartInstanceRef.current.update();
  }, [chartInstanceRef, animationPlaying, setupLoopAnimation, chartType]);

  // Запуск анимации и настройка интервала обновления
  useEffect(() => {
    setupAnimation();
    
    // Настраиваем интервал для обновления анимации для плагинов
    let animationInterval: NodeJS.Timeout | null = null;
    
    if (animationPlaying === "loop" && 
        (chartType === ChartTypeEnum.PIE || chartType === ChartTypeEnum.DOUGHNUT || 
        chartType === ChartTypeEnum.RADAR || chartType === ChartTypeEnum.BAR)) {
      
      animationInterval = setInterval(() => {
        if (chartInstanceRef.current && animationPlaying === "loop") {
          chartInstanceRef.current.update();
        } else if (animationInterval) {
          clearInterval(animationInterval);
        }
      }, 50); // Обновляем каждые 50мс для плавности
    }
    
    // Очистка при размонтировании
    return () => {
      if (animationInterval) {
        clearInterval(animationInterval);
      }

      // Отменяем регистрацию плагинов
      ["rotateAnimation", "scalePlugin", "barAnimation"].forEach(pluginId => {
        const plugin = Chart.registry.plugins.get(pluginId);
        if (plugin) {
          Chart.unregister(plugin);
        }
      });
    };
  }, [setupAnimation, chartType, animationPlaying, chartInstanceRef]);

  return { setupAnimation };
};
