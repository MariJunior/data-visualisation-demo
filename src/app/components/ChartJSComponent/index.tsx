import { useIsDarkMode } from "@/app/hooks/useIsDarkMode";
import { ChartDataType } from "@/app/types/chart";
import { BarChartOutlined, DotChartOutlined, LineChartOutlined, PieChartOutlined, RadarChartOutlined } from "@ant-design/icons";
import { Badge, Card, Col, Row, Select, Typography } from "antd";
import {
  ArcElement,
  BarController,
  BarElement,
  BubbleController,
  CategoryScale,
  Chart as ChartJS,
  ChartOptions,
  ChartType,
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
  Title,
  Tooltip
} from "chart.js";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import ChartControls from "./components/ChartControls";
import { mockDatasets } from "./datasets";
import { ChartJSComponentProps, ChartTypeEnum, DatasetEnum, LegendPositionEnum } from "./types";

const { Title: AntTitle, Text } = Typography;
const { Option } = Select;

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
  Legend
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
  const [selectedDataset, setSelectedDataset] = useState<DatasetEnum>(DatasetEnum.SALES);
  const [selectedChartType, setSelectedChartType] = useState<ChartTypeEnum>(ChartTypeEnum.LINE);
  const [compatibleChartTypes, setCompatibleChartTypes] = useState<ChartTypeEnum[]>([]);
  const [chartOptions, setChartOptions] = useState<ChartOptions<ChartType>>(defaultOptions);
  // Добавим состояние для хранения пользовательских данных
  
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
            },
            title: {
              display: true,
              font: fontConfig, // Шрифт для заголовка оси X
            }
          },
          y: {
            ticks: {
              font: fontConfig, // Шрифт для оси Y
            },
            title: {
              display: true,
              font: fontConfig, // Шрифт для заголовка оси Y
            }
          }
        },
        plugins: {
          legend: {
            display: showLegend,
            position: legendPosition,
            labels: {
              font: fontConfig,
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
    }, 
    [animationDuration, aspectRatio, borderWidth, chartTitle, legendPosition, showLegend, showTitle, tension, fontSize, fontFamily]
  );

  useEffect(
    () => { 
      updateChartOptions(); 
    }, 
    [showLegend, legendPosition, chartTitle, showTitle, aspectRatio, animationDuration, borderWidth, tension, updateChartOptions]
  );

  const destroyChart = useCallback(() => {
    if (chartInstanceRef.current) {
      try {
        chartInstanceRef.current.destroy();
      } catch (error) {
        console.error("Error destroying chart:", error);
      }
      chartInstanceRef.current = null;
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
    const textColor = isDarkMode ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)";

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
            color: textColor,
          }
        },
        title: {
          ...chartOptions.plugins?.title,
          color: textColor,
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
            color: textColor,
          }
        },
        y: {
          grid: {
            color: gridColor,
          },
          ticks: {
            color: textColor,
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
              }
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
              color: textColor,
            }
          }
        } : {})
      } : undefined
    } as ChartOptions<ChartType>;

    // Создаем график
    chartInstanceRef.current = new ChartJS(ctx, {
      data: currentData,
      type: chartType as ChartType,
      options: options
    });
  }, [destroyChart, isDarkMode, selectedChartType, customData, chartOptions, selectedDataset, fontFamily, fontSize]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (chartRef.current) {
        renderChart();
      }
    }, 0);
    
    return () => clearTimeout(timer);
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
                showTitle,
                setShowTitle,
                chartTitle,
                setChartTitle,
                animationDuration,
                setAnimationDuration,
                aspectRatio,
                setAspectRatio,
                tension,
                setTension,
              }}
            />
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ChartJSComponent;