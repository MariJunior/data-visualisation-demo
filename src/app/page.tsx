"use client";

import { Select, Slider, Typography } from "antd";
import dynamic from "next/dynamic";
import { useState } from "react";
import { ChartDataType } from "./types/chart";

const { Title } = Typography;

// Динамический импорт компонентов для отключения SSR
const ChartJSComponent = dynamic(() => import("./components/ChartJSComponent"), { ssr: false });
const DataUploader = dynamic(() => import("./components/DataUploader"), { ssr: false });
// const NivoComponent = dynamic(() => import("./components/NivoComponent"), { ssr: false });
// const PlotlyComponent = dynamic(() => import("./components/PlotlyComponent"), { ssr: false });

// Обновленный список доступных шрифтов, соответствующий загруженным в layout.tsx
const fontOptions = [
  { value: "var(--font-geist-sans), sans-serif", label: "Geist Sans" },
  { value: "var(--font-geist-mono), monospace", label: "Geist Mono" },
  { value: "var(--font-inter), sans-serif", label: "Inter" },
  { value: "var(--font-roboto), sans-serif", label: "Roboto" },
  { value: "var(--font-roboto-mono), monospace", label: "Roboto Mono" },
  { value: "var(--font-lato), sans-serif", label: "Lato" },
  { value: "var(--font-montserrat), sans-serif", label: "Montserrat" },
  { value: "var(--font-fira-code), monospace", label: "Fira Code" },
  { value: "var(--font-jet-brains-mono), monospace", label: "JetBrains Mono" },
  // Можно добавить и стандартные шрифты
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Helvetica, sans-serif", label: "Helvetica" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Times New Roman, serif", label: "Times New Roman" },
];

export default function Home() {
  const [library, setLibrary] = useState("chartjs");
  const [fontSize, setFontSize] = useState(14);
  const [fontFamilyVariable, setFontFamilyVariable] = useState("var(--font-jet-brains-mono), monospace");
  const [fontFamilyName, setFontFamilyName] = useState("JetBrains Mono");
  const [customData, setCustomData] = useState<ChartDataType | null>(null);

  const handleDataLoaded = (data: ChartDataType) => {
    setCustomData(data);
  };

  return (
    <div className="p-6 max-w-10xl mx-auto">
      <Title 
        level={1} 
        className="text-center mb-6"
        style={{ fontFamily: fontFamilyVariable }}
      >
        Data Visualization Demo
      </Title>
      
      <div className="mb-8 flex flex-wrap gap-4 items-center">
        <div>
          <label className="block mb-2">Select Library:</label>
          <Select 
            value={library} 
            onChange={setLibrary}
            style={{ width: 200 }}
          >
            <Select.Option value="chartjs">Chart.js</Select.Option>
            <Select.Option value="nivo" disabled>Nivo</Select.Option>
            <Select.Option value="plotly" disabled>Plotly.js</Select.Option>
          </Select>
        </div>
        
        <div>
          <label className="block mb-2">Font Family:</label>
          <Select
            value={fontFamilyVariable} 
            onChange={(value) => {
              setFontFamilyVariable(value);
              setFontFamilyName(fontOptions.find(font => font.value === value)?.label || "Unknown");
            }}
            style={{ width: 200 }}
          >
            {fontOptions.map(font => (
              <Select.Option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                {font.label}
              </Select.Option>
            ))}
          </Select>
        </div>
        
        <div className="flex-1 max-w-md">
          <label className="block mb-2">Base Font Size: {fontSize}px</label>
          <Slider 
            min={10} 
            max={30} 
            value={fontSize} 
            onChange={setFontSize}
          />
        </div>
      </div>

      {/* Двухколоночная разметка */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Левая колонка - DataUploader */}
        <div className="md:w-1/3 lg:w-1/4">
          <DataUploader onDataLoaded={handleDataLoaded} />
        </div>
        
        {/* Правая колонка - Контейнер с графиками */}
        <div className="md:w-2/3 lg:w-3/4">
          {library === "chartjs" && (
            <ChartJSComponent 
              fontSize={fontSize} 
              fontFamily={fontFamilyName} 
              customData={customData}
            />
          )}
          {/* {library === "nivo" && <NivoComponent fontSize={fontSize} />}
          {library === "plotly" && <PlotlyComponent fontSize={fontSize} />} */}
        </div>
      </div>
    </div>
  );
}
