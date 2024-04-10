// 单个站点时的菜单项
export const one_stop_menu = [
  { label: "Copy Id", value: "Copy Id" },
  { label: "Copy Name", value: "Copy Name" },
  { label: "Copy Link Id", value: "Copy Link Id" },
  { label: "Transit Stop Details", value: "Transit Stop Details" },
  { label: "Stop Load...", value: "Stop Load..." },
  { label: "Transfers At Stop...", value: "Transfers At Stop..." },
  { label: "Passengers At Stop", value: "Passengers At Stop" },
];

// 多个站点时的菜单项
export const many_stop_menu = [
  { label: "Copy Name", value: "Copy Name" },
  { label: "Copy Link Id", value: "Copy Link Id" },
  { label: "Transit Stop Details", value: "Transit Stop Details" },
  { label: "Stop Load...", value: "Stop Load..." },
  { label: "Transfers At Stop...", value: "Transfers At Stop..." },
];

// 多个站点时的菜单项
export const route_menu = [
  { label: "Copy Id", value: "Copy Id" },
  { label: "Copy Transit Line Id", value: "Copy Transit Line Id" },
  { label: "Show Route Details", value: "Show Route Details" },
  { label: "Transit Route Analysis...", value: "Transit Route Analysis..." },
  { label: "List Departures", value: "List Departures" },
  {
    label: "Create Passengers Agent Group...",
    value: "Create Passengers Agent Group...",
  },
];

export const group_attribute = [
  { label: "Transit Line Id", value: 1 },
  { label: "Transit Route Id", value: 2 },
  { label: "Line and Route Id", value: 3 },
  { label: "Route: Route Origin", value: 4 },
  { label: "Route: Route Destination", value: 5 },
];

export const route_info_analysis = [
  {
    label: "Passengers Entering / Leaving",
    value: "Passengers Entering / Leaving",
  },
  { label: "Vehicle Load", value: "Vehicle Load" },
  { label: "Aggregated Vehicle Load", value: "Aggregated Vehicle Load" },
  { label: "Route Grid", value: "Route Grid" },
  { label: "Route Flows", value: "Route Flows" },
  { label: "Route-Time Diagram", value: "Route-Time Diagram" },
];
