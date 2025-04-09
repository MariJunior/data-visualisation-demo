import { ExcelSheetSelectorProps } from "@/app/components/DataUploader/types";
import { Button, Select } from "antd";
import { FC } from "react";

const { Option } = Select;

/**
 * Компонент для выбора листа и колонок в Excel/CSV файле
 */
export const ExcelSheetSelector: FC<ExcelSheetSelectorProps> = ({
  availableSheets,
  selectedSheet,
  onSheetChange,
  availableColumns,
  selectedColumns,
  setSelectedColumns,
  onApply
}) => {
  return (
    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
      <h4 className="font-medium text-blue-700 dark:text-blue-300">Data configuration:</h4>
      
      <div className="mt-2">
        <div className="mb-2">Select sheet:</div>
        <Select
          style={{ width: '100%' }}
          value={selectedSheet}
          onChange={onSheetChange}
          className="mb-3"
        >
          {availableSheets.map(sheet => (
            <Option key={sheet} value={sheet}>{sheet}</Option>
          ))}
        </Select>
        
        <div className="mb-2">Select columns to display:</div>
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          value={selectedColumns}
          onChange={setSelectedColumns}
          className="mb-3"
          placeholder="Select at least 2 columns"
        >
          {availableColumns.map(col => (
            <Option key={col} value={col}>{col}</Option>
          ))}
        </Select>
        
        <Button 
          type="primary" 
          onClick={onApply}
          disabled={selectedColumns.length < 2}
        >
          Apply selection
        </Button>
      </div>
    </div>
  );
};
