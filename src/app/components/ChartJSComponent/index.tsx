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
import CrosshairPlugin from 'chartjs-plugin-crosshair';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import zoomPlugin from 'chartjs-plugin-zoom';
import { ZoomPluginOptions } from "chartjs-plugin-zoom/types/options";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { colorSchemes } from "./colorSchemes";
import { ChartControls } from "./components";
import { mockDatasets } from "./datasets";
import { defaultConfig } from "./defaultConfig";
import { ChartConfig, ChartJSComponentProps, ChartTypeEnum, DatasetEnum, LegendPositionEnum, LineStyleEnum } from "./types";

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
  zoomPlugin,
  ChartDataLabels,
  CrosshairPlugin
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
  const [config, setConfig] = useState<ChartConfig>(defaultConfig);

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

  const handleChartConfigChange = useCallback((newConfig: ChartConfig) => {
    setConfig(newConfig);

    // Update chart options based on the new configuration
    setChartOptions(prevOptions => {
      // Create a new options object
      const newOptions: ChartOptions<ChartType> = {
        ...prevOptions,
        aspectRatio: newConfig.appearance.aspectRatio,
        plugins: {
          ...prevOptions.plugins,
          title: {
            ...prevOptions.plugins?.title,
            display: newConfig.title.display,
            text: newConfig.title.text,
            color: newConfig.title.color,
          },
          subtitle: {
            display: newConfig.subtitle.display,
            text: newConfig.subtitle.text,
            color: newConfig.subtitle.color,
          },
          legend: {
            ...prevOptions.plugins?.legend,
            display: newConfig.legend.display,
            position: newConfig.legend.position,
            labels: {
              ...prevOptions.plugins?.legend?.labels,
              color: newConfig.legend.color,
            },
          },
          tooltip: {
            ...prevOptions.plugins?.tooltip,
            enabled: newConfig.tooltip.enabled,
            backgroundColor: newConfig.tooltip.backgroundColor,
            borderColor: newConfig.tooltip.borderColor,
            mode: newConfig.tooltip.mode,
            intersect: newConfig.tooltip.intersect,
            padding: newConfig.tooltip.padding,
          },
          // Add zoom plugin configuration
          zoom: {
            zoom: {
              enabled: newConfig.plugins.zoom.enabled,
              mode: newConfig.plugins.zoom.mode,
              sensitivity: newConfig.plugins.zoom.sensitivity,
            } as ZoomPluginOptions["zoom"],
            pan: {
              enabled: newConfig.plugins.zoom.enabled,
            },
          },
          // // Add crosshair plugin configuration
          // crosshair: {
          //   line: {
          //     color: config.plugins.crosshair.color,
          //     width: config.plugins.crosshair.width,
          //   },
          //   sync: {
          //     enabled: false,
          //   },
          //   zoom: {
          //     enabled: false,
          //   },
          // },
          // Add datalabels plugin configuration
          datalabels: {
            display: false, // Default to off, can be enabled in specific chart types
          },
        },
        animation: {
          ...prevOptions.animation,
          duration: newConfig.animation.duration,
          easing: newConfig.animation.type,
          delay: newConfig.animation.delay,
        },
        elements: {
          ...prevOptions.elements,
          line: {
            ...prevOptions.elements?.line,
            tension: newConfig.line.tension,
            borderWidth: newConfig.line.borderWidth,
            borderColor: newConfig.line.borderColor,
            fill: newConfig.line.fill,
            // Line segment styling
            segment: newConfig.line.segment.enabled ? {
              borderColor: newConfig.line.segment.borderColor,
              borderWidth: newConfig.line.segment.borderWidth,
            } : undefined,
            // Line style (dashed, dotted)
            borderDash: newConfig.line.style === LineStyleEnum.DASHED ? [5, 5] : 
                        newConfig.line.style === LineStyleEnum.DOTTED ? [2, 2] : 
                        undefined,
          },
          point: {
            ...prevOptions.elements?.point,
            radius: newConfig.point.radius,
            hoverRadius: newConfig.point.hoverRadius,
            borderWidth: newConfig.point.borderWidth,
            backgroundColor: newConfig.point.backgroundColor,
            borderColor: newConfig.point.borderColor,
            pointStyle: newConfig.point.style,
          },
          bar: {
            ...prevOptions.elements?.bar,
            borderWidth: newConfig.appearance.borderWidth,
          },
          arc: {
            ...prevOptions.elements?.arc,
            borderWidth: newConfig.appearance.borderWidth,
          }
        },
      };

      return newOptions;
    });
    
    // If we have a chart instance, update it
    if (chartInstanceRef.current) {
      chartInstanceRef.current.update();
    }
  }, []);

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

  // Add a function to create HTML legend
  const setupHtmlLegend = (chart: ChartJS<ChartType, unknown[], unknown>) => {
    const legendContainer = document.getElementById('html-legend-container');
    if (!legendContainer) return;
    
    // Clear previous legend
    legendContainer.innerHTML = '';
    
    // Create new legend items
    const ul = document.createElement('ul');
    ul.style.display = 'flex';
    ul.style.flexWrap = 'wrap';
    ul.style.margin = '0';
    ul.style.padding = '0';
    
    // Get datasets from chart
    const datasets = chart.data.datasets;
    const labels = chart.data.labels || [];
    
    if (datasets) {
      datasets.forEach((dataset, datasetIndex) => {
        const li = document.createElement('li');
        li.style.display = 'inline-flex';
        li.style.alignItems = 'center';
        li.style.margin = '0 10px 5px 0';
        li.style.cursor = 'pointer';
        
        const boxSpan = document.createElement('span');
        boxSpan.style.width = '20px';
        boxSpan.style.height = '20px';
        boxSpan.style.marginRight = '10px';
        boxSpan.style.backgroundColor = 
          Array.isArray(dataset.backgroundColor) 
            ? dataset.backgroundColor[datasetIndex % dataset.backgroundColor.length] as string
            : dataset.backgroundColor as string;
        boxSpan.style.borderRadius = '3px';
        
        const textSpan = document.createElement('span');
        textSpan.textContent = String(dataset.label || labels[datasetIndex] || `Dataset ${datasetIndex}`);
        
        li.appendChild(boxSpan);
        li.appendChild(textSpan);
        
        // Add click handler to toggle visibility
        li.onclick = () => {
          const meta = chart.getDatasetMeta(datasetIndex);
          meta.hidden = meta.hidden === null ? !dataset.hidden : !meta.hidden;
          chart.update();
        };
        
        ul.appendChild(li);
      });
    }
    
    legendContainer.appendChild(ul);
  };

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
        dragData: {
          round: config.plugins.dragData.round,
          showTooltip: true,
          onDragStart: function(e: MouseEvent, datasetIndex: number, index: number, value: number) {
            // You can add custom logic here
            console.log('Drag started:', { datasetIndex, index, value });
          },
          onDrag: function(e: MouseEvent, datasetIndex: number, index: number, value: number) {
            // You can add custom logic here
            console.log('Dragging:', { datasetIndex, index, value });
          },
          onDragEnd: function(e: MouseEvent, datasetIndex: number, index: number, value: number) {
            // You can add custom logic here
            console.log('Drag ended:', { datasetIndex, index, value });
          },
        },
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
          font: {
            family: fontFamily,
          }
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
                size: fontSize,
              }
            },
            grid: {
              drawOnChartArea: false,
              color: gridColor,
            },
            ticks: {
              font: {
                size: fontSize,
              },
              color: textColor,
            }
          }
        } : {})
      } : undefined
    } as ChartOptions<ChartType>;

    // Apply color scheme if using predefined colors
    if (!config.appearance.useCustomColors) {
      const selectedScheme = colorSchemes.find(scheme => scheme.id === config.appearance.colorScheme);
      if (selectedScheme && currentData.datasets) {
        // Apply colors from the scheme to datasets
        currentData.datasets.forEach((dataset, index) => {
          const colorIndex = index % selectedScheme.colors.length;
          if (dataset) {
            if (chartType === ChartTypeEnum.PIE || chartType === ChartTypeEnum.DOUGHNUT) {
              // For pie/doughnut charts, set array of background colors
              dataset.backgroundColor = selectedScheme.colors;
              dataset.borderColor = selectedScheme.colors;
            } else {
              // For other chart types, set single color per dataset
              dataset.backgroundColor = selectedScheme.colors[colorIndex];
              dataset.borderColor = selectedScheme.colors[colorIndex];
            }
          }
        });
      }
    }

    // Создаем график
    chartInstanceRef.current = new ChartJS(ctx, {
      data: currentData,
      type: chartType as ChartType,
      options: options
    });

    // Setup HTML legend if enabled
    if (config.legend.useHtmlLegend && chartInstanceRef.current) {
      setupHtmlLegend(chartInstanceRef.current);
    }

    chartInstanceRef.current.update();
  }, [destroyChart, isDarkMode, selectedChartType, customData, chartOptions, config.plugins.dragData.round, config.appearance.useCustomColors, config.appearance.colorScheme, config.legend.useHtmlLegend, fontFamily, selectedDataset, fontSize]);

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
            {/* HTML Legend Container */}
            <div id="html-legend-container" className="mt-4 flex flex-wrap justify-center" />
          </Col>
      
          <Col span={24}>
            <ChartControls 
              onConfigChange={handleChartConfigChange}
              selectedDataset={selectedDataset}
              setSelectedDataset={setSelectedDataset}
              selectedChartType={selectedChartType}
              setSelectedChartType={setSelectedChartType}
              compatibleChartTypes={compatibleChartTypes}
              showLegend={showLegend}
              setShowLegend={setShowLegend}
              legendPosition={legendPosition}
              setLegendPosition={setLegendPosition}
              chartTitle={chartTitle}
              setChartTitle={setChartTitle}
              showTitle={showTitle}
              setShowTitle={setShowTitle}
              aspectRatio={aspectRatio}
              setAspectRatio={setAspectRatio}
              animationDuration={animationDuration}
              setAnimationDuration={setAnimationDuration}
              borderWidth={borderWidth}
              setBorderWidth={setBorderWidth}
              tension={tension}
              setTension={setTension}
            />
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ChartJSComponent;