import { JsonPathSelectorProps } from "@/app/components/DataUploader/types";
import { Button, Divider, Select, Tag } from "antd";
import { FC } from "react";

const { Option } = Select;

/**
 * Компонент для выбора путей в JSON данных
 */
export const JsonPathSelector: FC<JsonPathSelectorProps> = ({
  jsonPathsInfo,
  selectedJsonPaths,
  setSelectedJsonPaths,
  onApply
}) => {
  return (
    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
      <h4 className="font-medium text-blue-700 dark:text-blue-300">Data configuration:</h4>
      
      <div className="mt-2">
        <Divider orientation="left">Select properties to display</Divider>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          The first selected property will be used as X-axis labels, the rest as data sets.
          <br/>
          <span className="font-medium">Tip:</span> Choose properties that exist in all objects (marked as „Common“).
        </p>
        
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          value={selectedJsonPaths}
          onChange={setSelectedJsonPaths}
          className="mb-3"
          placeholder="Select at least 2 properties"
          optionFilterProp="children"
          optionLabelProp="label"
        >
          {jsonPathsInfo.map(info => (
            <Option 
              key={info.path} 
              value={info.path}
              label={info.path}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{info.path}</span>
                <span className="text-xs">
                  {info.commonAcrossAll ? 
                    <Tag color="green">Common</Tag> : 
                    <Tag color="orange">Partial</Tag>
                  }
                  {info.isArray && <Tag color="blue">Array</Tag>}
                  {info.isNumeric && <Tag color="purple">Number</Tag>}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Example: {info.sampleValue}
              </div>
            </Option>
          ))}
        </Select>
        
        <Button 
          type="primary" 
          onClick={onApply}
          disabled={selectedJsonPaths.length < 2}
        >
          Apply selection
        </Button>
      </div>
    </div>
  );
};
