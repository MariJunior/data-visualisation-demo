import { mockDatasets } from '@/app/data/datasets';
import { Card, Col, Divider, Input, Radio, Row, Select, Slider, Switch, Tabs, Typography } from 'antd';
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
import { FC, useCallback, useEffect, useRef, useState } from 'react';

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

// Enum для типов графиков
enum ChartTypeEnum {
  LINE = 'line',
  BAR = 'bar',
  RADAR = 'radar',
  PIE = 'pie',
  DOUGHNUT = 'doughnut',
  POLAR_AREA = 'polarArea',
  BUBBLE = 'bubble',
  SCATTER = 'scatter'
}

// Enum для наборов данных
enum DatasetEnum {
  SALES = 'sales',
  USERS = 'users',
  PERFORMANCE = 'performance',
  REVENUE = 'revenue',
  DEMOGRAPHICS = 'demographics',
  COMPARISON = 'comparison',
  TIME_DATA = 'timeData'
}

// Enum для позиций легенды
enum LegendPositionEnum {
  TOP = 'top',
  LEFT = 'left',
  BOTTOM = 'bottom',
  RIGHT = 'right'
}

// Тип для элементов массива типов графиков
interface ChartTypeItem {
  id: ChartTypeEnum;
  label: string;
}

const chartTypes: ChartTypeItem[] = [
  { id: ChartTypeEnum.LINE, label: 'Line Chart' },
  { id: ChartTypeEnum.BAR, label: 'Bar Chart' },
  { id: ChartTypeEnum.RADAR, label: 'Radar Chart' },
  { id: ChartTypeEnum.PIE, label: 'Pie Chart' },
  { id: ChartTypeEnum.DOUGHNUT, label: 'Doughnut Chart' },
  { id: ChartTypeEnum.POLAR_AREA, label: 'Polar Area Chart' },
  { id: ChartTypeEnum.BUBBLE, label: 'Bubble Chart' },
  { id: ChartTypeEnum.SCATTER, label: 'Scatter Chart' },
];

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
      text: 'Chart.js Demo',
      font: {
        size: 16,
        weight: 'bold',
      },
    },
  },
};

interface TabItem {
  key: string;
  label: string;
  children: React.ReactNode;
}

interface ChartJSComponentProps {
  fontSize?: number;
  fontFamily?: string;
};

