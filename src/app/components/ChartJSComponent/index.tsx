import { useIsDarkMode } from "@/app/hooks/useIsDarkMode";
import { Card, Col, Row } from "antd";
import {
  ArcElement,
  BarController,
  BarElement,
  BubbleController,
  CategoryScale,
  ChartData,
  Chart as ChartJS,
  ChartOptions,
  ChartType,
  Colors,
  DoughnutController,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PieController,
  PointElement,
  PolarAreaController,
  RadarController,
  RadialLinearScale,
  ScatterController,
  SubTitle,
  Title,
  Tooltip
} from "chart.js";
import Zoom from "chartjs-plugin-zoom";
import { FC, useCallback, useEffect, useReducer, useState } from "react";
import { chartReducer, initialChartState } from "./chartReducer";
import { ChartCanvas } from "./components/ChartCanvas";
import ChartControls from "./components/ChartControls";
import { ChartHeader } from "./components/ChartHeader";
import { colorSchemes, easingOptions } from "./constants";
import { useChartAnimation } from "./hooks/useChartAnimation";
import { useChartInstance } from "./hooks/useChartInstance";
import { ChartActionTypes, ChartJSComponentProps, ChartTypeEnum, DatasetEnum } from "./types";
import { applyColorScheme, getChartData } from "./utils/chartDataHelpers";
import { createBaseOptions, createDualAxisOptions, createRadarOptions } from "./utils/chartOptions";

// Регистрация необходимых компонентов Chart.js
ChartJS.register(
  // Шкалы
  CategoryScale,
  LinearScale,
  RadialLinearScale,

  // Элементы
  LineElement,
  PointElement,
  BarElement,
  ArcElement,

  // Контроллеры
  LineController,
  BarController,
  PolarAreaController,
  RadarController,
  DoughnutController,
  PieController,
  BubbleController,
  ScatterController,

  // Плагины
  Title,
  Tooltip,
  Legend,
  SubTitle,
  Colors,

  Zoom
);

/**
 * Получает список совместимых типов графиков для выбранного датасета
 * @param datasetType - Тип датасета
 * @returns Массив совместимых типов графиков
 */
export const getCompatibleChartTypes = (datasetType: DatasetEnum): ChartTypeEnum[] => {
  switch (datasetType) {
    case DatasetEnum.SALES:
      return [ChartTypeEnum.LINE, ChartTypeEnum.BAR];
    case DatasetEnum.USERS:
      return [ChartTypeEnum.LINE, ChartTypeEnum.BAR];
    case DatasetEnum.PERFORMANCE:
      return [ChartTypeEnum.RADAR, ChartTypeEnum.POLAR_AREA];
    case DatasetEnum.REVENUE:
      return [ChartTypeEnum.LINE, ChartTypeEnum.BAR];
    case DatasetEnum.DEMOGRAPHICS:
      return [ChartTypeEnum.PIE, ChartTypeEnum.DOUGHNUT];
    case DatasetEnum.COMPARISON:
      return [ChartTypeEnum.BAR];
    case DatasetEnum.TIME_DATA:
      return [ChartTypeEnum.LINE];
    default:
      return Object.values(ChartTypeEnum);
  }
};

/**
 * Основной компонент для отображения графиков с использованием Chart.js
 */
