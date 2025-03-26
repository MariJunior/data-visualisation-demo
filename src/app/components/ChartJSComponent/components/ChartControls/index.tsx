import { DotChartOutlined } from "@ant-design/icons";
import {
  Card,
  Checkbox,
  Col,
  ColorPicker,
  Divider,
  Input,
  InputNumber,
  Row,
  Select,
  Slider,
  Space,
  Switch,
  Tabs,
  TabsProps,
  Typography
} from "antd";
import { EasingFunction } from "chart.js";
import React, { useEffect, useState } from "react";
import { colorSchemes } from "../../colorSchemes";
import {
  ChartConfig,
  ChartTypeEnum,
  DatasetEnum,
  easingOptions,
  LegendPositionEnum,
  LineStyleEnum,
  PointStyleEnum,
  TooltipModeEnum
} from "../../types";

const { Text, Title } = Typography;
const { Option } = Select;

interface ChartControlsProps {
  onConfigChange: (config: ChartConfig) => void;
  selectedDataset: DatasetEnum;
  setSelectedDataset: (dataset: DatasetEnum) => void;
  selectedChartType: ChartTypeEnum;
  setSelectedChartType: (chartType: ChartTypeEnum) => void;
  compatibleChartTypes: ChartTypeEnum[];
  showLegend: boolean;
  setShowLegend: (show: boolean) => void;
  legendPosition: LegendPositionEnum;
  setLegendPosition: (position: LegendPositionEnum) => void;
  chartTitle: string;
  setChartTitle: (title: string) => void;
  showTitle: boolean;
  setShowTitle: (show: boolean) => void;
  aspectRatio: number;
  setAspectRatio: (ratio: number) => void;
  animationDuration: number;
  setAnimationDuration: (duration: number) => void;
  borderWidth: number;
  setBorderWidth: (width: number) => void;
  tension: number;
  setTension: (tension: number) => void;
}

/**
 * FIXME: На 19:40 26/03/2025 не работают следующие контролы:
 * 1) Data → Chart Type: отображаеются все доступные типы сразу, а не только выбранный в селекте
 * 2) Appearance → Use custom colors: ничего не происходит при нажатии на чекбокс
 * 3) Legend & Title → Legend Color: не меняется цвет легенды
 * 4) Legend & Title → Use HTML Legend: HTML-легенда отображается всегда, а не только при нажатии на чекбокс
 * 5) Legend & Title → Title Color: не меняется цвет заголовка
 * 6) Legend & Title → Show Subtitle: не отображается подзаголовок
 * 7) Line & Point Styling → Line Color: не меняется цвет линии
 * 8) Line & Point Styling → Fill under line: не отображается заливка под линией
 * 9) Line & Point Styling → [Enable segment styling, Segment Color, Segment Width]: функционал не работает
 * 10) Короче, вообще все колорпикеры не работают (цвета связанных компонентов не меняются)
 * 11) Plugin Settings → Enable Zoom: не работает
 * 12) Plugin Settings→ Crosshair: отображается всегда и не настраивается
 */

