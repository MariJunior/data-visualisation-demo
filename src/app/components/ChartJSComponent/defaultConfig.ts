import { ChartConfig, LegendPositionEnum, LineStyleEnum, PointStyleEnum, TooltipModeEnum } from "./types";

// Default configuration
export const defaultConfig: ChartConfig = {
  title: {
    display: true,
    text: 'Chart.js Demo',
    color: '#333333',
  },
  subtitle: {
    display: false,
    text: '',
    color: '#666666',
  },
  legend: {
    display: true,
    position: LegendPositionEnum.TOP,
    color: '#333333',
    useHtmlLegend: false,
  },
  tooltip: {
    enabled: true,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderColor: 'rgba(0, 0, 0, 0)',
    mode: TooltipModeEnum.NEAREST,
    intersect: true,
    padding: 10,
  },
  animation: {
    duration: 1000,
    type: "linear",
    delay: 0,
  },
  appearance: {
    aspectRatio: 2,
    borderWidth: 1,
    colorScheme: 'default',
    useCustomColors: false,
  },
  line: {
    tension: 0.4,
    borderWidth: 1,
    borderColor: '#36A2EB',
    fill: false,
    style: LineStyleEnum.SOLID,
    segment: {
      enabled: false,
      borderColor: 'rgba(0, 0, 0, 0.1)',
      borderWidth: 1,
    },
  },
  point: {
    radius: 4,
    hoverRadius: 6,
    borderWidth: 1,
    backgroundColor: '#36A2EB',
    borderColor: '#FFFFFF',
    style: PointStyleEnum.CIRCLE,
  },
  plugins: {
    zoom: {
      enabled: false,
      mode: 'xy' as 'xy' | 'x' | 'y',
      sensitivity: 3,
    },
    crosshair: {
      enabled: false,
      color: 'rgba(0, 0, 0, 0.5)',
      width: 1,
    },
    outlabels: {
      enabled: false,
      text: '%l: %v',
      color: '#FFFFFF',
      backgroundColor: '#36A2EB',
    },
    dragData: {
      enabled: false,
      round: 1,
    }
  }
};