export const ChartJSComponent: FC<ChartJSComponentProps> = ({ 
  fontSize = 14,
  fontFamily = "Arial",
  customData = null,
}) => {
  // Состояние и редьюсер для управления настройками графика
  const [state, dispatch] = useReducer(chartReducer, initialChartState);
  
  // Настройки масштабирования
  const [zoomSettings, setZoomSettings] = useState({
    enableZoom: true,
    zoomMode: "xy" as "xy" | "x" | "y",
    enablePan: true,
    zoomSpeed: 0.5
  });

  // Хуки для работы с графиком
  const { chartInstanceRef, canvasRef, destroyChart } = useChartInstance();
  const isDarkMode = useIsDarkMode();

  // Обновляем список совместимых типов графиков при изменении датасета
  useEffect(() => {
    // Если есть пользовательские данные, разрешаем все типы графиков
    if (customData) {
      dispatch({ type: ChartActionTypes.SET_COMPATIBLE_TYPES, payload: Object.values(ChartTypeEnum) });
    } else {
      // Иначе используем логику совместимости с моковыми данными
      const chartTypes = getCompatibleChartTypes(state.dataConfig.selectedDataset);
      dispatch({ type: ChartActionTypes.SET_COMPATIBLE_TYPES, payload: chartTypes });
      
      // Если текущий выбранный тип графика не совместим с новым датасетом,
      // выбираем первый доступный тип из списка совместимых
      if (chartTypes.length > 0 && !chartTypes.includes(state.dataConfig.selectedChartType)) {
        dispatch({ type: ChartActionTypes.SET_CHART_TYPE, payload: chartTypes[0] });
      }
    }
  }, [state.dataConfig.selectedChartType, state.dataConfig.selectedDataset, customData]);

  // Обновление опций графика при изменении настроек
  const updateChartOptions = useCallback(() => {
    // Создаем базовые опции
    const baseOptions = createBaseOptions(isDarkMode, fontFamily, fontSize);
    
    // Добавляем специфичные настройки в зависимости от типа графика
    let newOptions: ChartOptions<ChartType> = {
      ...baseOptions,
      aspectRatio: state.appearance.aspectRatio,
      animation: {
        duration: state.animation.animationPlaying === "loop" ? 100 : state.animation.animationDuration,
        delay: state.animation.animationDelay,
        easing: state.animation.animationType,
      },
      elements: {
        line: {
          tension: state.appearance.tension,
          borderWidth: state.appearance.borderWidth,
        },
        point: {
          radius: 4,
          borderWidth: state.appearance.borderWidth,
        },
        bar: {
          borderWidth: state.appearance.borderWidth,
        },
        arc: {
          borderWidth: state.appearance.borderWidth,
        }
      },
      plugins: {
        ...baseOptions.plugins,
        legend: {
          display: state.appearance.showLegend,
          position: state.appearance.legendPosition,
          labels: {
            font: {
              family: fontFamily,
              size: fontSize,
            },
            color: state.appearance.legendColor,
          }
        },
        title: {
          display: state.titleConfig.showTitle,
          font: {
            size: fontSize + 2,
            family: fontFamily,
            weight: "bold",
          },
          text: state.titleConfig.chartTitle,
          color: state.titleConfig.titleColor,
        },
        subtitle: {
          display: state.titleConfig.showSubtitle,
          text: state.titleConfig.subtitle,
          color: state.titleConfig.subtitleColor,
          font: {
            size: fontSize - 1,
            family: fontFamily,
          },
          padding: {
            top: 5,
            bottom: 10,
          }
        },
        zoom: {
          pan: {
            enabled: zoomSettings.enablePan && zoomSettings.enableZoom,
            mode: zoomSettings.zoomMode,
          },
          zoom: {
            wheel: {
              enabled: zoomSettings.enableZoom,
              speed: zoomSettings.zoomSpeed,
            },
            pinch: {
              enabled: zoomSettings.enableZoom,
            },
            mode: zoomSettings.zoomMode,
          }
        }
      },
    };

    // Специфичные настройки для разных типов графиков
    if (state.dataConfig.selectedChartType === ChartTypeEnum.RADAR || 
        state.dataConfig.selectedChartType === ChartTypeEnum.POLAR_AREA) {
      newOptions = createRadarOptions(
        newOptions, 
        isDarkMode, 
        fontFamily, 
        fontSize, 
        state.appearance.legendColor
      );
    } else if ((state.dataConfig.selectedDataset === DatasetEnum.USERS || 
                state.dataConfig.selectedDataset === DatasetEnum.TIME_DATA) && 
               (state.dataConfig.selectedChartType === ChartTypeEnum.LINE || 
                state.dataConfig.selectedChartType === ChartTypeEnum.BAR)) {
      const secondAxisTitle = state.dataConfig.selectedDataset === DatasetEnum.USERS 
        ? "New Registrations" 
        : "Server Load (%)";
      
      newOptions = createDualAxisOptions(
        newOptions, 
        isDarkMode, 
        fontFamily, 
        fontSize, 
        state.appearance.legendColor, 
        secondAxisTitle
      );
    }

    dispatch({ type: ChartActionTypes.UPDATE_CHART_OPTIONS, payload: newOptions });
  }, [
    fontFamily, 
    fontSize, 
    isDarkMode, 
    state.appearance.aspectRatio, 
    state.appearance.borderWidth, 
    state.appearance.legendColor, 
    state.appearance.legendPosition, 
    state.appearance.showLegend, 
    state.appearance.tension, 
    state.animation.animationDelay, 
    state.animation.animationDuration, 
    state.animation.animationPlaying, 
    state.animation.animationType, 
    state.dataConfig.selectedChartType, 
    state.dataConfig.selectedDataset, 
    state.titleConfig.chartTitle, 
    state.titleConfig.showSubtitle, 
    state.titleConfig.showTitle, 
    state.titleConfig.subtitle, 
    state.titleConfig.subtitleColor, 
    state.titleConfig.titleColor, 
    zoomSettings.enablePan, 
    zoomSettings.enableZoom, 
    zoomSettings.zoomMode, 
    zoomSettings.zoomSpeed
  ]);

  // Обновляем опции при изменении настроек
  useEffect(() => { 
    updateChartOptions(); 
  }, [updateChartOptions]);

  // Настройка анимации
  const { setupAnimation } = useChartAnimation(
    chartInstanceRef,
    state.dataConfig.selectedChartType,
    state.animation.animationPlaying,
    state.animation.animationDuration,
    state.animation.animationType
  );

  // Рендеринг графика
  const renderChart = useCallback(() => {
    if (!canvasRef.current) return;

    // Уничтожаем предыдущий график, если он существует
    destroyChart();

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) {
      console.error("Canvas context not available");
      return;
    }

    // Получаем данные для графика
    const currentData = getChartData(
      state.dataConfig.selectedDataset, 
      state.dataConfig.selectedChartType, 
      customData
    );
    
    // Определяем тип графика
    let chartType = state.dataConfig.selectedChartType;
    
    // Автоматически корректируем тип графика для некоторых датасетов
    if (!customData) {
      if (state.dataConfig.selectedDataset === DatasetEnum.DEMOGRAPHICS && 
          chartType !== ChartTypeEnum.PIE && chartType !== ChartTypeEnum.DOUGHNUT) {
        chartType = ChartTypeEnum.PIE; // Для демографических данных лучше круговая диаграмма
      } else if (state.dataConfig.selectedDataset === DatasetEnum.PERFORMANCE && 
                chartType !== ChartTypeEnum.RADAR && chartType !== ChartTypeEnum.POLAR_AREA) {
        chartType = ChartTypeEnum.RADAR; // Для данных о производительности лучше радар
      } else if (state.dataConfig.selectedDataset === DatasetEnum.TIME_DATA && 
                chartType !== ChartTypeEnum.LINE) {
        chartType = ChartTypeEnum.LINE; // Для временных рядов лучше линейный график
      }
    }

    // Устанавливаем responsive и maintainAspectRatio
    const options = {
      ...state.chartOptions,
      responsive: true,
      maintainAspectRatio: false, // Важно установить false для полного контроля над размером
    };

    // Создаем график с базовыми данными
    chartInstanceRef.current = new ChartJS(ctx, {
      data: currentData as ChartData<ChartType>,
      type: chartType as ChartType,
      options: options
    });

    // Применяем цветовую схему
    if (chartInstanceRef.current) {
      const schemeColors = colorSchemes.find(scheme => 
        scheme.id === state.appearance.colorScheme
      )?.colors || colorSchemes[0].colors;
      
      // Применяем цвета к датасетам
      chartInstanceRef.current.data.datasets = applyColorScheme(
        chartInstanceRef.current.data.datasets,
        chartType,
        schemeColors,
        state.appearance.borderWidth
      ) as ChartJS["data"]["datasets"];

      // Настраиваем анимацию
      setupAnimation();
      
      // Обновляем график
      chartInstanceRef.current.update();

      console.log("Chart rendered successfully", chartInstanceRef.current);
    }
  }, [canvasRef, chartInstanceRef, customData, destroyChart, setupAnimation, state.appearance.borderWidth, state.appearance.colorScheme, state.chartOptions, state.dataConfig.selectedChartType, state.dataConfig.selectedDataset]);

  // Обновляем график при изменении типа графика
  useEffect(() => {
    if (state.dataConfig.selectedChartType) {
      // Проверяем, действительно ли изменился тип графика
      destroyChart();
    }
  }, [state.dataConfig.selectedChartType, destroyChart]);

  // Глобальные настройки шрифтов Chart.js
  useEffect(() => {
    ChartJS.defaults.font.family = fontFamily;
    ChartJS.defaults.font.size = fontSize;
    
    if (chartInstanceRef.current) {
      destroyChart();
    }
  }, [chartInstanceRef, destroyChart, fontFamily, fontSize, renderChart]);

  return (
    <div 
      className="
        p-6 
        bg-gradient-to-br 
        from-indigo-400 
        via-purple-300 
        to-pink-300
        dark:from-indigo-900 
        dark:via-purple-800 
        dark:to-pink-800
        rounded-xl 
        shadow-lg
      "
    >
      <Card 
        className="chart-container overflow-hidden border-0"
        style={{ 
          boxShadow: "0 10px 30px rgba(99, 102, 241, 0.2)", 
          borderRadius: "12px",
          backdropFilter: "blur(10px)"
        }}
        title={
          <ChartHeader 
            chartType={state.dataConfig.selectedChartType} 
            fontFamily={fontFamily} 
          />
        }
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <ChartCanvas 
              aspectRatio={state.appearance.aspectRatio}
              renderChart={renderChart}
              isDarkMode={isDarkMode}
              canvasRef={canvasRef}
              chartInstanceRef={chartInstanceRef}
            />
          </Col>
      
          <Col span={24}>
            <ChartControls 
              basics={{
                hideDatasetSelector: !!customData,
                selectedDataset: state.dataConfig.selectedDataset,
                setSelectedDataset: (dataset) => dispatch({ type: ChartActionTypes.SET_DATASET, payload: dataset }),
                selectedChartType: state.dataConfig.selectedChartType,
                setSelectedChartType: (type) => dispatch({ type: ChartActionTypes.SET_CHART_TYPE, payload: type }),
                compatibleChartTypes: state.dataConfig.compatibleChartTypes,
                borderWidth: state.appearance.borderWidth,
                setBorderWidth: (width) => dispatch({ type: ChartActionTypes.SET_BORDER_WIDTH, payload: width }),
                showLegend: state.appearance.showLegend,
                setShowLegend: (show) => dispatch({ type: ChartActionTypes.TOGGLE_LEGEND, payload: show }),
                legendPosition: state.appearance.legendPosition,
                setLegendPosition: (pos) => dispatch({ type: ChartActionTypes.SET_LEGEND_POSITION, payload: pos }),
                legendColor: state.appearance.legendColor,
                setLegendColor: (color) => dispatch({ type: ChartActionTypes.SET_LEGEND_COLOR, payload: color }),
                showTitle: state.titleConfig.showTitle,
                setShowTitle: (show) => dispatch({ type: ChartActionTypes.TOGGLE_TITLE, payload: show }),
                chartTitle: state.titleConfig.chartTitle,
                setChartTitle: (title) => dispatch({ type: ChartActionTypes.SET_TITLE, payload: title }),
                titleColor: state.titleConfig.titleColor,
                setTitleColor: (color) => dispatch({ type: ChartActionTypes.SET_TITLE_COLOR, payload: color }),
                showSubtitle: state.titleConfig.showSubtitle,
                setShowSubtitle: (show) => dispatch({ type: ChartActionTypes.TOGGLE_SUBTITLE, payload: show }),
                subtitle: state.titleConfig.subtitle,
                setSubtitle: (subtitle) => dispatch({ type: ChartActionTypes.SET_SUBTITLE, payload: subtitle }),
                subtitleColor: state.titleConfig.subtitleColor,
                setSubtitleColor: (color) => dispatch({ type: ChartActionTypes.SET_SUBTITLE_COLOR, payload: color }),
                animationDuration: state.animation.animationDuration,
                setAnimationDuration: (duration) => dispatch({ type: ChartActionTypes.SET_ANIMATION_DURATION, payload: duration }),
                animationType: state.animation.animationType,
                setAnimationType: (type) => dispatch({ type: ChartActionTypes.SET_ANIMATION_TYPE, payload: type }),
                animationDelay: state.animation.animationDelay,
                setAnimationDelay: (delay) => dispatch({ type: ChartActionTypes.SET_ANIMATION_DELAY, payload: delay }),
                animationPlaying: state.animation.animationPlaying,
                setAnimationPlaying: (playing) => dispatch({ type: ChartActionTypes.SET_ANIMATION_PLAYING, payload: playing }),
                aspectRatio: state.appearance.aspectRatio,
                setAspectRatio: (ratio) => dispatch({ type: ChartActionTypes.SET_ASPECT_RATIO, payload: ratio }),
                tension: state.appearance.tension,
                setTension: (tension) => dispatch({ type: ChartActionTypes.SET_TENSION, payload: tension }),
                colorScheme: state.appearance.colorScheme,
                setColorScheme: (scheme) => dispatch({ type: ChartActionTypes.SET_COLOR_SCHEME, payload: scheme }),
                colorSchemes,
                easingOptions,
              }}
              advanced={{
                enableZoom: zoomSettings.enableZoom,
                setEnableZoom: (enable) => setZoomSettings({...zoomSettings, enableZoom: enable}),
                zoomMode: zoomSettings.zoomMode,
                setZoomMode: (mode) => setZoomSettings({...zoomSettings, zoomMode: mode}),
                enablePan: zoomSettings.enablePan,
                setEnablePan: (enable) => setZoomSettings({...zoomSettings, enablePan: enable}),
                zoomSpeed: zoomSettings.zoomSpeed,
                setZoomSpeed: (speed) => setZoomSettings({...zoomSettings, zoomSpeed: speed})
              }}
            />
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ChartJSComponent;
