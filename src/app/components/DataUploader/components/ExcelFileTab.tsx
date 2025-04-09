import { BeforeUploadResult, UploadedFileInfo } from "@/app/components/DataUploader/types";
import { FileExcelOutlined } from "@ant-design/icons";
import { Button } from "antd";
import Upload, { RcFile } from "antd/es/upload";
import { FC } from "react";
import { ExcelSheetSelector } from "./ExcelSheetSelector";
import { FileInfoDisplay } from "./FileInfoDisplay";


interface ExcelFileTabProps {
  onFileUpload: (file: RcFile) => BeforeUploadResult;
  loading: boolean;
  uploadedFile: UploadedFileInfo | null;
  availableSheets: string[];
  selectedSheet: string;
  onSheetChange: (sheet: string) => void;
  availableColumns: string[];
  selectedColumns: string[];
  setSelectedColumns: (columns: string[]) => void;
  onApplyColumns: () => void;
  onReset: () => void;
  showSheetSelector: boolean;
}

/**
 * Компонент вкладки для загрузки Excel/CSV файла
 */
export const ExcelFileTab: FC<ExcelFileTabProps> = ({
  onFileUpload,
  loading,
  uploadedFile,
  availableSheets,
  selectedSheet,
  onSheetChange,
  availableColumns,
  selectedColumns,
  setSelectedColumns,
  onApplyColumns,
  onReset,
  showSheetSelector
}) => {
  return (
    <>
      <Upload.Dragger
        name="file"
        accept=".xlsx,.xls,.csv"
        beforeUpload={onFileUpload}
        showUploadList={false}
        disabled={loading || !!uploadedFile}
      >
        <p className="ant-upload-drag-icon">
          <FileExcelOutlined />
        </p>
        <p className="ant-upload-text">Click or drag Excel or CSV file</p>
        <p className="ant-upload-hint">
          First row should contain headers, first column - data labels
        </p>
      </Upload.Dragger>
      {uploadedFile && (
        <>
          <FileInfoDisplay uploadedFile={uploadedFile} />

          {showSheetSelector && (
            <ExcelSheetSelector
              availableSheets={availableSheets}
              selectedSheet={selectedSheet}
              onSheetChange={onSheetChange}
              availableColumns={availableColumns}
              selectedColumns={selectedColumns}
              setSelectedColumns={setSelectedColumns}
              onApply={onApplyColumns}
            />
          )}

          <Button type="default" onClick={onReset} className="mt-2">
            Reset data
          </Button>
        </>
      )}
    </>
  );
};
