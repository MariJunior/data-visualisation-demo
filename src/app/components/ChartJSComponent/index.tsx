import { useIsDarkMode } from "@/app/hooks/useIsDarkMode";
import { ChartDataType } from "@/app/types/chart";
import { BarChartOutlined, DotChartOutlined, LineChartOutlined, PieChartOutlined, RadarChartOutlined } from "@ant-design/icons";
import { Badge, Card, Col, Row, Typography } from "antd";
import {
  ArcElement,
  BarController,
  BarElement,
  BubbleController,
  CategoryScale,
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
import { FC, useCallback, useEffect, useReducer, useRef } from "react";
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
  Colors
);

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

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<ChartJS<ChartType, unknown[], unknown> | null>(null);

  const isDarkMode = useIsDarkMode();

  // Обновляем список совместимых типов графиков при изменении датасета
  useEffect(() => {
    const chartTypes = getCompatibleChartTypes(state.dataConfig.selectedDataset);
    dispatch({ type: ChartActionTypes.SET_COMPATIBLE_TYPES, payload: chartTypes });
    
    // Если текущий выбранный тип графика не совместим с новым датасетом,
    // выбираем первый доступный тип из списка совместимых
    if (chartTypes.length > 0 && !chartTypes.includes(state.dataConfig.selectedChartType)) {
      dispatch({ type: ChartActionTypes.SET_CHART_TYPE, payload: chartTypes[0] });
    }
  }, [state.dataConfig.selectedChartType, state.dataConfig.selectedDataset]);

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
          duration: state.animation.animationDuration,
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
                backdropColor: 'transparent',
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
    [fontFamily, fontSize, state.appearance.aspectRatio, state.appearance.tension, state.appearance.borderWidth, state.appearance.legendColor, state.appearance.showLegend, state.appearance.legendPosition, state.animation.animationDuration, state.animation.animationDelay, state.animation.animationType, state.titleConfig.subtitleColor, state.titleConfig.titleColor, state.titleConfig.showTitle, state.titleConfig.chartTitle, state.titleConfig.showSubtitle, state.titleConfig.subtitle, state.dataConfig.selectedChartType, isDarkMode]
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
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
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

    let currentData: ChartDataType;
    let chartType = state.dataConfig.selectedChartType;
    
    if (customData) {
      currentData = customData;
    } else {
      // Определяем, какой датасет и тип графика использовать
      if (state.dataConfig.selectedChartType === ChartTypeEnum.BUBBLE) {
        currentData = mockDatasets.bubbleData as ChartDataType;
      } else if (state.dataConfig.selectedChartType === ChartTypeEnum.SCATTER) {
        currentData = mockDatasets.scatterData as ChartDataType;
      } else if (state.dataConfig.selectedDataset === DatasetEnum.DEMOGRAPHICS) {
        // Для демографических данных лучше использовать круговые диаграммы
        currentData = mockDatasets.demographics as ChartDataType;
        if (state.dataConfig.selectedChartType !== ChartTypeEnum.PIE && state.dataConfig.selectedChartType !== ChartTypeEnum.DOUGHNUT) {
          chartType = ChartTypeEnum.PIE; // Автоматически переключаемся на круговую диаграмму
        }
      } else if (state.dataConfig.selectedDataset === DatasetEnum.PERFORMANCE) {
        currentData = mockDatasets.performance as ChartDataType;
        if (state.dataConfig.selectedChartType !== ChartTypeEnum.RADAR && state.dataConfig.selectedChartType !== ChartTypeEnum.POLAR_AREA) {
          chartType = ChartTypeEnum.RADAR; // Автоматически переключаемся на радарную диаграмму
        }
      } else if (state.dataConfig.selectedDataset === DatasetEnum.TIME_DATA) {
        currentData = mockDatasets.timeData as ChartDataType;
        if (state.dataConfig.selectedChartType !== ChartTypeEnum.LINE) {
          chartType = ChartTypeEnum.LINE; // Для временных рядов лучше использовать линейный график
        }
      } else {
        // Для остальных датасетов используем выбранный тип графика
        currentData = mockDatasets[state.dataConfig.selectedDataset] as ChartDataType;
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
              backdropColor: 'transparent',
              font: {
                family: fontFamily,
                size: fontSize,
              },
              color: state.appearance.legendColor, 
            },
            grid: {
              color: gridColor,
            },
            angleLines: {
              color: gridColor,
            },
            pointLabels: {
              color: state.appearance.legendColor, 
            }
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

    // Создаем график
    chartInstanceRef.current = new ChartJS(ctx, {
      data: currentData,
      type: chartType as ChartType,
      options: options
    });

    if (chartInstanceRef.current) {
      const schemeColors = colorSchemes.find(scheme => scheme.id === state.appearance.colorScheme)?.colors || colorSchemes[0].colors;
      
      chartInstanceRef.current.data.datasets.forEach((dataset, index) => {
        const color = schemeColors[index % schemeColors.length];
        if (chartType === ChartTypeEnum.LINE) {
          dataset.borderColor = color;
          dataset.backgroundColor = color + "33"; // Add transparency
        } else if (chartType === ChartTypeEnum.BAR) {
          dataset.backgroundColor = color;
          dataset.borderColor = color;
        } else if (chartType === ChartTypeEnum.PIE || chartType === ChartTypeEnum.DOUGHNUT) {
          dataset.backgroundColor = schemeColors;
        } else if (chartType === ChartTypeEnum.RADAR) {
          // Для радарных графиков каждый датасет должен иметь ОДИН цвет
          const radarDataset = dataset as ChartDataset<'radar', number[]> & RadarControllerDatasetOptions;
          radarDataset.borderColor = color;
          radarDataset.backgroundColor = color + "33";
          radarDataset.pointBackgroundColor = color;
          radarDataset.pointBorderColor = "#fff";
          radarDataset.fill = true;
          radarDataset.borderWidth = state.appearance.borderWidth;
          radarDataset.pointRadius = 4;
          radarDataset.pointHoverRadius = 5;
          radarDataset.tension = 0.4;
          radarDataset.spanGaps = true;
          // radarDataset.segment = {
          //   borderColor: color,
          //   backgroundColor: color + "33",
          //   borderWidth: state.appearance.borderWidth,
          // };
        } else if (chartType === ChartTypeEnum.POLAR_AREA) {
          // Для полярных областей используем массив цветов
          dataset.backgroundColor = schemeColors.map(c => c + "77");
          dataset.borderColor = schemeColors;
        } else {
          dataset.backgroundColor = color;
          dataset.borderColor = color;
        }
      });
      
      chartInstanceRef.current.update();
    }
  }, [destroyChart, isDarkMode, state.dataConfig.selectedChartType, state.dataConfig.selectedDataset, state.chartOptions, state.appearance.legendColor, state.appearance.colorScheme, state.appearance.borderWidth, state.titleConfig.titleColor, state.titleConfig.subtitleColor, customData, fontFamily, fontSize]);

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
              className="relative bg-white dark:bg-gray-900 rounded-lg p-4 shadow-inner" 
              style={{ 
                height: "400px", 
                width: "100%",
                backgroundImage: isDarkMode ? 
                  "radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.2) 1px, transparent 0), radial-gradient(circle at 7px 7px, rgba(255, 255, 255, 0.1) 1px, transparent 0)" : 
                  "radial-gradient(circle at 1px 1px, #c9c6cd 1px, transparent 0)",
                backgroundSize: isDarkMode ? "14px 14px, 14px 14px" : "14px 14px",
                boxShadow: isDarkMode ? 
                  "inset 0 2px 10px rgba(0, 0, 0, 0.3)" : 
                  "inset 0 2px 10px rgba(99, 102, 241, 0.1)"
              }}
            >
              <canvas ref={chartRef} />
            </div>
          </Col>
      
          <Col span={24}>
            <ChartControls
              basics={{
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
            />
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ChartJSComponent;