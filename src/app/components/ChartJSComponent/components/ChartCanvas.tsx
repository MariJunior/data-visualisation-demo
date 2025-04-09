import { ExpandAltOutlined, UndoOutlined, ZoomInOutlined } from "@ant-design/icons";
import { Tooltip as AntdTooltip, Button } from "antd";
import { FC, useEffect, useRef } from "react";
import { useChartInstance } from "../hooks/useChartInstance";
import { useChartResize } from "../hooks/useChartResize";
import { useFullscreen } from "../hooks/useFullscreen";

interface ChartCanvasProps {
  aspectRatio: number;
  renderChart: () => void;
  isDarkMode: boolean;
}

/**
 * Компонент для отображения canvas с графиком
 */
export const ChartCanvas: FC<ChartCanvasProps> = ({ 
  aspectRatio, 
  renderChart, 
  isDarkMode 
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { chartInstanceRef, resetZoom } = useChartInstance();
  
  // Обработчик изменения полноэкранного режима
  const handleFullscreenChange = () => {
    // Добавляем небольшую задержку, чтобы DOM успел обновиться
    setTimeout(() => {
      resizeChartToContainer();
    }, 100);
  };
  
  const { isFullscreen, toggleFullscreen } = useFullscreen(
    chartContainerRef, 
    handleFullscreenChange
  );
  
  const { resizeChartToContainer } = useChartResize(
    chartRef, 
    chartInstanceRef, 
    chartContainerRef, 
    aspectRatio
  );

  // Инициализация графика при монтировании
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
  }, [renderChart]);

  // Изменение размера при изменении полноэкранного режима
  useEffect(() => {
    const timer = setTimeout(() => {
      resizeChartToContainer();
    }, 200);
    
    return () => clearTimeout(timer);
  }, [isFullscreen, resizeChartToContainer]);

  return (
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
        <AntdTooltip title="Reset Zoom">
          <Button 
            icon={<UndoOutlined />} 
            onClick={resetZoom}
            size="small"
          />
        </AntdTooltip>
        <AntdTooltip title="Zoom (use mouse wheel)">
          <Button 
            icon={<ZoomInOutlined />} 
            size="small"
            disabled
          />
        </AntdTooltip>
        <AntdTooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}>
          <Button 
            icon={<ExpandAltOutlined />} 
            onClick={toggleFullscreen}
            size="small"
          />
        </AntdTooltip>
      </div>
      <canvas ref={chartRef} style={{ maxWidth: "100%", maxHeight: "100%" }} />
    </div>
  );
};
