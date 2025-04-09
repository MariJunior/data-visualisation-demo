import { JsonPathInfo } from "@/app/components/DataUploader/types";
import { Button, Input, Space } from "antd";
import { FC } from "react";
import { JsonPathSelector } from "./JsonPathSelector";

const { TextArea } = Input;

interface JsonTextTabProps {
  jsonText: string;
  setJsonText: (text: string) => void;
  loading: boolean;
  onSubmit: () => void;
  jsonPathsInfo: JsonPathInfo[];
  selectedJsonPaths: string[];
  setSelectedJsonPaths: (paths: string[]) => void;
  onApplyPaths: () => void;
  showPathSelector: boolean;
}

/**
 * Компонент вкладки для ввода JSON в текстовом виде
 */
export const JsonTextTab: FC<JsonTextTabProps> = ({
  jsonText,
  setJsonText,
  loading,
  onSubmit,
  jsonPathsInfo,
  selectedJsonPaths,
  setSelectedJsonPaths,
  onApplyPaths,
  showPathSelector
}) => {
  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <TextArea
        rows={8}
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        placeholder={`Enter JSON in format:
          {
            "labels": ["January", "February", "March"],
            "datasets": [
              {
                "label": "Sales",
                "data": [12, 19, 3]
              }
            ]
          }`
        }
      />
      <Button 
        type="primary" 
        onClick={onSubmit}
        disabled={!jsonText.trim()}
        loading={loading}
      >
        Load JSON
      </Button>

      {showPathSelector && jsonPathsInfo.length > 0 && (
        <JsonPathSelector
          jsonPathsInfo={jsonPathsInfo}
          selectedJsonPaths={selectedJsonPaths}
          setSelectedJsonPaths={setSelectedJsonPaths}
          onApply={onApplyPaths}
        />
      )}
    </Space>
  );
};
