import { BarChartOutlined, DotChartOutlined, LineChartOutlined, PieChartOutlined, RadarChartOutlined } from "@ant-design/icons";
import { Badge, Typography } from "antd";
import { FC } from "react";
import { ChartTypeEnum } from "../types";

const { Title } = Typography;

interface ChartHeaderProps {
  chartType: ChartTypeEnum;
  fontFamily: string;
}

/**
 * Компонент для отображения заголовка графика с иконкой и типом
 */
export const ChartHeader: FC<ChartHeaderProps> = ({ chartType, fontFamily }) => {
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

  // Форматирование названия типа графика для отображения
  const formatChartTypeName = (type: string): string => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="flex items-center justify-between mt-5">
      <Badge.Ribbon 
        text={formatChartTypeName(chartType)} 
        color="blue"
      >
        <Title level={2} className="flex items-center border-3 border-dashed border-blue-200">
          {getChartIcon(chartType)}
          <span className="mr-10" style={{ fontFamily }}>Chart.js Visualization Demo</span>
        </Title>
      </Badge.Ribbon>
      <div className="text-xs text-gray-500">
        Powered by Chart.js ✨
      </div>
    </div>
  );
};
