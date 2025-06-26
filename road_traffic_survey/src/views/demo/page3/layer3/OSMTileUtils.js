// import proj4 from "proj4";
import { TileLnglatTransformOSM as TileLnglatTrans } from "./tile-lnglat-transform";
/**
 * Web墨卡托转WGS84
 * @param {*} lng
 * @param {*} lat
 * @returns
 */
function MercatorToWGS84(lng, lat) {
  return proj4("EPSG:3857", "EPSG:4326", [Number(lng), Number(lat)]).map((v) => Number(Number(v).toFixed(6)));
}

/**
 * WGS84转Web墨卡托
 * @param {*} lng
 * @param {*} lat
 * @returns
 */
function WGS84ToMercator(lng, lat) {
  return proj4("EPSG:4326", "EPSG:3857", [Number(lng), Number(lat)]).map((v) => Number(Number(v).toFixed(2)));
}

class TileUtils {
  static getTileSize(zoom) {
    const width = Math.abs(TileUtils.rowToX(1, zoom) - TileUtils.rowToX(0, zoom));
    const height = Math.abs(TileUtils.colToY(1, zoom) - TileUtils.colToY(0, zoom));
    return [width + 1, height + 1];
  }

  static xToRow(x, zoom) {
    const [lng, lat] = MercatorToWGS84(x, 0);
    const { tileX, tileY } = TileLnglatTrans.lnglatToTile(lng, lat, zoom);
    return tileX;
  }

  static rowToX(row = 0, zoom = 1) {
    const { lng, lat } = TileLnglatTrans.pixelToLnglat(0, 0, row, 0, zoom);
    const [x, y] = WGS84ToMercator(lng, lat);
    return Math.floor(x);
  }

  static rowToDrawX(row = 0, zoom = 1, offset = [0, 0]) {
    return TileUtils.rowToX(row + offset[0], zoom);
  }

  static yToCol(y, zoom) {
    const [lng, lat] = MercatorToWGS84(0, y);
    const { tileX, tileY } = TileLnglatTrans.lnglatToTile(lng, lat, zoom);
    return tileY;
  }

  static colToY(col = 0, zoom = 1) {
    const { lng, lat } = TileLnglatTrans.pixelToLnglat(0, 0, 0, col, zoom);
    const [x, y] = WGS84ToMercator(lng, lat);
    return Math.floor(y);
  }

  static colToDrawY(col = 0, zoom = 1, offset = [0, 0]) {
    return TileUtils.colToY(col + 1 - offset[1], zoom);
  }

  static getTileRangeByZoom(zoom, center, width) {
    // const [mapCenterX, mapCenterY] = this.center;
    // const { far, fov } = this.camera;
    // const width = far / (Math.cos((Math.PI * fov) / 180) * 2);
    const [mapCenterX, mapCenterY] = center;
    const row = TileUtils.xToRow(mapCenterX, zoom);
    const col = TileUtils.yToCol(mapCenterY, zoom);
    const tileSize = TileUtils.getTileSize(zoom);
    const radius = Math.ceil(width / tileSize[0]);

    const max_row_col = Math.pow(2, zoom);
    const min_row_col = 0;

    let rowStart = row - radius;
    if (rowStart < min_row_col) rowStart = min_row_col;
    let rowEnd = row + radius;
    if (rowEnd > max_row_col) rowEnd = max_row_col;

    let colStart = col - radius;
    if (colStart < min_row_col) colStart = min_row_col;
    let colEnd = col + radius;
    if (colEnd > max_row_col) colEnd = max_row_col;

    const x1 = TileUtils.rowToX(rowStart, zoom);
    const y1 = TileUtils.colToY(colStart, zoom);
    const x2 = TileUtils.rowToX(rowEnd, zoom);
    const y2 = TileUtils.colToY(colEnd, zoom);

    return {
      row: [rowStart, rowEnd],
      col: [colStart, colEnd],
      minX: Math.min(x1, x2),
      maxX: Math.max(x1, x2),
      minY: Math.min(y1, y2),
      maxY: Math.max(y1, y2),
      bbox: [x1, y1, x2, y2],
      center: [mapCenterX, mapCenterY],
      size: tileSize,
      zoom: zoom,
    };
  }

  static getTileList(zoom, center, width) {
    const { row, col, size } = TileUtils.getTileRangeByZoom(zoom, center, width);
    const array = [];
    for (let i = row[0]; i <= row[1]; i++) {
      for (let j = col[0]; j <= col[1]; j++) {
        array.push([i, j, size]);
      }
    }
    return array;
  }
}

export const OSMTileUtils = TileUtils;
