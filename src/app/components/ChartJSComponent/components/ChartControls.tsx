import { Tabs, TabsProps } from "antd";
import { FC } from "react";
import ChartControlsAdvanced, { ChartControlsAdvancedProps } from "./ChartControlsAdvanced";
import ChartControlsBasic, { ChartControlsBasicProps } from "./ChartControlsBasics";

export type ChartControlsProps = {
  basics: ChartControlsBasicProps;
  advanced?: ChartControlsAdvancedProps;
};

export const ChartControls: FC<ChartControlsProps> = ({ basics, advanced }) => {
  const tabItems: TabsProps["items"] = [
    { 
      key: "basics", 
      label: "Basic Settings", 
      children: (
        <ChartControlsBasic
          {...basics}
        /> 
      )
    },
  ]

  if (advanced) {
    tabItems.push({ 
      key: "advanced", 
      label: "Advanced Settings", 
      children: (
        <ChartControlsAdvanced
          {...advanced}
        /> 
      )
    })
  }

  return (
    <Tabs defaultActiveKey="basics" className="w-full" items={tabItems} />
  )
};

export default ChartControls;