export const ChartJSComponent: FC<ChartJSComponentProps> = ({ 
  fontSize = 14,
  fontFamily = 'Arial',
}) => {
  const [selectedDataset, setSelectedDataset] = useState<DatasetEnum>(DatasetEnum.SALES);
  const [selectedChartType, setSelectedChartType] = useState<ChartTypeEnum>(ChartTypeEnum.LINE);
  const [chartOptions, setChartOptions] = useState<ChartOptions<ChartType>>(defaultOptions);
  
  const [showLegend, setShowLegend] = useState(true);
  const [legendPosition, setLegendPosition] = useState<LegendPositionEnum>(LegendPositionEnum.TOP);
  const [chartTitle, setChartTitle] = useState('Chart.js Demo');
  const [showTitle, setShowTitle] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(2);
  const [animationDuration, setAnimationDuration] = useState(1000);
  const [borderWidth, setBorderWidth] = useState(1);
  const [tension, setTension] = useState(0.4);

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<ChartJS<ChartType, unknown[], unknown> | null>(null);

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
              weight: 'bold',
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

  const renderChart = useCallback(() => {
    if (!chartRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;


    let currentData: ChartData<ChartType>;
    let chartType = selectedChartType;
    
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
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: selectedDataset === DatasetEnum.USERS ? 'Active Users' : 'Website Traffic',
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
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: selectedDataset === DatasetEnum.USERS ? 'New Registrations' : 'Server Load (%)',
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
  }, [chartOptions, selectedChartType, selectedDataset]);

  useEffect(() => {
    if (chartRef.current) {
      renderChart();
    }
  }, [selectedDataset, selectedChartType, chartOptions, renderChart]);

  // Добавим эффект для обновления графика при изменении шрифта
  useEffect(() => {
    // Глобальные настройки Chart.js для шрифтов
    ChartJS.defaults.font.family = fontFamily;
    ChartJS.defaults.font.size = fontSize;
    
    // Полностью пересоздадим график
    if (chartRef.current) {
      // Уничтожим текущий график, если он существует
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
      
      // Вызовем renderChart для создания нового графика с обновленными настройками
      renderChart();
    }
  }, [fontFamily, fontSize, renderChart]);

  const tabItems: TabItem[] = [
    {
      key: 'chartType',
      label: 'Chart Type',
      children: (
        <div className="p-4">
          <Radio.Group 
            value={selectedChartType} 
            onChange={(e) => setSelectedChartType(e.target.value)}
            className="flex flex-wrap gap-2"
          >
            {chartTypes.map((type) => (
              <Radio.Button key={type.id} value={type.id}>
                {type.label}
              </Radio.Button>
            ))}
          </Radio.Group>
        </div>
      ),
    },
    {
      key: 'dataset',
      label: 'Dataset',
      children: (
        <div className="p-4">
          <Radio.Group 
            value={selectedDataset} 
            onChange={(e) => setSelectedDataset(e.target.value)}
            className="flex flex-wrap gap-2"
          >
            <Radio.Button value={DatasetEnum.SALES}>Sales Data</Radio.Button>
            <Radio.Button value={DatasetEnum.USERS}>User Statistics</Radio.Button>
            <Radio.Button value={DatasetEnum.PERFORMANCE}>Performance Metrics</Radio.Button>
            <Radio.Button value={DatasetEnum.REVENUE}>Revenue by Category</Radio.Button>
            <Radio.Button value={DatasetEnum.DEMOGRAPHICS}>Demographics</Radio.Button>
            <Radio.Button value={DatasetEnum.COMPARISON}>Regional Comparison</Radio.Button>
            <Radio.Button value={DatasetEnum.TIME_DATA}>Time Series</Radio.Button>
          </Radio.Group>
        </div>
      ),
    },
    {
      key: 'appearance',
      label: 'Appearance',
      children: (
        <div className="p-4 space-y-4">
          <div>
            <Text className="block mb-2">Chart Title</Text>
            <Input 
              value={chartTitle} 
              onChange={(e) => setChartTitle(e.target.value)}
              className="w-full max-w-md"
            />
            <div className="mt-2">
              <Switch 
                checked={showTitle} 
                onChange={setShowTitle} 
                className="mr-2"
              />
              <Text>Show Title</Text>
            </div>
          </div>
          
          <Divider className="my-4" />
          
          <div>
            <Text className="block mb-2">Legend</Text>
            <div className="flex items-center gap-4">
              <div>
                <Switch 
                  checked={showLegend} 
                  onChange={setShowLegend} 
                  className="mr-2"
                />
                <Text>Show Legend</Text>
              </div>
              
              <div>
                <Text className="mr-2">Position:</Text>
                <Select 
                  value={legendPosition} 
                  onChange={setLegendPosition}
                  disabled={!showLegend}
                  style={{ width: 120 }}
                >
                  <Option value={LegendPositionEnum.TOP}>Top</Option>
                  <Option value={LegendPositionEnum.LEFT}>Left</Option>
                  <Option value={LegendPositionEnum.BOTTOM}>Bottom</Option>
                  <Option value={LegendPositionEnum.RIGHT}>Right</Option>
                </Select>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'advanced',
      label: 'Advanced',
      children: (
        <div className="p-4 space-y-6">
          <div>
            <Text className="block mb-2">Aspect Ratio: {aspectRatio}</Text>
            <Slider 
              min={0.5} 
              max={4} 
              step={0.1} 
              value={aspectRatio}
              onChange={setAspectRatio}
              className="w-full max-w-md"
            />
          </div>
          
          <div>
            <Text className="block mb-2">Animation Duration: {animationDuration}ms</Text>
            <Slider 
              min={0} 
              max={2000} 
              step={100} 
              value={animationDuration}
              onChange={setAnimationDuration}
              className="w-full max-w-md"
            />
          </div>
          
          <div>
            <Text className="block mb-2">Border Width: {borderWidth}px</Text>
            <Slider 
              min={0} 
              max={10} 
              step={1} 
              value={borderWidth}
              onChange={setBorderWidth}
              className="w-full max-w-md"
            />
          </div>
          
          {selectedChartType === ChartTypeEnum.LINE && (
            <div>
              <Text className="block mb-2">Line Tension: {tension}</Text>
              <Slider 
                min={0} 
                max={1} 
                step={0.1} 
                value={tension}
                onChange={setTension}
                className="w-full max-w-md"
              />
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <AntTitle level={2} className="text-center mb-8">Chart.js Visualization Demo</AntTitle>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card className="shadow-md">
            <Tabs items={tabItems} defaultActiveKey="chartType" />
          </Card>
        </Col>
        
        <Col xs={24} lg={16}>
          <Card className="shadow-md p-4 h-full">
            <div className="w-full h-full min-h-[400px] flex items-center justify-center">
              <canvas ref={chartRef}></canvas>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ChartJSComponent;