// 地图样式配置
// 以列表的第一个为默认样式
// {
//   style_name: "",
//   background: 0xd9ecff,
//   max_zoom: 18,
//   min_zoom: 0,
//   x_offset: 0,
//   y_offset: 0,
//   get_url: function (zoom, row, col) {
//     return `http://192.168.60.231:23334/osm/MapTilerBasic/${zoom}/${row}/${col}.png`;
//   }
// }

MAP_LAYER_STYLE = [
  {
    style_name: "POSITRON",
    get_url: function (zoom, row, col) {
      return `http://192.168.60.231:23334/osm/Positron/${zoom}/${row}/${col}.png`;
    }
  },
  {
    style_name: "OSM_LIDERTY",
    get_url: function (zoom, row, col) {
      return `http://192.168.60.231:23334/osm/OSMLiberty/${zoom}/${row}/${col}.png`;
    }
  },
  {
    style_name: "MAP_TILER_BASIC",
    get_url: function (zoom, row, col) {
      return `http://192.168.60.231:23334/osm/MapTilerBasic/${zoom}/${row}/${col}.png`;
    }
  },
  {
    style_name: "DARK_MATTER",
    background: `#0a4173`,
    get_url: function (zoom, row, col) {
      return `http://192.168.60.231:23334/osm/DarkMatter/${zoom}/${row}/${col}.png`;
    }
  },
  {
    style_name: "OSM_BROGHT",
    get_url: function (zoom, row, col) {
      return `http://192.168.60.231:23334/osm/OSMBroght/${zoom}/${row}/${col}.png`;
    }
  },
  {
    style_name: "LIBERTY",
    get_url: function (zoom, row, col) {
      return `http://192.168.60.231:23334/osm/liberty/${zoom}/${row}/${col}.png`;
    }
  },
  {
    style_name: "MAPBOX",
    get_url: function (zoom, row, col) {
      return `https://api.mapbox.com/styles/v1/convel/ck8frzi262yko1invkvbif5aw/tiles/512/${zoom}/${row}/${col}@2x?access_token=pk.eyJ1IjoiY29udmVsIiwiYSI6ImNsaHB4cXA2MDBicGIzam1zb25zdGtiOHAifQ.UuaTujcOQlxywCJWWZ0SSg`
    }
  },
  {
    style_name: "极夜蓝",
    background: `#0a4173`,
    get_url: function (zoom, row, col) {
      return `https://api.mapbox.com/styles/v1/dasin/cltigm5bp010s01ptciblgffl/tiles/512/${zoom}/${row}/${col}@2x?access_token=pk.eyJ1IjoiY29udmVsIiwiYSI6ImNsaHB4cXA2MDBicGIzam1zb25zdGtiOHAifQ.UuaTujcOQlxywCJWWZ0SSg`
    }
  },
  {
    style_name: "卫星图",
    get_url: function (zoom, row, col) {
      return `http://192.168.60.231:23334/baidu/satellite/${zoom}/${row}/${col}.jpg`
    }
  },
]

// geojson地图坐标系转换配置
proj4Config = function (proj4) {
  proj4.defs("EPSG:4526", "+proj=tmerc +lat_0=0 +lon_0=114 +k=1 +x_0=38500000 +y_0=0 +ellps=GRS80 +units=m +no_defs");
  proj4.defs("urn:ogc:def:crs:OGC:1.3:CRS84", proj4.defs("EPSG:4326"));
}