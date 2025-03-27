import { Tabs, TabsProps } from "antd";
import { FC } from "react";
import ChartControlsBasic, { ChartControlsBasicProps } from "./ChartControlsBasics";

export type ChartControlsProps = {
  basics: ChartControlsBasicProps;
};

export const ChartControls: FC<ChartControlsProps> = ({ basics }) => {
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

  return (
    <Tabs defaultActiveKey="basics" className="w-full" items={tabItems} />
  )
};

export default ChartControls;
