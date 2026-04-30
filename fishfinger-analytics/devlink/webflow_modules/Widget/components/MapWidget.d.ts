import React from "react";
declare global {
  interface Window {
    google: {
      maps: any;
    };
  }
}
type MapWidgetProps = {
  className?: string;
  apiKey?: string;
  zoom?: number;
  latlng?: string;
  mapStyle?: "roadmap" | "satellite" | "hybrid" | "terrain";
  tooltip?: string;
  title?: string;
  enableScroll?: boolean;
  enableTouch?: boolean;
};
export type { MapWidgetProps };
declare const MapWidget: React.ForwardRefExoticComponent<
  MapWidgetProps & React.RefAttributes<HTMLDivElement>
>;
export default MapWidget;
