import { useIsDarkMode } from "@/app/hooks/useIsDarkMode";
import { ChartDataType } from "@/app/types/chart";
import { BarChartOutlined, DotChartOutlined, ExpandAltOutlined, LineChartOutlined, PieChartOutlined, RadarChartOutlined, UndoOutlined, ZoomInOutlined } from "@ant-design/icons";
import { Tooltip as AntdTooltip, Badge, Button, Card, Col, Row, Typography } from "antd";
import {
  ArcElement,
  BarController,
  BarElement,
  BubbleController,
  CategoryScale,
  Chart,
  ChartDataset,
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
  Plugin,
  Point,
  PointElement,
  PolarAreaController,
  RadarController,
  RadarControllerDatasetOptions,
  RadialLinearScale,
  ScatterController,
  SubTitle,
  Title,
  Tooltip
} from "chart.js";
import Zoom from "chartjs-plugin-zoom";
import { FC, useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { chartReducer, initialChartState } from "./chartReducer";
import ChartControls from "./components/ChartControls";
import { colorSchemes, easingOptions } from "./constants";
import { mockDatasets } from "./datasets";
import { ChartActionTypes, ChartJSComponentProps, ChartTypeEnum, DatasetEnum } from "./types";

const { Title: AntTitle } = Typography;

ChartJS.register(
  // Scales
  CategoryScale,
  LinearScale,
  RadialLinearScale,

  // Elements
  LineElement,
  PointElement,
  BarElement,
  ArcElement,

  // Controllers
  LineController,
  BarController,
  PolarAreaController,
  RadarController,
  DoughnutController,
  PieController,
  BubbleController,
  ScatterController,

  // Plugins
  Title,
  Tooltip,
  Legend,
  SubTitle,
  Colors,

  Zoom
);

// Расширенный тип для Chart, включающий внутренние свойства
interface ExtendedChart extends Chart {
  _metasets?: Array<{
    _parsed?: Array<number | Point | null>;
    [key: string]: unknown;
  }>;
}

// Типы для элементов бара
interface BarElement {
  base?: number;
  y?: number;
  x?: number;
  width?: number;
  height?: number;
  _datasetIndex?: number;
  _index?: number;
  [key: string]: unknown;
}

interface ChartMeta {
  data: Array<{
    base?: number;
    y?: number;
    x?: number;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

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

export const ChartJSComponent: FC<ChartJSComponentProps> = ({ 
  fontSize = 14,
  fontFamily = "Arial",
  customData = null,
}) => {
  const [state, dispatch] = useReducer(chartReducer, initialChartState);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isResizingRef = useRef(false);
  const [zoomSettings, setZoomSettings] = useState({
    enableZoom: true,
    zoomMode: "xy" as "xy" | "x" | "y",
    enablePan: true,
    zoomSpeed: 0.5
  });

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<ChartJS<ChartType, unknown[], unknown> | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const isDarkMode = useIsDarkMode();

  const resizeChartToContainer = useCallback(() => {
    if (isResizingRef.current) return;
    if (!chartContainerRef.current || !chartRef.current || !chartInstanceRef.current) return;
    
    isResizingRef.current = true;
    
    // Calculate container dimensions minus padding
    const containerRect = chartContainerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    
    // Apply padding (adjust these values as needed)
    const horizontalPadding = 30; // Total left+right padding
    const verticalPadding = 30;   // Total top+bottom padding
    
    // Calculate target dimensions
    let targetWidth = containerWidth - horizontalPadding;
    let targetHeight = containerHeight - verticalPadding;
    
    // Apply aspect ratio if needed
    if (state.appearance.aspectRatio > 0) {
      // Calculate height based on width and aspect ratio
      const heightFromWidth = targetWidth / state.appearance.aspectRatio;
      
      // If calculated height fits in container, use it
      if (heightFromWidth <= targetHeight) {
        targetHeight = heightFromWidth;
      } else {
        // Otherwise, calculate width based on height
        targetWidth = targetHeight * state.appearance.aspectRatio;
      }
    }

    if (targetWidth <= 0 || targetHeight <= 0) {
      isResizingRef.current = false;
      return;
    }
    
    // Update canvas dimensions - set ONLY the attributes, not the style
    const canvas = chartRef.current;
    canvas.width = targetWidth * window.devicePixelRatio;
    canvas.height = targetHeight * window.devicePixelRatio;
    
    // Set the style dimensions at the proper size for the display
    canvas.style.width = `${targetWidth}px`;
    canvas.style.height = `${targetHeight}px`;
    
    // Update chart with respect to new dimensions
    chartInstanceRef.current.resize();
    
    // Short timeout to prevent infinite resize loops
    setTimeout(() => {
      isResizingRef.current = false;
    }, 100);
  }, [state.appearance.aspectRatio]);
  
  // Improved fullscreen handling with event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreenActive = !!document.fullscreenElement;
      setIsFullscreen(isFullscreenActive);
      
      // Add a small delay to ensure DOM is updated
      setTimeout(() => {
        resizeChartToContainer();
      }, 100);
    };

    // Add event listener for fullscreen changes
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [resizeChartToContainer]);

  // Add resize observer to handle container size changes
  useEffect(() => {
    if (!chartContainerRef.current) return;
    
    const resizeObserver = new ResizeObserver(() => {
      resizeChartToContainer();
    });
    
    resizeObserver.observe(chartContainerRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [resizeChartToContainer]);

  const toggleFullscreen = () => {
    if (!chartContainerRef.current) return;
    
    if (!document.fullscreenElement) {
      chartContainerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {
        console.error(`Error attempting to exit fullscreen: ${err.message}`);
      });
    }
  };

  const resetZoom = () => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.resetZoom();
    }
  };

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

  const updateChartOptions = useCallback(
    () => {
      const fontConfig = {
        family: fontFamily,
        size: fontSize,
      };

      let newOptions: ChartOptions<ChartType> = {
        responsive: true,
        aspectRatio: state.appearance.aspectRatio,
        animation: {
          duration: state.animation.animationPlaying === "loop" ? 100 : state.animation.animationDuration,
          delay: state.animation.animationDelay,
          easing: state.animation.animationType,
        },
        font: fontConfig,
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
        scales: {
          x: {
            ticks: {
              font: fontConfig,
              color: state.titleConfig.subtitleColor,
            },
            title: {
              display: true,
              font: fontConfig,
              color: state.titleConfig.titleColor,
            }
          },
          y: {
            ticks: {
              font: fontConfig,
              color: state.appearance.legendColor,
            },
            title: {
              display: true,
              font: fontConfig,
              color: state.appearance.legendColor,
            }
          }
        },
        plugins: {
          legend: {
            display: state.appearance.showLegend,
            position: state.appearance.legendPosition,
            labels: {
              font: fontConfig,
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
          tooltip: {
            titleFont: {
              family: fontFamily,
              size: fontSize - 1,
            },
            bodyFont: {
              family: fontFamily,
              size: fontSize - 2,
            },
            footerFont: {
              family: fontFamily,
              size: fontSize - 2,
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

      if (state.dataConfig.selectedChartType === ChartTypeEnum.RADAR) {
        newOptions = {
          ...newOptions,
          scales: {
            r: {
              beginAtZero: true,
              ticks: {
                backdropColor: "transparent",
                font: {
                  family: fontFamily,
                  size: fontSize,
                },
                color: isDarkMode ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)",
              },
              grid: {
                color: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
              },
              angleLines: {
                color: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
              }
            }
          }
        };
      }

      dispatch({ type: ChartActionTypes.UPDATE_CHART_OPTIONS, payload: newOptions });
    }, 
    [fontFamily, fontSize, state.appearance.aspectRatio, state.appearance.tension, state.appearance.borderWidth, state.appearance.legendColor, state.appearance.showLegend, state.appearance.legendPosition, state.animation.animationPlaying, state.animation.animationDuration, state.animation.animationDelay, state.animation.animationType, state.titleConfig.subtitleColor, state.titleConfig.titleColor, state.titleConfig.showTitle, state.titleConfig.chartTitle, state.titleConfig.showSubtitle, state.titleConfig.subtitle, state.dataConfig.selectedChartType, zoomSettings.enablePan, zoomSettings.enableZoom, zoomSettings.zoomMode, zoomSettings.zoomSpeed, isDarkMode]
  );

  useEffect(
    () => { 
      updateChartOptions(); 
    }, 
    [updateChartOptions]
  );

  const destroyChart = useCallback(() => {
    if (chartInstanceRef.current) {
      try {
        chartInstanceRef.current.stop();

        chartInstanceRef.current.canvas.removeEventListener("click", () => {});

        // Принудительно очищаем canvas перед уничтожением
        const ctx = chartRef.current?.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, chartRef.current?.width || 0, chartRef.current?.height || 0);
        }

        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;

        setTimeout(() => {}, 0);
      } catch (error) {
        console.error("Error destroying chart:", error);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      destroyChart();
    };
  }, [destroyChart]);

  const renderChart = useCallback(() => {
    if (!chartRef.current) return;

    destroyChart();

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;
  
    // Настраиваем цвета в зависимости от темы
    const gridColor = isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";

    let currentData: ChartDataType = {
      labels: [],
      datasets: []
    };
    let chartType = state.dataConfig.selectedChartType;
    console.log("Current chart type:", chartType); // Для отладки
    
    if (customData && customData.labels && customData.datasets) {
      // Создаем глубокую копию данных
      currentData = {
        labels: Array.isArray(customData.labels) ? [...customData.labels] : [],
        datasets: Array.isArray(customData.datasets) 
          ? customData.datasets.map(dataset => ({
              label: dataset.label || "",
              data: Array.isArray(dataset.data) ? [...dataset.data] : []
            }))
          : []
      };
      console.log("Using custom data:", currentData);
    } else {
      // Определяем, какой датасет и тип графика использовать
      if (state.dataConfig.selectedChartType === ChartTypeEnum.BUBBLE) {
        const sourceData = mockDatasets.bubbleData as ChartDataType;
        if (sourceData && Array.isArray(sourceData.labels) && Array.isArray(sourceData.datasets)) {
          currentData = {
            labels: [...sourceData.labels],
            datasets: sourceData.datasets.map(dataset => ({
              label: dataset.label,
              data: [...dataset.data]
            }))
          };
        }
      } else if (state.dataConfig.selectedChartType === ChartTypeEnum.SCATTER) {
        const sourceData =mockDatasets.scatterData as ChartDataType;
        if (sourceData && Array.isArray(sourceData.labels) && Array.isArray(sourceData.datasets)) {
          currentData = {
            labels: [...sourceData.labels],
            datasets: sourceData.datasets.map(dataset => ({
              label: dataset.label,
              data: [...dataset.data]
            }))
          };
        }
      } else if (state.dataConfig.selectedDataset === DatasetEnum.DEMOGRAPHICS) {
        // Для демографических данных лучше использовать круговые диаграммы
        const sourceData =mockDatasets.demographics as ChartDataType;
        if (sourceData && Array.isArray(sourceData.labels) && Array.isArray(sourceData.datasets)) {
          currentData = {
            labels: [...sourceData.labels],
            datasets: sourceData.datasets.map(dataset => ({
              label: dataset.label,
              data: [...dataset.data]
            }))
          };
        }
        if (state.dataConfig.selectedChartType !== ChartTypeEnum.PIE && state.dataConfig.selectedChartType !== ChartTypeEnum.DOUGHNUT) {
          chartType = ChartTypeEnum.PIE; // Автоматически переключаемся на круговую диаграмму
        }
      } else if (state.dataConfig.selectedDataset === DatasetEnum.PERFORMANCE) {
        const sourceData =mockDatasets.performance as ChartDataType;
        if (sourceData && Array.isArray(sourceData.labels) && Array.isArray(sourceData.datasets)) {
          currentData = {
            labels: [...sourceData.labels],
            datasets: sourceData.datasets.map(dataset => ({
              label: dataset.label,
              data: [...dataset.data]
            }))
          };
        }
        if (state.dataConfig.selectedChartType !== ChartTypeEnum.RADAR && state.dataConfig.selectedChartType !== ChartTypeEnum.POLAR_AREA) {
          chartType = ChartTypeEnum.RADAR; // Автоматически переключаемся на радарную диаграмму
        }
      } else if (state.dataConfig.selectedDataset === DatasetEnum.TIME_DATA) {
        const sourceData =mockDatasets.timeData as ChartDataType;
        if (sourceData && Array.isArray(sourceData.labels) && Array.isArray(sourceData.datasets)) {
          currentData = {
            labels: [...sourceData.labels],
            datasets: sourceData.datasets.map(dataset => ({
              label: dataset.label,
              data: [...dataset.data]
            }))
          };
        }
        if (state.dataConfig.selectedChartType !== ChartTypeEnum.LINE) {
          chartType = ChartTypeEnum.LINE; // Для временных рядов лучше использовать линейный график
        }
      } else {
        // Для остальных датасетов используем выбранный тип графика
        const sourceData =mockDatasets[state.dataConfig.selectedDataset] as ChartDataType;
        if (sourceData && Array.isArray(sourceData.labels) && Array.isArray(sourceData.datasets)) {
          currentData = {
            labels: [...sourceData.labels],
            datasets: sourceData.datasets.map(dataset => ({
              label: dataset.label,
              data: [...dataset.data]
            }))
          };
        }
      }
    }

    // Создаем дополнительные опции в зависимости от датасета
    // Обновляем опции графика с учетом темы

    const baseOptions = {
      ...state.chartOptions,
      plugins: {
        ...state.chartOptions.plugins,
        legend: {
          ...state.chartOptions.plugins?.legend,
          labels: {
            ...state.chartOptions.plugins?.legend?.labels,
            color: state.appearance.legendColor,
          }
        },
        title: {
          ...state.chartOptions.plugins?.title,
          color: state.titleConfig.titleColor,
        },
        subtitle: {
          ...state.chartOptions.plugins?.subtitle,
          color: state.titleConfig.subtitleColor,
        }
      }
    };

    if (baseOptions.scales) {
      baseOptions.scales = {};
    }

    let options: ChartOptions<ChartType>;

    if (chartType === ChartTypeEnum.PIE || chartType === ChartTypeEnum.DOUGHNUT) {
      options = baseOptions;
    } else if (chartType === ChartTypeEnum.RADAR || chartType === ChartTypeEnum.POLAR_AREA) {
      options = {
        ...baseOptions,
        scales: {
          r: {
            beginAtZero: true,
            ticks: {
              backdropColor: "transparent",
              font: {
                family: fontFamily,
                size: fontSize,
              },
              color: state.appearance.legendColor, 
            },
            grid: {
              color: gridColor,
              lineWidth: 2,
              circular: true,
            },
            angleLines: {
              color: gridColor,
              lineWidth: 2,
              display: true,
            },
            pointLabels: {
              color: state.appearance.legendColor,
              font: {
                family: fontFamily,
                size: fontSize,
              }
            }
          }
        },
        elements: {
          line: {
            tension: 0, // Для радаров лучше использовать 0
            borderWidth: state.appearance.borderWidth,
            fill: true, // Включаем заливку на уровне элементов
          }, 
          point: {
            radius: 3,
            borderWidth: 2,
            hoverRadius: 5,
            hoverBorderWidth: 2
          }
        },
        plugins: {
          ...baseOptions.plugins,
          filler: {
            propagate: true
          }
        }
      };
    } else {
      options = {
        ...baseOptions,
        scales: {
          x: {
            grid: {
              color: gridColor,
            },
            ticks: {
              color: state.appearance.legendColor,
            },
            title: {
              color: state.appearance.legendColor,
            }
          },
          y: {
            grid: {
              color: gridColor,
            },
            ticks: {
              color: state.appearance.legendColor,
            },
            title: {
              color: state.appearance.legendColor,
            }
          },
          ...(((state.dataConfig.selectedDataset === DatasetEnum.USERS || state.dataConfig.selectedDataset === DatasetEnum.TIME_DATA) && 
              (state.dataConfig.selectedChartType === ChartTypeEnum.LINE || state.dataConfig.selectedChartType === ChartTypeEnum.BAR)) ? {
            y1: {
              type: "linear",
              display: true,
              position: "right",
              title: {
                display: true,
                text: state.dataConfig.selectedDataset === DatasetEnum.USERS ? "New Registrations" : "Server Load (%)",
                font: {
                  family: fontFamily,
                  size: fontSize,
                },
                color: state.appearance.legendColor, 
              },
              grid: {
                drawOnChartArea: false,
                color: gridColor,
              },
              ticks: {
                font: {
                  family: fontFamily,
                  size: fontSize,
                },
                color: state.appearance.legendColor, 
              }
            }
          } : {})
        }
      };
    }

    // Создаем график с "чистыми" датасетами
    chartInstanceRef.current = new ChartJS(ctx, {
      data: currentData,
      type: chartType as ChartType,
      options: options
    });

    // После создания графика применяем стили в зависимости от типа
    if (chartInstanceRef.current) {
      const schemeColors = colorSchemes.find(scheme => scheme.id === state.appearance.colorScheme)?.colors || colorSchemes[0].colors;
      
      chartInstanceRef.current.data.datasets.forEach((dataset, index) => {
        const color = schemeColors[index % schemeColors.length];

        if (chartType === ChartTypeEnum.LINE) {
          Object.assign(dataset, {
            borderColor: color,
            backgroundColor: color + "33",
            fill: false
          });
        } else if (chartType === ChartTypeEnum.BAR) {
          Object.assign(dataset, {
            backgroundColor: color,
            borderColor: color
          });
        } else if (chartType === ChartTypeEnum.PIE || chartType === ChartTypeEnum.DOUGHNUT) {
          Object.assign(dataset, {
            backgroundColor: schemeColors
          });
        } else if (chartType === ChartTypeEnum.RADAR) {
          // Для радарных графиков каждый датасет должен иметь ОДИН цвет
          const radarDataset = dataset as ChartDataset<"radar", number[]> & RadarControllerDatasetOptions;

          Object.assign(radarDataset, {
            type: "radar",
            // Основные настройки линий и заливки
            fill: true,  // Критически важно для заливки
            backgroundColor: color + "33",
            borderColor: color,
            borderWidth: state.appearance.borderWidth,
            // Настройки точек
            pointBackgroundColor: color,
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: color,
            pointRadius: 4,
            pointHoverRadius: 5,
            // Дополнительные настройки линий
            // Для радарных графиков не рекомендуется использовать большое значение tension
            tension: 0, // Прямые линии для радара обычно лучше
            // Убедитесь, что линии закрыты (создают замкнутую фигуру)
            spanGaps: false,
          })
        } else if (chartType === ChartTypeEnum.POLAR_AREA) {
          // Для полярных областей используем массив цветов
          Object.assign(dataset, {
            backgroundColor: schemeColors.map(c => c + "77"),
            borderColor: schemeColors
          });
        } else {
          Object.assign(dataset, {
            backgroundColor: color,
            borderColor: color
          });
        }
      });

      // Сначала удалим все предыдущие плагины анимации
      const rotateAnimationPlugin = ChartJS.registry.plugins.get('rotateAnimation');
      if (rotateAnimationPlugin) {
        ChartJS.unregister(rotateAnimationPlugin);
      }
      
      const scalePlugin = ChartJS.registry.plugins.get('scalePlugin');
      if (scalePlugin) {
        ChartJS.unregister(scalePlugin);
      }
      
      // Сбрасываем анимации
      chartInstanceRef.current.options.animations = {};

      // Настраиваем анимацию в соответствии с выбранными параметрами
      if (state.animation.animationPlaying === "loop") {
        // Для линейных графиков - анимируем tension
        if (chartType === ChartTypeEnum.LINE) {
          // Настраиваем анимацию tension согласно документации
          chartInstanceRef.current.options.animations = {
            tension: {
              duration: state.animation.animationDuration,
              easing: state.animation.animationType,
              from: 0,
              to: 1,
              loop: true
            }
          };

          // Обновляем все датасеты, чтобы применить tension
          chartInstanceRef.current.data.datasets.forEach(dataset => {
            if ('tension' in dataset) {
              dataset.tension = 0; // Начальное значение
            }
          });
        }
        // Для круговых диаграмм - анимируем вращение
        else if (chartType === ChartTypeEnum.PIE || chartType === ChartTypeEnum.DOUGHNUT) {
          // Добавляем плагин для вращения
          const rotatePlugin = {
            id: 'rotateAnimation',
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
          ChartJS.register(rotatePlugin);
        }
        // Для столбчатых диаграмм - анимируем высоту
        else if (chartType === ChartTypeEnum.BAR) {
          // Используем анимацию для столбцов
          const barAnimationPlugin: Plugin<'bar'> = {
            id: 'barAnimation',
            beforeDraw(chart: Chart) {
              if (state.animation.animationPlaying !== "loop") return;
              
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
                
                if (bar && typeof bar.base === 'number' && typeof bar.y === 'number') {
                  const height = bar.base - bar.y;
                  bar.y = bar.base - (height * factor);
                }
              });
            }
          };
          
          // Регистрируем плагин
          ChartJS.register(barAnimationPlugin);
        }
        // Для радарных диаграмм - анимируем масштаб
        else if (chartType === ChartTypeEnum.RADAR) {
          // Для радарных диаграмм используем плагин для анимации масштаба
          const scalePlugin: Plugin<'radar'> = {
            id: 'scalePlugin',
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
          ChartJS.register(scalePlugin);
        }
        
        // Запускаем анимацию
        chartInstanceRef.current.update();
        
        // Настраиваем интервал для обновления анимации для плагинов
        if (chartType === ChartTypeEnum.PIE || chartType === ChartTypeEnum.DOUGHNUT || 
            chartType === ChartTypeEnum.RADAR || chartType === ChartTypeEnum.BAR) {
          const animationInterval = setInterval(() => {
            if (chartInstanceRef.current && state.animation.animationPlaying === "loop") {
              chartInstanceRef.current.update();
            } else {
              clearInterval(animationInterval);
            }
          }, 50); // Обновляем каждые 50мс для плавности
          
          // Очистка при размонтировании
          return () => {
            clearInterval(animationInterval);

            // Отменяем регистрацию плагинов
            ['rotateAnimation', 'scalePlugin', 'barAnimation', 'lineAnimation'].forEach(pluginId => {
              const plugin = ChartJS.registry.plugins.get(pluginId);
              if (plugin) {
                ChartJS.unregister(plugin);
              }
            });
          };
        }
      }

      chartInstanceRef.current.update();
    }
  }, [destroyChart, isDarkMode, state.dataConfig.selectedChartType, state.dataConfig.selectedDataset, state.chartOptions, state.appearance.legendColor, state.appearance.borderWidth, state.appearance.colorScheme, state.titleConfig.titleColor, state.titleConfig.subtitleColor, state.animation.animationPlaying, state.animation.animationDuration, state.animation.animationType, customData, fontFamily, fontSize]);

  // Также, важно обновлять график при изменении типа графика
  useEffect(() => {
    if (chartRef.current) {
      console.log("Тип графика изменился, пересоздаем график");
      destroyChart();
      renderChart();
    }
  }, [state.dataConfig.selectedChartType, destroyChart, renderChart]);

  useEffect(() => {
    let isMounted = true;
    
    const timer = setTimeout(() => {
      if (isMounted && chartRef.current) {
        renderChart();
      }
    }, 0);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [
    state.dataConfig.selectedDataset, 
    state.dataConfig.selectedChartType, 
    state.chartOptions, 
    renderChart
  ]);

  // Добавим эффект для обновления графика при изменении шрифта
  useEffect(() => {
    // Глобальные настройки Chart.js для шрифтов
    ChartJS.defaults.font.family = fontFamily;
    ChartJS.defaults.font.size = fontSize;
    
    // Полностью пересоздадим график
    if (chartRef.current) {
      destroyChart();
      renderChart();
    }
  }, [destroyChart, fontFamily, fontSize, renderChart]);
  
  // Resize the chart when it"s initially rendered and when chart type changes
  useLayoutEffect(() => {
    const timer = setTimeout(() => {
      resizeChartToContainer();
    }, 200);
    
    return () => clearTimeout(timer);
  }, [state.dataConfig.selectedChartType, renderChart, resizeChartToContainer]);

  // Добавим эффект для отслеживания изменений режима анимации
  useEffect(() => {
    // Если график существует и режим анимации изменился
    if (chartInstanceRef.current) {
      // Удаляем все плагины анимации
      const rotateAnimationPlugin = ChartJS.registry.plugins.get('rotateAnimation');
      if (rotateAnimationPlugin) {
        ChartJS.unregister(rotateAnimationPlugin);
      }
      
      const scalePlugin = ChartJS.registry.plugins.get('scalePlugin');
      if (scalePlugin) {
        ChartJS.unregister(scalePlugin);
      }
      
      const barAnimationPlugin = ChartJS.registry.plugins.get('barAnimation');
      if (barAnimationPlugin) {
        ChartJS.unregister(barAnimationPlugin);
      }
      
      // Сбрасываем анимации
      if (chartInstanceRef.current.options.animations) {
        chartInstanceRef.current.options.animations = {};
      }
      
      // Пересоздаем график при изменении режима анимации
      destroyChart();
      renderChart();
    }
  }, [state.animation.animationPlaying, destroyChart, renderChart]);

  // Функция для получения иконки в зависимости от типа графика
  const getChartIcon = (chartType: ChartTypeEnum) => {
    switch (chartType) {
      case ChartTypeEnum.LINE:
        return <LineChartOutlined />;
      case ChartTypeEnum.BAR:
        return <BarChartOutlined />;
      case ChartTypeEnum.PIE:
      case ChartTypeEnum.DOUGHNUT:
        return <PieChartOutlined />;
      case ChartTypeEnum.RADAR:
      case ChartTypeEnum.POLAR_AREA:
        return <RadarChartOutlined />;
      case ChartTypeEnum.BUBBLE:
      case ChartTypeEnum.SCATTER:
        return <DotChartOutlined />;
      default:
        return <LineChartOutlined />;
    }
  };

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
          <div className="flex items-center justify-between mt-5">
            <Badge.Ribbon 
              text={state.dataConfig.selectedChartType.charAt(0).toUpperCase() + state.dataConfig.selectedChartType.slice(1)} 
              color="blue"
            >
              <AntTitle level={2} className="flex items-center border-3 border-dashed border-blue-200">
                {getChartIcon(state.dataConfig.selectedChartType)}
                <span className="mr-10" style={{ fontFamily: fontFamily }}>Chart.js Visualization Demo</span>
              </AntTitle>
            </Badge.Ribbon>
            <div className="text-xs text-gray-500">
              Powered by Chart.js ✨
            </div>
          </div>
        }
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <div 
              ref={chartContainerRef}
              className="relative bg-white dark:bg-gray-900 rounded-lg p-4 shadow-inner" 
              style={{ 
                height: isFullscreen ? "95vh" : "400px", 
                width: "100%",
                transition: "height 0.3s ease",
                backgroundImage: isDarkMode ? 
                  "radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.2) 1px, transparent 0), radial-gradient(circle at 7px 7px, rgba(255, 255, 255, 0.1) 1px, transparent 0)" : 
                  "radial-gradient(circle at 1px 1px, #c9c6cd 1px, transparent 0)",
                backgroundSize: isDarkMode ? "14px 14px, 14px 14px" : "14px 14px",
                boxShadow: isDarkMode ? 
                  "inset 0 2px 10px rgba(0, 0, 0, 0.3)" : 
                  "inset 0 2px 10px rgba(99, 102, 241, 0.1)"
              }}
            >
              <div className="absolute top-2 right-2 z-10 flex gap-2">
                <AntdTooltip title="Сбросить масштаб">
                  <Button 
                    icon={<UndoOutlined />} 
                    onClick={resetZoom}
                    size="small"
                  />
                </AntdTooltip>
                <AntdTooltip title="Увеличить (прокручивайте колесо мыши)">
                  <Button 
                    icon={<ZoomInOutlined />} 
                    size="small"
                    disabled
                  />
                </AntdTooltip>
                <AntdTooltip title={isFullscreen ? "Выйти из полноэкранного режима" : "Полноэкранный режим"}>
                  <Button 
                    icon={<ExpandAltOutlined />} 
                    onClick={toggleFullscreen}
                    size="small"
                  />
                </AntdTooltip>
              </div>
              <canvas ref={chartRef} style={{ maxWidth: "100%", maxHeight: "100%" }} />
            </div>
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