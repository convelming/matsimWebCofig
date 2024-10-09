// 单个站点时的菜单项
export const one_stop_menu = [
  // { label: "Copy Id", cn_label: "复制编号", value: "Copy Id" },
  // { label: "Copy Name", cn_label: "复制名称", value: "Copy Name" },
  // { label: "Copy Link Id", cn_label: "复制路线编号", value: "Copy Link Id" },
  { label: "Transit Stop Details", cn_label: "站点详情", value: "Transit Stop Details" },
  { label: "Stop Load...", cn_label: "站点上下车客流", value: "Stop Load..." },
  { label: "Transfers At Stop...", cn_label: "站点换乘客流", value: "Transfers At Stop..." },
  { label: "Passengers At Stop", cn_label: "上下车详细信息", value: "Passengers At Stop" },
];

// 多个站点时的菜单项
export const many_stop_menu = [
  { label: "Copy Name", cn_label: "复制名称", value: "Copy Name" },
  { label: "Copy Link Id", cn_label: "复制路线编号", value: "Copy Link Id" },
  { label: "Transit Stop Details", cn_label: "中转站详情", value: "Transit Stop Details" },
  { label: "Stop Load...", cn_label: "站点上下车客流...", value: "Stop Load..." },
  { label: "Transfers At Stop...", cn_label: "中转站...", value: "Transfers At Stop..." },
];

// 多个站点时的菜单项
export const route_menu = [
  // { label: "Copy Id", cn_label: "复制编号", value: "Copy Id" },
  // { label: "Copy Transit Line Id", cn_label: "复制公交线路编号", value: "Copy Transit Line Id" },
  { label: "Show Route Details", cn_label: "线路详情", value: "Show Route Details" },
  { label: "Transit Route Analysis...", cn_label: "线路分析", value: "Transit Route Analysis..." },
  // { label: "List Departures", cn_label: "出发名单", value: "List Departures" },
  // { label: "Create Passengers Agent Group...", cn_label: "创建乘客代理组...", value: "Create Passengers Agent Group..." },
];

export const group_attribute = [
  { label: "Transit Line Id", cn_label: "公交线路Id", value: 1 },
  { label: "Transit Route Id", cn_label: "公交路线Id", value: 2 },
  { label: "Line and Route Id", cn_label: "线路和路线Id", value: 3 },
  { label: "Route: Route Origin", cn_label: "路线：路线起点", value: 4 },
  { label: "Route: Route Destination", cn_label: "路线：路线目的地", value: 5 },
];

export const route_info_analysis = [
  { label: "Passengers Entering / Leaving", cn_label: "上下车客流", value: "Passengers Entering / Leaving" },
  { label: "Vehicle Load", cn_label: "载客量", value: "Vehicle Load" },
  { label: "Aggregated Vehicle Load", cn_label: "总载客量", value: "Aggregated Vehicle Load" },
  { label: "Route Grid", cn_label: "上下车站点热力图", value: "Route Grid" },
  { label: "Route Flows", cn_label: "站点OD客流量", value: "Route Flows" },
  { label: "Route-Time Diagram", cn_label: "发车时刻表", value: "Route-Time Diagram" },
];
