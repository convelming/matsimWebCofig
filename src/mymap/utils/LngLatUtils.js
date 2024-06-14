import proj4 from 'proj4'
proj4.defs("EPSG:4526", "+proj=tmerc +lat_0=0 +lon_0=114 +k=1 +x_0=38500000 +y_0=0 +ellps=GRS80 +units=m +no_defs");


export const EARTH_RADIUS = 20037508.3427892;

/**
 * EPSG:4526转Web墨卡托
 * @param {*} lng 
 * @param {*} lat 
 * @returns 
 */
export function EPSG4526ToMercator(lng, lat) {
  return proj4("EPSG:4526", "EPSG:3857", [lng, lat]);
}


/**
 * EPSG:4526转WGS84
 * @param {*} lng 
 * @param {*} lat 
 * @returns 
 */
export function EPSG4526ToWGS84(lng, lat) {
  return proj4("EPSG:4526", "EPSG:4326", [lng, lat]);
}

/**
 * WGS84转EPSG:4526
 * @param {*} lng 
 * @param {*} lat 
 * @returns 
 */
export function WGS84ToEPSG4526(lng, lat) {
  return proj4("EPSG:4326", "EPSG:4526", [lng, lat]);
}

/**
 * Web墨卡托转WGS84
 * @param {*} lng 
 * @param {*} lat 
 * @returns 
 */
export function MercatorToWGS84(lng, lat) {
  return proj4("EPSG:3857", "EPSG:4326", [lng, lat]);
}

/**
 * WGS84转Web墨卡托
 * @param {*} lng 
 * @param {*} lat 
 * @returns 
 */
export function WGS84ToMercator(lng, lat) {
  return proj4("EPSG:4326", "EPSG:3857", [lng, lat]);
}

/**
 * WGS84转画布坐标
 * @param {*} x 
 * @param {*} y 
 * @returns 
 */
export function WGS84ToCanvasXY(lon, lat, zoom) {
  return [lon, lat, zoom];
}