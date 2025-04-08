import { SettingOutlined, ZoomInOutlined } from "@ant-design/icons";
import { Card, Checkbox, Divider, Form, InputNumber, Select, Space, Typography } from "antd";
import { FC } from "react";

const { Title } = Typography;
const { Option } = Select;

export interface ChartControlsAdvancedProps {
  enableZoom: boolean;
  setEnableZoom: (enable: boolean) => void;
  zoomMode: 'xy' | 'x' | 'y';
  setZoomMode: (mode: 'xy' | 'x' | 'y') => void;
  enablePan: boolean;
  setEnablePan: (enable: boolean) => void;
  zoomSpeed: number;
  setZoomSpeed: (speed: number) => void;
}

const ChartControlsAdvanced: FC<ChartControlsAdvancedProps> = ({
  enableZoom,
  setEnableZoom,
  zoomMode,
  setZoomMode,
  enablePan,
  setEnablePan,
  zoomSpeed,
  setZoomSpeed
}) => {
  return (
    <Card className="shadow-sm">
      <Title level={4} className="flex items-center">
        <SettingOutlined className="mr-2" /> Advanced Settings
      </Title>
      
      <Divider />
      
      <Form layout="vertical">
        <Title level={5} className="flex items-center mt-4">
          <ZoomInOutlined className="mr-2" /> Zoom Settings
        </Title>
        
        <Form.Item label="Enable Zoom">
          <Checkbox checked={enableZoom} onChange={(e) => setEnableZoom(e.target.checked)}>
            Allow zooming on chart
          </Checkbox>
        </Form.Item>
        
        {enableZoom && (
          <Space direction="vertical" className="w-full">
            <Form.Item label="Zoom Mode">
              <Select value={zoomMode} onChange={setZoomMode} style={{ width: '100%' }}>
                <Option value="xy">Both Axes (xy)</Option>
                <Option value="x">X Axis Only</Option>
                <Option value="y">Y Axis Only</Option>
              </Select>
            </Form.Item>
            
            <Form.Item label="Zoom Speed">
              <InputNumber 
                min={0.1} 
                max={2} 
                step={0.1} 
                value={zoomSpeed} 
                onChange={(val) => setZoomSpeed(Number(val))} 
                style={{ width: '100%' }}
              />
            </Form.Item>
            
            <Form.Item label="Enable Panning">
              <Checkbox checked={enablePan} onChange={(e) => setEnablePan(e.target.checked)}>
                Allow panning when zoomed
              </Checkbox>
            </Form.Item>
          </Space>
        )}
      </Form>
    </Card>
  );
};

export default ChartControlsAdvanced;
