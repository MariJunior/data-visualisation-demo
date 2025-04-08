import { DotChartOutlined } from "@ant-design/icons";
import { Card, ColorPicker, Input, Select, Slider, Space, Switch, Typography } from "antd";
import { Color, EasingFunction } from "chart.js";
import { FC } from "react";
import { ChartTypeEnum, DatasetEnum, LegendPositionEnum } from "../types";

const { Text } = Typography;
const { Option } = Select;

export type ChartControlsBasicProps = {
  hideDatasetSelector?: boolean;
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
  legendColor: Color;
  setLegendColor: (value: Color) => void;
  showTitle: boolean;
  setShowTitle: (value: boolean) => void;
  chartTitle: string;
  setChartTitle: (value: string) => void;
  titleColor: Color;
  setTitleColor: (value: Color) => void;
  showSubtitle: boolean;
  setShowSubtitle: (value: boolean) => void;
  subtitle: string;
  setSubtitle: (value: string) => void;
  subtitleColor: Color;
  setSubtitleColor: (value: Color) => void;
  animationDuration: number;
  setAnimationDuration: (value: number) => void;
  animationType: EasingFunction;
  setAnimationType: (value: EasingFunction) => void;
  animationDelay: number;
  setAnimationDelay: (value: number) => void;
  animationPlaying: string;
  setAnimationPlaying: (value: string) => void;
  aspectRatio: number;
  setAspectRatio: (value: number) => void;
  tension: number;
  setTension: (value: number) => void;
  colorScheme: string;
  setColorScheme: (value: string) => void;
  colorSchemes: Array<{ id: string; name: string; colors: string[] }>;
  easingOptions: EasingFunction[];
};

export const ChartControlsBasic: FC<ChartControlsBasicProps> = ({
  hideDatasetSelector,
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
          { !hideDatasetSelector && (
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
          )}

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

          <div>
            <Text>Color Scheme</Text>
            <Select
              style={{ width: "100%" }}
              value={colorScheme}
              onChange={(value) => setColorScheme(value)}
            >
              {colorSchemes.map((scheme) => (
                <Option key={scheme.id} value={scheme.id}>
                  {scheme.name}
                </Option>
              ))}
            </Select>
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
            <>
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

              <div>
                <Text>Legend Color</Text>
                <ColorPicker
                  value={legendColor as string}
                  onChange={(color) => {
                    const hexColor = color.toHexString();
                    console.log(`Цвет легенды: ${hexColor}`);
                    setLegendColor(hexColor);
                  }}
                />
              </div>
            </>
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
            <>
              <div>
                <Text>Chart Title</Text>
                <Input
                  value={chartTitle}
                  onChange={(e) => setChartTitle(e.target.value)}
                />
              </div>

              <div>
                <Text>Title Color</Text>
                <ColorPicker
                  value={titleColor as string}
                  onChange={(color) => {
                    const hexColor = color.toHexString();
                    console.log(`Цвет заголовка: ${hexColor}`);
                    setTitleColor(hexColor);
                  }}
                />
              </div>
            </>
          )}

          <div>
            <Text>Show Subtitle</Text>
            <Switch
              checked={showSubtitle}
              onChange={(checked) => {
                console.log(`Отображение подзаголовка: ${checked}`);
                setShowSubtitle(checked);
              }}
              style={{ marginLeft: 8 }}
            />
          </div>

          {showSubtitle && (
            <>
              <div>
                <Text>Chart Subtitle</Text>
                <Input
                  value={subtitle}
                  onChange={(e) => {
                    console.log(`Подзаголовок графика: ${e.target.value}`);
                    setSubtitle(e.target.value);
                  }}
                />
              </div>
              
              <div>
                <Text>Subtitle Color</Text>
                <ColorPicker
                  value={subtitleColor as string}
                  onChange={(color) => {
                    const hexColor = color.toHexString();
                    console.log(`Цвет подзаголовка: ${hexColor}`);
                    setSubtitleColor(hexColor);
                  }}
                />
              </div>
            </>
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
            <Text>Animation Playing</Text>
            <Select
              style={{ width: "100%" }}
              value={animationPlaying}
              onChange={(value) => setAnimationPlaying(value)}
            >
              <Option key="disabled" value="disabled">Disabled</Option>
              <Option key="once" value="once">Once</Option>
              <Option key="loop" value="loop">Loop</Option>
            </Select>
          </div>

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
            <Text>Animation Type</Text>
            <Select
              style={{ width: "100%" }}
              value={animationType}
              onChange={(value) => setAnimationType(value)}
            >
              {easingOptions.map((type) => (
                <Option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, " $1").trim()}
                </Option>
              ))}
            </Select>
          </div>
          
          <div>
            <Text>Animation Delay: {animationDelay}ms</Text>
            <Slider
              min={0}
              max={1000}
              step={50}
              value={animationDelay}
              onChange={(value) => setAnimationDelay(value)}
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
