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
  Color,
  Colors,
  DoughnutController,
  EasingFunction,
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
import { FC, useCallback, useEffect, useRef, useState } from "react";
import ChartControls from "./components/ChartControls";
import { mockDatasets } from "./datasets";
import { ChartJSComponentProps, ChartTypeEnum, DatasetEnum, LegendPositionEnum } from "./types";

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

// TODO: Вынести моки и константы в отдельный файл
export const colorSchemes = [
  { id: "default", name: "Default", colors: ["#36a2eb", "#ff6384", "#4bc0c0", "#ff9f40", "#9966ff", "#ffcd56"] },
  { id: "pastel", name: "Pastel", colors: ["#f1c0e8", "#cfbaf0", "#a3c4f3", "#90dbf4", "#8eecf5", "#98f5e1"] },
  { id: "vibrant", name: "Vibrant", colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"] },
  { id: "monochrome", name: "Monochrome", colors: ["#000000", "#333333", "#666666", "#999999", "#cccccc", "#ffffff"] },
  { id: "earth", name: "Earth Tones", colors: ["#5d4037", "#795548", "#8d6e63", "#a1887f", "#bcaaa4", "#d7ccc8"] },
];

export const easingOptions: EasingFunction[] = [
  "linear", "easeInQuad", "easeOutQuad", "easeInOutQuad",
  "easeInCubic", "easeOutCubic", "easeInOutCubic",
  "easeInQuart", "easeOutQuart", "easeInOutQuart",
  "easeInQuint", "easeOutQuint", "easeInOutQuint",
  "easeInSine", "easeOutSine", "easeInOutSine",
  "easeInExpo", "easeOutExpo", "easeInOutExpo",
  "easeInCirc", "easeOutCirc", "easeInOutCirc",
  "easeInElastic", "easeOutElastic", "easeInOutElastic",
  "easeInBack", "easeOutBack", "easeInOutBack",
  "easeInBounce", "easeOutBounce", "easeInOutBounce",
] as const;

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

const defaultOptions: ChartOptions<ChartType> = {
  responsive: true,
  aspectRatio: 2,
  animation: {
    duration: 1000,
  },
  elements: {
    line: {
      tension: 0.4,
      borderWidth: 1,
    },
    point: {
      radius: 4,
      borderWidth: 1,
    },
    bar: {
      borderWidth: 1,
    },
    arc: {
      borderWidth: 1,
    }
  },
  plugins: {
    legend: {
      display: true,
      position: LegendPositionEnum.TOP,
    },
    title: {
      display: true,
      text: "Chart.js Demo",
      font: {
        size: 16,
        weight: "bold",
      },
    },
  },
};

export const ChartJSComponent: FC<ChartJSComponentProps> = ({ 
  fontSize = 14,
  fontFamily = "Arial",
  customData = null,
}) => {
  // TODO: Сгруппировать стейты и дотипизировать
  const [selectedDataset, setSelectedDataset] = useState<DatasetEnum>(DatasetEnum.SALES);
  const [selectedChartType, setSelectedChartType] = useState<ChartTypeEnum>(ChartTypeEnum.LINE);
  const [compatibleChartTypes, setCompatibleChartTypes] = useState<ChartTypeEnum[]>([]);
  const [chartOptions, setChartOptions] = useState<ChartOptions<ChartType>>(defaultOptions);
  const [colorScheme, setColorScheme] = useState<string>("default");
  const [legendColor, setLegendColor] = useState<Color>("#000000");
  const [titleColor, setTitleColor] = useState<Color>("#000000");
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [subtitle, setSubtitle] = useState("Chart Subtitle");
  const [subtitleColor, setSubtitleColor] = useState<Color>("#666666");
  const [animationType, setAnimationType] = useState<EasingFunction>("easeInOutQuad");
  const [animationDelay, setAnimationDelay] = useState(0);
  const [animationPlaying, setAnimationPlaying] = useState<string>("once");  
  const [showLegend, setShowLegend] = useState(true);
  const [legendPosition, setLegendPosition] = useState<LegendPositionEnum>(LegendPositionEnum.TOP);
  const [chartTitle, setChartTitle] = useState("Chart.js Demo");
  const [showTitle, setShowTitle] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(2);
  const [animationDuration, setAnimationDuration] = useState(1000);
  const [borderWidth, setBorderWidth] = useState(1);
  const [tension, setTension] = useState(0.4);

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<ChartJS<ChartType, unknown[], unknown> | null>(null);

  const isDarkMode = useIsDarkMode();

  // Обновляем список совместимых типов графиков при изменении датасета
  useEffect(() => {
    const chartTypes = getCompatibleChartTypes(selectedDataset);
    setCompatibleChartTypes(chartTypes);
    
    // Если текущий выбранный тип графика не совместим с новым датасетом,
    // выбираем первый доступный тип из списка совместимых
    if (chartTypes.length > 0 && !chartTypes.includes(selectedChartType)) {
      setSelectedChartType(chartTypes[0]);
    }
  }, [selectedChartType, selectedDataset]);

  const updateChartOptions = useCallback(
    () => {
      const fontConfig = {
        family: fontFamily,
        size: fontSize,
      };

      setChartOptions({
        responsive: true,
        aspectRatio: aspectRatio,
        animation: {
          duration: animationDuration,
          delay: animationDelay,
          easing: animationType,
        },
        font: fontConfig,
        elements: {
          line: {
            tension: tension,
            borderWidth: borderWidth,
          },
          point: {
            radius: 4,
            borderWidth: borderWidth,
          },
          bar: {
            borderWidth: borderWidth,
          },
          arc: {
            borderWidth: borderWidth,
          }
        },
        scales: {
          x: {
            ticks: {
              font: fontConfig, // Шрифт для оси X
              color: legendColor, // Цвет для оси X
            },
            title: {
              display: true,
              font: fontConfig, // Шрифт для заголовка оси X
              color: legendColor, // Цвет для заголовка оси X
            }
          },
          y: {
            ticks: {
              font: fontConfig, // Шрифт для оси Y
              color: legendColor, // Цвет для оси Y
            },
            title: {
              display: true,
              font: fontConfig, // Шрифт для заголовка оси Y
              color: legendColor, // Цвет для заголовка оси Y
            }
          }
        },
        plugins: {
          legend: {
            display: showLegend,
            position: legendPosition,
            labels: {
              font: fontConfig,
              color: legendColor,
            }
          },
          title: {
            display: showTitle,
            font: {
              size: fontSize + 2,
              family: fontFamily,
              weight: "bold",
            },
            text: chartTitle,
            color: titleColor,
          },
          subtitle: {
            display: showSubtitle,
            text: subtitle,
            color: subtitleColor,
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
      });

      if (selectedChartType === ChartTypeEnum.RADAR) {
        setChartOptions(prevOptions => ({
          ...prevOptions,
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
          },
          elements: {
            ...prevOptions.elements,
            line: {
              ...prevOptions.elements?.line,
              tension: 0.1,
              borderWidth: borderWidth,
            }
          },
          plugins: {
            ...prevOptions.plugins,
            tooltip: {
              ...prevOptions.plugins?.tooltip,
              callbacks: {
                label: function(context) {
                  return `${context.dataset.label}: ${context.formattedValue}`;
                }
              }
            }
          }
        }));
      }
    }, 
    [fontFamily, fontSize, aspectRatio, animationDuration, animationDelay, animationType, tension, borderWidth, showLegend, legendPosition, legendColor, showTitle, chartTitle, titleColor, showSubtitle, subtitle, subtitleColor, selectedChartType, isDarkMode]
  );

  useEffect(
    () => { 
      updateChartOptions(); 
    }, 
    [showLegend, legendPosition, chartTitle, showTitle, aspectRatio, 
    animationDuration, borderWidth, tension, updateChartOptions,
    colorScheme, legendColor, titleColor, showSubtitle, subtitle, 
    subtitleColor, animationType, animationDelay]
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
    // const textColor = isDarkMode ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)";

    let currentData: ChartDataType;
    let chartType = selectedChartType;
    
    if (customData) {
      currentData = customData;
    } else {
      // Определяем, какой датасет и тип графика использовать
      if (selectedChartType === ChartTypeEnum.BUBBLE) {
        currentData = mockDatasets.bubbleData as ChartDataType;
      } else if (selectedChartType === ChartTypeEnum.SCATTER) {
        currentData = mockDatasets.scatterData as ChartDataType;
      } else if (selectedDataset === DatasetEnum.DEMOGRAPHICS) {
        // Для демографических данных лучше использовать круговые диаграммы
        currentData = mockDatasets.demographics as ChartDataType;
        if (selectedChartType !== ChartTypeEnum.PIE && selectedChartType !== ChartTypeEnum.DOUGHNUT) {
          chartType = ChartTypeEnum.PIE; // Автоматически переключаемся на круговую диаграмму
        }
      } else if (selectedDataset === DatasetEnum.PERFORMANCE) {
        currentData = mockDatasets.performance as ChartDataType;
        if (selectedChartType !== ChartTypeEnum.RADAR && selectedChartType !== ChartTypeEnum.POLAR_AREA) {
          chartType = ChartTypeEnum.RADAR; // Автоматически переключаемся на радарную диаграмму
        }
      } else if (selectedDataset === DatasetEnum.TIME_DATA) {
        currentData = mockDatasets.timeData as ChartDataType;
        if (selectedChartType !== ChartTypeEnum.LINE) {
          chartType = ChartTypeEnum.LINE; // Для временных рядов лучше использовать линейный график
        }
      } else {
        // Для остальных датасетов используем выбранный тип графика
        currentData = mockDatasets[selectedDataset] as ChartDataType;
      }
    }

    // Создаем дополнительные опции в зависимости от датасета
    // Обновляем опции графика с учетом темы
    // Create the options object with a type assertion
    const options = {
      ...chartOptions,
      plugins: {
        ...chartOptions.plugins,
        legend: {
          ...chartOptions.plugins?.legend,
          labels: {
            ...chartOptions.plugins?.legend?.labels,
            color: legendColor,
          }
        },
        title: {
          ...chartOptions.plugins?.title,
          color: titleColor,
        },
        subtitle: {
          ...chartOptions.plugins?.subtitle,
          color: subtitleColor,
        }
      },
      scales: chartType !== ChartTypeEnum.PIE && 
              chartType !== ChartTypeEnum.DOUGHNUT && 
              chartType !== ChartTypeEnum.RADAR && 
              chartType !== ChartTypeEnum.POLAR_AREA ? {
        x: {
          grid: {
            color: gridColor,
          },
          ticks: {
            color: legendColor, // Используем legendColor для тиков оси X
          },
          title: {
            color: legendColor, // Используем legendColor для заголовка оси X
          }
        },
        y: {
          grid: {
            color: gridColor,
          },
          ticks: {
            color: legendColor, // Используем legendColor для тиков оси Y
          },
          title: {
            color: legendColor, // Используем legendColor для заголовка оси Y
          }
        },
        ...(((selectedDataset === DatasetEnum.USERS || selectedDataset === DatasetEnum.TIME_DATA) && 
            (chartType === ChartTypeEnum.LINE || chartType === ChartTypeEnum.BAR)) ? {
          y1: {
            type: "linear",
            display: true,
            position: "right",
            title: {
              display: true,
              text: selectedDataset === DatasetEnum.USERS ? "New Registrations" : "Server Load (%)",
              font: {
                family: fontFamily,
                size: fontSize,
              },
              color: legendColor, // Добавляем цвет для заголовка оси Y1
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
              color: legendColor, // Используем legendColor для тиков оси Y1
            }
          }
        } : {})
      } : {
        ...chartOptions.scales,
        r: chartType === ChartTypeEnum.RADAR || chartType === ChartTypeEnum.POLAR_AREA ? {
          beginAtZero: true,
          ticks: {
            backdropColor: 'transparent',
            font: {
              family: fontFamily,
              size: fontSize,
            },
            color: legendColor, // Используем legendColor для радарных графиков
          },
          grid: {
            color: gridColor,
          },
          angleLines: {
            color: gridColor,
          },
          pointLabels: {
            color: legendColor, // Добавляем цвет для подписей точек в радарном графике
          }
        } : undefined
      }
    } as ChartOptions<ChartType>;

    // Создаем график
    chartInstanceRef.current = new ChartJS(ctx, {
      data: currentData,
      type: chartType as ChartType,
      options: options
    });

    if (chartInstanceRef.current) {
      const schemeColors = colorSchemes.find(scheme => scheme.id === colorScheme)?.colors || colorSchemes[0].colors;
      
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
          radarDataset.borderWidth = borderWidth;
          radarDataset.pointRadius = 3;
          radarDataset.pointHoverRadius = 5;
          radarDataset.tension = 0.4; // Добавляем настройку сглаживания линий
          radarDataset.spanGaps = true; // Добавляем настройку для соединения точек
          // radarDataset.segment = {
          //   borderColor: color,
          //   backgroundColor: color + "33",
          //   borderWidth: borderWidth,
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
  }, [destroyChart, isDarkMode, selectedChartType, customData, chartOptions, legendColor, titleColor, subtitleColor, selectedDataset, fontFamily, fontSize, colorScheme, borderWidth]);

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
  }, [selectedDataset, selectedChartType, chartOptions, renderChart]);


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
              text={selectedChartType.charAt(0).toUpperCase() + selectedChartType.slice(1)} 
              color="blue"
            >
              <AntTitle level={2} className="flex items-center border-3 border-dashed border-blue-200">
                {getChartIcon(selectedChartType)}
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
                selectedDataset,
                setSelectedDataset,
                selectedChartType,
                setSelectedChartType,
                compatibleChartTypes,
                borderWidth,
                setBorderWidth,
                showLegend,
                setShowLegend,
                legendPosition,
                setLegendPosition,
                legendColor,
                setLegendColor,
                showTitle,
                setShowTitle,
                chartTitle,
                setChartTitle,
                titleColor,
                setTitleColor,
                showSubtitle,
                setShowSubtitle,
                subtitle,
                setSubtitle,
                subtitleColor,
                setSubtitleColor,
                animationDuration,
                setAnimationDuration,
                animationType,
                setAnimationType,
                animationDelay,
                setAnimationDelay,
                animationPlaying,
                setAnimationPlaying,
                aspectRatio,
                setAspectRatio,
                tension,
                setTension,
                colorScheme,
                setColorScheme,
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