// geojson地图坐标系转换配置
proj4Config = function (proj4) {
  proj4.defs("EPSG:4526", "+proj=tmerc +lat_0=0 +lon_0=114 +k=1 +x_0=38500000 +y_0=0 +ellps=GRS80 +units=m +no_defs");
  proj4.defs("urn:ogc:def:crs:OGC:1.3:CRS84", proj4.defs("EPSG:4326"));
};