export const ChartControls: React.FC<ChartControlsProps> = ({
  onConfigChange,
  selectedDataset,
  setSelectedDataset,
  selectedChartType,
  setSelectedChartType,
  compatibleChartTypes,
  showLegend,
  setShowLegend,
  legendPosition,
  setLegendPosition,
  chartTitle,
  setChartTitle,
  showTitle,
  setShowTitle,
  aspectRatio,
  setAspectRatio,
  animationDuration,
  setAnimationDuration,
  borderWidth,
  setBorderWidth,
  tension,
  setTension
}) => {
  // New state variables for advanced features
  const [subtitle, setSubtitle] = useState<string>("");
  const [showSubtitle, setShowSubtitle] = useState<boolean>(false);
  const [titleColor, setTitleColor] = useState<string>("#000000");
  const [subtitleColor, setSubtitleColor] = useState<string>("#666666");
  const [legendColor, setLegendColor] = useState<string>("#333333");
  const [useHtmlLegend, setUseHtmlLegend] = useState<boolean>(false);
  
  // Tooltip settings
  const [tooltipEnabled, setTooltipEnabled] = useState<boolean>(true);
  const [tooltipBackgroundColor, setTooltipBackgroundColor] = useState<string>("#ffffff");
  const [tooltipBorderColor, setTooltipBorderColor] = useState<string>("#cccccc");
  const [tooltipMode, setTooltipMode] = useState<TooltipModeEnum>(TooltipModeEnum.INDEX);
  const [tooltipIntersect, setTooltipIntersect] = useState<boolean>(true);
  const [tooltipPadding, setTooltipPadding] = useState<number>(6);
  
  // Point settings
  const [pointStyle, setPointStyle] = useState<PointStyleEnum>(PointStyleEnum.CIRCLE);
  const [pointRadius, setPointRadius] = useState<number>(4);
  const [pointHoverRadius, setPointHoverRadius] = useState<number>(6);
  const [pointBorderWidth, setPointBorderWidth] = useState<number>(1);
  const [pointBackgroundColor, setPointBackgroundColor] = useState<string>("#36a2eb");
  const [pointBorderColor, setPointBorderColor] = useState<string>("#36a2eb");
  
  // Line settings
  const [lineStyle, setLineStyle] = useState<LineStyleEnum>(LineStyleEnum.SOLID);
  const [lineBorderColor, setLineBorderColor] = useState<string>("#36a2eb");
  const [lineFill, setLineFill] = useState<boolean>(false);
  const [enableLineSegmentStyling, setEnableLineSegmentStyling] = useState<boolean>(false);
  const [segmentBorderColor, setSegmentBorderColor] = useState<string>("#ff6384");
  const [segmentBorderWidth, setSegmentBorderWidth] = useState<number>(2);
  
  // Animation settings
  const [animationType, setAnimationType] = useState<EasingFunction>("linear");
  const [animationDelay, setAnimationDelay] = useState<number>(0);
  
  // Color scheme
  const [colorScheme, setColorScheme] = useState<string>("default");
  const [useCustomColors, setUseCustomColors] = useState<boolean>(false);
  
  // Plugins
  const [zoomEnabled, setZoomEnabled] = useState<boolean>(false);
  const [zoomMode, setZoomMode] = useState<string>("xy");
  const [zoomSensitivity, setZoomSensitivity] = useState<number>(3);
  
  const [dragDataEnabled, setDragDataEnabled] = useState<boolean>(false);
  const [dragDataRound, setDragDataRound] = useState<number>(1);
  
  const [crosshairEnabled, setCrosshairEnabled] = useState<boolean>(false);
  const [crosshairColor, setCrosshairColor] = useState<string>("#666666");
  const [crosshairWidth, setCrosshairWidth] = useState<number>(1);
  
  const [outlabelsEnabled, setOutlabelsEnabled] = useState<boolean>(false);
  const [outlabelsText, setOutlabelsText] = useState<string>("%p");
  const [outlabelsColor, setOutlabelsColor] = useState<string>("#ffffff");
  const [outlabelsBackgroundColor, setOutlabelsBackgroundColor] = useState<string>("#36a2eb");

  // Update config whenever any value changes
  useEffect(() => {
    const config: ChartConfig = {
      title: {
        text: chartTitle,
        color: titleColor,
        display: showTitle,
      },
      subtitle: {
        text: subtitle,
        color: subtitleColor,
        display: showSubtitle,
      },
      legend: {
        display: showLegend,
        position: legendPosition,
        color: legendColor,
        useHtmlLegend: useHtmlLegend,
      },
      tooltip: {
        enabled: tooltipEnabled,
        backgroundColor: tooltipBackgroundColor,
        borderColor: tooltipBorderColor,
        mode: tooltipMode,
        intersect: tooltipIntersect,
        padding: tooltipPadding,
      },
      point: {
        style: pointStyle,
        radius: pointRadius,
        hoverRadius: pointHoverRadius,
        borderWidth: pointBorderWidth,
        backgroundColor: pointBackgroundColor,
        borderColor: pointBorderColor,
      },
      line: {
        style: lineStyle,
        tension: tension,
        borderWidth: borderWidth,
        borderColor: lineBorderColor,
        fill: lineFill,
        segment: {
          enabled: enableLineSegmentStyling,
          borderColor: segmentBorderColor,
          borderWidth: segmentBorderWidth,
        },
      },
      animation: {
        duration: animationDuration,
        type: animationType,
        delay: animationDelay,
      },
      appearance: {
        borderWidth: borderWidth,
        aspectRatio: aspectRatio,
        colorScheme: colorScheme,
        useCustomColors: useCustomColors,
      },
      plugins: {
        zoom: {
          enabled: zoomEnabled,
          mode: zoomMode,
          sensitivity: zoomSensitivity,
        },
        dragData: {
          enabled: dragDataEnabled,
          round: dragDataRound,
        },
        crosshair: {
          enabled: crosshairEnabled,
          color: crosshairColor,
          width: crosshairWidth,
        },
        outlabels: {
          enabled: outlabelsEnabled,
          text: outlabelsText,
          color: outlabelsColor,
          backgroundColor: outlabelsBackgroundColor,
        },
      },
    };
    
    onConfigChange(config);
  }, [
    // Basic settings
    chartTitle, showTitle, titleColor,
    subtitle, showSubtitle, subtitleColor,
    legendPosition, showLegend, legendColor, useHtmlLegend,
    animationDuration, animationType, animationDelay,
    tension, borderWidth, aspectRatio,
    
    // Tooltip settings
    tooltipEnabled, tooltipBackgroundColor, tooltipBorderColor,
    tooltipMode, tooltipIntersect, tooltipPadding,
    
    // Point settings
    pointStyle, pointRadius, pointHoverRadius, pointBorderWidth,
    pointBackgroundColor, pointBorderColor,
    
    // Line settings
    lineStyle, lineBorderColor, lineFill,
    enableLineSegmentStyling, segmentBorderColor, segmentBorderWidth,
    
    // Color scheme
    colorScheme, useCustomColors,
    
    // Plugins
    zoomEnabled, zoomMode, zoomSensitivity,
    dragDataEnabled, dragDataRound,
    crosshairEnabled, crosshairColor, crosshairWidth,
    outlabelsEnabled, outlabelsText, outlabelsColor, outlabelsBackgroundColor,
    
    onConfigChange
  ]);

  // Create the basic settings tab content
  const renderBasicSettings = () => (
    <Space direction="horizontal" align="start" wrap style={{ width: "100%", justifyContent: "space-between" }}>
      {/* Data Selection Group */}
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

      {/* Appearance Group */}
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
          
          <div>
            <Checkbox 
              checked={useCustomColors} 
              onChange={(e) => setUseCustomColors(e.target.checked)}
            >
              Use custom colors
            </Checkbox>
          </div>
        </Space>
      </Card>

      {/* Legend & Title Group */}
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
                  value={legendColor}
                  onChange={(color) => setLegendColor(color.toHexString())}
                />
              </div>
              
              <div>
                <Checkbox 
                  checked={useHtmlLegend} 
                  onChange={(e) => setUseHtmlLegend(e.target.checked)}
                >
                  Use HTML Legend
                </Checkbox>
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
                  value={titleColor}
                  onChange={(color) => setTitleColor(color.toHexString())}
                />
              </div>
            </>
          )}
          
          <div>
            <Text>Show Subtitle</Text>
            <Switch
              checked={showSubtitle}
              onChange={(checked) => setShowSubtitle(checked)}
              style={{ marginLeft: 8 }}
            />
          </div>

          {showSubtitle && (
            <>
              <div>
                <Text>Chart Subtitle</Text>
                <Input
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                />
              </div>
              
              <div>
                <Text>Subtitle Color</Text>
                <ColorPicker
                  value={subtitleColor}
                  onChange={(color) => setSubtitleColor(color.toHexString())}
                />
              </div>
            </>
          )}
        </Space>
      </Card>

      {/* Animation & Layout Group */}
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
        </Space>
      </Card>
    </Space>
  );

  // Create the advanced settings tab content
  const renderAdvancedSettings = () => (
    <Row gutter={[16, 16]}>
      {/* Line & Point Styling */}
      <Col xs={24} md={12}>
        <Card 
          size="small" 
          title={<span className="flex items-center"><i className="mr-2">📊</i> Line & Point Styling</span>}
          className="hover:shadow-md transition-shadow duration-300"
          style={{ 
            borderRadius: "8px", 
            border: "1px solid #c4b5fd",
          }}
          styles={{ header: { background: "#ddd6fe", color: "#5b21b6" }}}
        >
          {selectedChartType === ChartTypeEnum.LINE && (
            <>
              <Title level={5}>Line Settings</Title>
              <Space direction="vertical" style={{ width: "100%" }}>
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
                
                <div>
                  <Text>Line Style</Text>
                  <Select
                    style={{ width: "100%" }}
                    value={lineStyle}
                    onChange={(value) => setLineStyle(value)}
                  >
                    {Object.values(LineStyleEnum).map((style) => (
                      <Option key={style} value={style}>
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </Option>
                    ))}
                  </Select>
                </div>
                
                <div>
                  <Text>Line Color</Text>
                  <ColorPicker
                    value={lineBorderColor}
                    onChange={(color) => setLineBorderColor(color.toHexString())}
                  />
                </div>
                
                <div>
                  <Checkbox 
                    checked={lineFill} 
                    onChange={(e) => setLineFill(e.target.checked)}
                  >
                    Fill under line
                  </Checkbox>
                </div>
                
                <Divider />
                
                <div>
                  <Checkbox 
                    checked={enableLineSegmentStyling} 
                    onChange={(e) => setEnableLineSegmentStyling(e.target.checked)}
                  >
                    Enable segment styling
                  </Checkbox>
                </div>
                
                {enableLineSegmentStyling && (
                  <>
                    <div>
                      <Text>Segment Color</Text>
                      <ColorPicker
                        value={segmentBorderColor}
                        onChange={(color) => setSegmentBorderColor(color.toHexString())}
                      />
                    </div>
                    
                    <div>
                      <Text>Segment Width: {segmentBorderWidth}px</Text>
                      <Slider
                        min={1}
                        max={10}
                        value={segmentBorderWidth}
                        onChange={(value) => setSegmentBorderWidth(value)}
                      />
                    </div>
                  </>
                )}
              </Space>
              
              <Divider />
            </>
          )}
          
          <Title level={5}>Point Settings</Title>
          <Space direction="vertical" style={{ width: "100%" }}>
            <div>
              <Text>Point Style</Text>
              <Select
                style={{ width: "100%" }}
                value={pointStyle}
                onChange={(value) => setPointStyle(value)}
              >
                {Object.values(PointStyleEnum).map((style) => (
                  <Option key={style} value={style}>
                    {style.charAt(0).toUpperCase() + style.slice(1).replace(/([A-Z])/g, " $1").trim()}
                  </Option>
                ))}
              </Select>
            </div>
            
            <div>
              <Text>Point Radius: {pointRadius}px</Text>
              <Slider
                min={1}
                max={10}
                value={pointRadius}
                onChange={(value) => setPointRadius(value)}
              />
            </div>
            
            <div>
              <Text>Hover Radius: {pointHoverRadius}px</Text>
              <Slider
                min={1}
                max={15}
                value={pointHoverRadius}
                onChange={(value) => setPointHoverRadius(value)}
              />
            </div>
            
            <div>
              <Text>Point Border Width: {pointBorderWidth}px</Text>
              <Slider
                min={0}
                max={5}
                value={pointBorderWidth}
                onChange={(value) => setPointBorderWidth(value)}
              />
            </div>
            
            <div>
              <Text>Point Background Color</Text>
              <ColorPicker
                value={pointBackgroundColor}
                onChange={(color) => setPointBackgroundColor(color.toHexString())}
              />
            </div>
            
            <div>
              <Text>Point Border Color</Text>
              <ColorPicker
                value={pointBorderColor}
                onChange={(color) => setPointBorderColor(color.toHexString())}
              />
            </div>
          </Space>
        </Card>
      </Col>
      
      {/* Tooltip Settings */}
      <Col xs={24} md={12}>
        <Card 
          size="small" 
          title={<span className="flex items-center"><i className="mr-2">🔍</i> Tooltip Settings</span>}
          className="hover:shadow-md transition-shadow duration-300"
          style={{ 
            borderRadius: "8px", 
            border: "1px solid #c4b5fd",
          }}
          styles={{ header: { background: "#ddd6fe", color: "#5b21b6" }}}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <div>
              <Text>Enable Tooltips</Text>
              <Switch
                checked={tooltipEnabled}
                onChange={(checked) => setTooltipEnabled(checked)}
                style={{ marginLeft: 8 }}
              />
            </div>
            
            {tooltipEnabled && (
              <>
                <div>
                  <Text>Tooltip Mode</Text>
                  <Select
                    style={{ width: "100%" }}
                    value={tooltipMode}
                    onChange={(value) => setTooltipMode(value)}
                  >
                    {Object.values(TooltipModeEnum).map((mode) => (
                      <Option key={mode} value={mode}>
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </Option>
                    ))}
                  </Select>
                </div>
                
                <div>
                  <Checkbox 
                    checked={tooltipIntersect} 
                    onChange={(e) => setTooltipIntersect(e.target.checked)}
                  >
                    Require intersection
                  </Checkbox>
                </div>
                
                <div>
                  <Text>Tooltip Padding: {tooltipPadding}px</Text>
                  <Slider
                    min={0}
                    max={20}
                    value={tooltipPadding}
                    onChange={(value) => setTooltipPadding(value)}
                  />
                </div>
                
                <div>
                  <Text>Background Color</Text>
                  <ColorPicker
                    value={tooltipBackgroundColor}
                    onChange={(color) => setTooltipBackgroundColor(color.toHexString())}
                  />
                </div>
                
                <div>
                  <Text>Border Color</Text>
                  <ColorPicker
                    value={tooltipBorderColor}
                    onChange={(color) => setTooltipBorderColor(color.toHexString())}
                  />
                </div>
              </>
            )}
          </Space>
        </Card>
      </Col>
      
      {/* Plugin Settings */}
      <Col xs={24}>
        <Card 
          size="small" 
          title={<span className="flex items-center"><i className="mr-2">🔌</i> Plugin Settings</span>}
          className="hover:shadow-md transition-shadow duration-300"
          style={{ 
            borderRadius: "8px", 
            border: "1px solid #c4b5fd",
          }}
          styles={{ header: { background: "#ddd6fe", color: "#5b21b6" }}}
        >
          <Row gutter={[16, 16]}>
            {/* Zoom Plugin */}
            <Col xs={24} md={8}>
              <Title level={5}>Zoom</Title>
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <Text>Enable Zoom</Text>
                  <Switch
                    checked={zoomEnabled}
                    onChange={(checked) => setZoomEnabled(checked)}
                    style={{ marginLeft: 8 }}
                  />
                </div>
                
                {zoomEnabled && (
                  <>
                    <div>
                      <Text>Zoom Mode</Text>
                      <Select
                        style={{ width: "100%" }}
                        value={zoomMode}
                        onChange={(value) => setZoomMode(value)}
                      >
                        <Option value="xy">Both Axes (xy)</Option>
                        <Option value="x">X Axis Only</Option>
                        <Option value="y">Y Axis Only</Option>
                      </Select>
                    </div>
                    
                    <div>
                      <Text>Sensitivity: {zoomSensitivity}</Text>
                      <Slider
                        min={1}
                        max={10}
                        value={zoomSensitivity}
                        onChange={(value) => setZoomSensitivity(value)}
                      />
                    </div>
                  </>
                )}
              </Space>
            </Col>
            
            {/* Drag Data Plugin */}
            <Col xs={24} md={8}>
              <Title level={5}>Drag Data</Title>
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <Text>Enable Drag Data</Text>
                  <Switch
                    checked={dragDataEnabled}
                    onChange={(checked) => setDragDataEnabled(checked)}
                    style={{ marginLeft: 8 }}
                  />
                </div>
                
                {dragDataEnabled && (
                  <div>
                    <Text>Round to Decimal: {dragDataRound}</Text>
                    <InputNumber
                      min={0}
                      max={5}
                      value={dragDataRound}
                      onChange={(value) => setDragDataRound(value as number)}
                      style={{ width: "100%" }}
                    />
                  </div>
                )}
              </Space>
            </Col>
            
            {/* Crosshair Plugin */}
            <Col xs={24} md={8}>
              <Title level={5}>Crosshair</Title>
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <Text>Enable Crosshair</Text>
                  <Switch
                    checked={crosshairEnabled}
                    onChange={(checked) => setCrosshairEnabled(checked)}
                    style={{ marginLeft: 8 }}
                  />
                </div>
                
                {crosshairEnabled && (
                  <>
                    <div>
                      <Text>Crosshair Color</Text>
                      <ColorPicker
                        value={crosshairColor}
                        onChange={(color) => setCrosshairColor(color.toHexString())}
                      />
                    </div>
                    
                    <div>
                      <Text>Line Width: {crosshairWidth}px</Text>
                      <Slider
                        min={1}
                        max={5}
                        value={crosshairWidth}
                        onChange={(value) => setCrosshairWidth(value)}
                      />
                    </div>
                  </>
                )}
              </Space>
            </Col>
            
            {/* Outlabels Plugin (for Pie/Doughnut) */}
            {(selectedChartType === ChartTypeEnum.PIE || selectedChartType === ChartTypeEnum.DOUGHNUT) && (
              <Col xs={24} md={8}>
                <Title level={5}>Outlabels</Title>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div>
                    <Text>Enable Outlabels</Text>
                    <Switch
                      checked={outlabelsEnabled}
                      onChange={(checked) => setOutlabelsEnabled(checked)}
                      style={{ marginLeft: 8 }}
                    />
                  </div>
                  
                  {outlabelsEnabled && (
                    <>
                      <div>
                        <Text>Label Text</Text>
                        <Select
                          style={{ width: "100%" }}
                          value={outlabelsText}
                          onChange={(value) => setOutlabelsText(value)}
                        >
                          <Option value="%l">Label</Option>
                          <Option value="%p">Percentage</Option>
                          <Option value="%v">Value</Option>
                          <Option value="%l: %p">Label: Percentage</Option>
                          <Option value="%l: %v">Label: Value</Option>
                        </Select>
                      </div>
                      
                      <div>
                        <Text>Text Color</Text>
                        <ColorPicker
                          value={outlabelsColor}
                          onChange={(color) => setOutlabelsColor(color.toHexString())}
                        />
                      </div>
                      
                      <div>
                        <Text>Background Color</Text>
                        <ColorPicker
                          value={outlabelsBackgroundColor}
                          onChange={(color) => setOutlabelsBackgroundColor(color.toHexString())}
                        />
                      </div>
                    </>
                  )}
                </Space>
              </Col>
            )}
          </Row>
        </Card>
      </Col>
    </Row>
  );

  const tabsItems: TabsProps["items"] = [
    { key: "1", label: "Basic Settings", children: renderBasicSettings() },
    { key: "2", label: "Advanced Settings", children: renderAdvancedSettings() },
  ];

  return (
    <Tabs defaultActiveKey="1" className="w-full" items={tabsItems} />
  );
};

export default ChartControls;
