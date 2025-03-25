import { BarChartOutlined, DotChartOutlined, LineChartOutlined, PieChartOutlined, RadarChartOutlined } from '@ant-design/icons';
import { Badge, Card, Col, Input, Row, Select, Slider, Space, Switch, Typography } from "antd";
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
  ChartTypeRegistry,
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
  Tooltip,
} from "chart.js";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import DataUploader from '../DataUploader';
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
  const [userData, setUserData] = useState<any>(null);
  
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


    let currentData: ChartData<ChartType>;
    let chartType = selectedChartType;
    
    if (userData) {
      currentData = userData;
    } else if (customData) {
      currentData = customData;
    } else {
      // Определяем, какой датасет и тип графика использовать
      if (selectedChartType === ChartTypeEnum.BUBBLE) {
        currentData = mockDatasets.bubbleData as ChartData<ChartType>;
      } else if (selectedChartType === ChartTypeEnum.SCATTER) {
        currentData = mockDatasets.scatterData as ChartData<ChartType>;
      } else if (selectedDataset === DatasetEnum.DEMOGRAPHICS) {
        // Для демографических данных лучше использовать круговые диаграммы
        currentData = mockDatasets.demographics as ChartData<ChartType>;
        if (selectedChartType !== ChartTypeEnum.PIE && selectedChartType !== ChartTypeEnum.DOUGHNUT) {
          chartType = ChartTypeEnum.PIE; // Автоматически переключаемся на круговую диаграмму
        }
      } else if (selectedDataset === DatasetEnum.PERFORMANCE) {
        currentData = mockDatasets.performance as ChartData<ChartType>;
        if (selectedChartType !== ChartTypeEnum.RADAR && selectedChartType !== ChartTypeEnum.POLAR_AREA) {
          chartType = ChartTypeEnum.RADAR; // Автоматически переключаемся на радарную диаграмму
        }
      } else if (selectedDataset === DatasetEnum.TIME_DATA) {
        currentData = mockDatasets.timeData as ChartData<ChartType>;
        if (selectedChartType !== ChartTypeEnum.LINE) {
          chartType = ChartTypeEnum.LINE; // Для временных рядов лучше использовать линейный график
        }
      } else {
        // Для остальных датасетов используем выбранный тип графика
        currentData = mockDatasets[selectedDataset] as ChartData<ChartType>;
      }
    }

    // Создаем дополнительные опции в зависимости от датасета
    let options = { ...chartOptions };
    
    // Для датасета users и timeData добавляем вторую ось Y
    if ((selectedDataset === DatasetEnum.USERS || selectedDataset === DatasetEnum.TIME_DATA) && 
        (chartType === ChartTypeEnum.LINE || chartType === ChartTypeEnum.BAR)) {
      options = {
        ...options,
        scales: {
          ...options.scales,
          y: {
            type: "linear",
            display: true,
            position: "left",
            title: {
              display: true,
              text: selectedDataset === DatasetEnum.USERS ? "Active Users" : "Website Traffic",
              font: {
                family: fontFamily,
                size: fontSize,
              }
            },
            ticks: {
              font: {
                family: fontFamily,
                size: fontSize,
              }
            }
          },
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
            },
            ticks: {
              font: {
                family: fontFamily,
                size: fontSize,
              }
            }
          }
        }
      };
    }

    // Создаем график
    chartInstanceRef.current = new ChartJS(ctx, {
      data: currentData,
      type: chartType as keyof ChartTypeRegistry,
      options: options
    });
  }, [destroyChart, selectedChartType, userData, customData, chartOptions, selectedDataset, fontFamily, fontSize]);

  // Добавим функцию для загрузки пользовательских данных
  const handleDataLoaded = (data: any) => {
    setUserData(data);
  };


  useEffect(() => {
    const timer = setTimeout(() => {
      if (chartRef.current) {
        renderChart();
      }
    }, 0);
    
    return () => clearTimeout(timer);
  }, [selectedDataset, selectedChartType, chartOptions, renderChart, userData]);

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
    <div className="p-6 bg-gradient-to-br from-indigo-400 via-purple-300 to-pink-300 rounded-xl shadow-lg">
      <DataUploader onDataLoaded={handleDataLoaded} />

      <Card 
        className="chart-container overflow-hidden border-0"
        style={{ 
          boxShadow: '0 10px 30px rgba(99, 102, 241, 0.2)', 
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)'
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
              className="relative bg-white rounded-lg p-4 shadow-inner" 
              style={{ 
                height: '400px', 
                width: '100%',
                backgroundImage: 'radial-gradient(circle at 1px 1px, #c9c6cd 1px, transparent 0)',
                backgroundSize: '14px 14px',
                boxShadow: 'inset 0 2px 10px rgba(99, 102, 241, 0.1)'
              }}
            >
              <canvas ref={chartRef} />
            </div>
          </Col>
      
          <Col span={24}>
            <Space direction="horizontal" align="start" wrap style={{ width: '100%', justifyContent: 'space-between' }}>
              {/* Группа выбора данных */}
              <Card 
                size="small" 
                title={<span className="flex items-center"><DotChartOutlined className="mr-2" /> Data</span>}
                className="min-w-[200px] hover:shadow-md transition-shadow duration-300"
                style={{ 
                  borderRadius: '8px', 
                  border: '1px solid #c4b5fd',
                  background: 'linear-gradient(to bottom, #f5f3ff, #ffffff)'
                }}
                styles={{ header: { background: '#ddd6fe', color: '#5b21b6' }}}
              >
                <Space direction="vertical" className="w-full">
                  <div>
                    <Text>Dataset</Text>
                    <Select
                      style={{ width: '100%' }}
                      value={selectedDataset}
                      onChange={(value) => setSelectedDataset(value)}
                    >
                      {Object.values(DatasetEnum).map((dataset) => (
                        <Option key={dataset} value={dataset}>
                          {dataset.charAt(0) + dataset.slice(1).toLowerCase().replace('_', ' ')}
                        </Option>
                      ))}
                    </Select>
                  </div>
      
                  <div>
                    <Text>Chart Type</Text>
                    <Select
                      style={{ width: '100%' }}
                      value={selectedChartType}
                      onChange={(value) => setSelectedChartType(value)}
                    >
                      {compatibleChartTypes.map((chartType) => (
                        <Option key={chartType} value={chartType}>
                          {chartType.charAt(0).toUpperCase() + chartType.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </Space>
              </Card>
      
              {/* Группа настроек внешнего вида */}
              <Card 
                size="small" 
                title={<span className="flex items-center"><i className="mr-2">🎨</i> Appearance</span>}
                className="min-w-[200px] hover:shadow-md transition-shadow duration-300"
                style={{ 
                  borderRadius: '8px', 
                  border: '1px solid #c4b5fd',
                  background: 'linear-gradient(to bottom, #f5f3ff, #ffffff)'
                }}
                styles={{ header: { background: '#ddd6fe', color: '#5b21b6' }}}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text>Border Width: {borderWidth}px</Text>
                    <Slider
                      min={0}
                      max={5}
                      value={borderWidth}
                      onChange={(value) => setBorderWidth(value)}
                    />
                  </div>
                </Space>
              </Card>
      
              {/* Группа настроек легенды и заголовка */}
              <Card 
                size="small" 
                title={<span className="flex items-center"><i className="mr-2">📝</i> Legend & Title</span>}
                className="min-w-[200px] hover:shadow-md transition-shadow duration-300"
                style={{ 
                  borderRadius: '8px', 
                  border: '1px solid #c4b5fd',
                  background: 'linear-gradient(to bottom, #f5f3ff, #ffffff)'
                }}
                styles={{ header: { background: '#ddd6fe', color: '#5b21b6' }}}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text>Show Legend</Text>
                    <Switch
                      checked={showLegend}
                      onChange={(checked) => setShowLegend(checked)}
                      style={{ marginLeft: 8 }}
                    />
                  </div>
      
                  {showLegend && (
                    <div>
                      <Text>Legend Position</Text>
                      <Select
                        style={{ width: '100%' }}
                        value={legendPosition}
                        onChange={(value) => setLegendPosition(value)}
                      >
                        {Object.values(LegendPositionEnum).map((position) => (
                          <Option key={position} value={position}>{position}</Option>
                        ))}
                      </Select>
                    </div>
                  )}
      
                  <div>
                    <Text>Show Title</Text>
                    <Switch
                      checked={showTitle}
                      onChange={(checked) => setShowTitle(checked)}
                      style={{ marginLeft: 8 }}
                    />
                  </div>
      
                  {showTitle && (
                    <div>
                      <Text>Chart Title</Text>
                      <Input
                        value={chartTitle}
                        onChange={(e) => setChartTitle(e.target.value)}
                      />
                    </div>
                  )}
                </Space>
              </Card>
      
              {/* Группа настроек анимации */}
              <Card 
                size="small" 
                title={<span className="flex items-center"><i className="mr-2">✨</i> Animation & Layout</span>}
                className="min-w-[200px] hover:shadow-md transition-shadow duration-300"
                style={{ 
                  borderRadius: '8px', 
                  border: '1px solid #c4b5fd',
                  background: 'linear-gradient(to bottom, #f5f3ff, #ffffff)'
                }}
                styles={{ header: { background: '#ddd6fe', color: '#5b21b6' }}}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text>Animation Duration: {animationDuration}ms</Text>
                    <Slider
                      min={0}
                      max={2000}
                      step={100}
                      value={animationDuration}
                      onChange={(value) => setAnimationDuration(value)}
                    />
                  </div>
      
                  <div>
                    <Text>Aspect Ratio: {aspectRatio}</Text>
                    <Slider
                      min={1}
                      max={4}
                      step={0.1}
                      value={aspectRatio}
                      onChange={(value) => setAspectRatio(value)}
                    />
                  </div>
      
                  {(selectedChartType === ChartTypeEnum.LINE) && (
                    <div>
                      <Text>Line Tension: {tension}</Text>
                      <Slider
                        min={0}
                        max={1}
                        step={0.1}
                        value={tension}
                        onChange={(value) => setTension(value)}
                      />
                    </div>
                  )}
                </Space>
              </Card>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ChartJSComponent;