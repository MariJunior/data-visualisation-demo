import { DotChartOutlined } from "@ant-design/icons";
import { Card, Input, Select, Slider, Space, Switch, Typography } from "antd";
import { FC } from "react";
import { ChartTypeEnum, DatasetEnum, LegendPositionEnum } from "../types";

const { Text } = Typography;
const { Option } = Select;

export type ChartControlsBasicProps = {
  selectedDataset: DatasetEnum;
  setSelectedDataset: (value: DatasetEnum) => void;
  selectedChartType: ChartTypeEnum;
  setSelectedChartType: (value: ChartTypeEnum) => void;
  compatibleChartTypes: ChartTypeEnum[];
  borderWidth: number;
  setBorderWidth: (value: number) => void;
  showLegend: boolean;
  setShowLegend: (value: boolean) => void;
  legendPosition: LegendPositionEnum;
  setLegendPosition: (value: LegendPositionEnum) => void;
  showTitle: boolean;
  setShowTitle: (value: boolean) => void;
  chartTitle: string;
  setChartTitle: (value: string) => void;
  animationDuration: number;
  setAnimationDuration: (value: number) => void;
  aspectRatio: number;
  setAspectRatio: (value: number) => void;
  tension: number;
  setTension: (value: number) => void;
};

export const ChartControlsBasic: FC<ChartControlsBasicProps> = ({
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
}) => {
  return (
    <Space direction="horizontal" align="start" wrap style={{ width: "100%", justifyContent: "space-between" }}>
      {/* Группа выбора данных */}
      <Card 
        size="small" 
        title={<span className="flex items-center"><DotChartOutlined className="mr-2" /> Data</span>}
        className="min-w-[200px] hover:shadow-md transition-shadow duration-300"
        style={{ 
          borderRadius: "8px", 
          border: "1px solid #c4b5fd",
        }}
        styles={{ header: { background: "#ddd6fe", color: "#5b21b6" }}}
      >
        <Space direction="vertical" className="w-full">
          <div>
            <Text>Dataset</Text>
            <Select
              style={{ width: "100%" }}
              value={selectedDataset}
              onChange={(value) => setSelectedDataset(value)}
            >
              {Object.values(DatasetEnum).map((dataset) => (
                <Option key={dataset} value={dataset}>
                  {dataset.charAt(0) + dataset.slice(1).toLowerCase().replace("_", " ")}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <Text>Chart Type</Text>
            <Select
              style={{ width: "100%" }}
              value={selectedChartType}
              onChange={(value) => setSelectedChartType(value)}
            >
              {compatibleChartTypes.map((chartType) => (
                <Option key={chartType} value={chartType}>
                  {chartType.charAt(0).toUpperCase() + chartType.slice(1).replace(/([A-Z])/g, " $1").trim()}
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
          borderRadius: "8px", 
          border: "1px solid #c4b5fd",
        }}
        styles={{ header: { background: "#ddd6fe", color: "#5b21b6" }}}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
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
          borderRadius: "8px", 
          border: "1px solid #c4b5fd",
        }}
        styles={{ header: { background: "#ddd6fe", color: "#5b21b6" }}}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
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
                style={{ width: "100%" }}
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
          borderRadius: "8px", 
          border: "1px solid #c4b5fd",
        }}
        styles={{ header: { background: "#ddd6fe", color: "#5b21b6" }}}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
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
  );
};

export default ChartControlsBasic;
