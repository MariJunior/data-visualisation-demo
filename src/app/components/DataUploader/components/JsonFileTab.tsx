import { BeforeUploadResult, JsonPathInfo, UploadedFileInfo } from "@/app/components/DataUploader/types";
import { UploadOutlined } from "@ant-design/icons";
import { Button, Upload } from "antd";
import { RcFile } from "antd/es/upload";
import { FC } from "react";
import { FileInfoDisplay } from "./FileInfoDisplay";
import { JsonPathSelector } from "./JsonPathSelector";

interface JsonFileTabProps {
  onFileUpload: (file: RcFile) => BeforeUploadResult;
  loading: boolean;
  uploadedFile: UploadedFileInfo | null;
  jsonPathsInfo: JsonPathInfo[];
  selectedJsonPaths: string[];
  setSelectedJsonPaths: (paths: string[]) => void;
  onApplyPaths: () => void;
  onReset: () => void;
  showPathSelector: boolean;
}

/**
 * Компонент вкладки для загрузки JSON файла
 */
export const JsonFileTab: FC<JsonFileTabProps> = ({
  onFileUpload,
  loading,
  uploadedFile,
  jsonPathsInfo,
  selectedJsonPaths,
  setSelectedJsonPaths,
  onApplyPaths,
  onReset,
  showPathSelector
}) => {
  return (
    <>
      <Upload.Dragger
        name="file"
        accept=".json"
        beforeUpload={onFileUpload}
        showUploadList={false}
        disabled={loading || !!uploadedFile}
      >
        <p className="ant-upload-drag-icon">
          <UploadOutlined />
        </p>
        <p className="ant-upload-text">Click or drag JSON file</p>
        <p className="ant-upload-hint">
          Only JSON format files are supported
        </p>
      </Upload.Dragger>
      {uploadedFile && (
        <>
          <FileInfoDisplay uploadedFile={uploadedFile} />

          {showPathSelector && jsonPathsInfo.length > 0 && (
            <JsonPathSelector
              jsonPathsInfo={jsonPathsInfo}
              selectedJsonPaths={selectedJsonPaths}
              setSelectedJsonPaths={setSelectedJsonPaths}
              onApply={onApplyPaths}
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
