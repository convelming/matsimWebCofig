
function _Math_sinh(x) {
  return (Math.exp(x) - Math.exp(-x)) / 2;
}

class TransformClassTianDiTu {
  constructor(levelRange_max, LevelRange_min) {
    this.levelMax = levelRange_max;
    this.levelMin = LevelRange_min;
  }

  _getColNum(level) {
    return Math.pow(2, level);
  }

  _getRowNum(level) {
    return Math.pow(2, level - 1);
  }

  /*
   * 分辨率，表示水平方向上一个像素点代表的真实距离(m)
   */
  getResolution(latitude, level) {
    let resolution = (6378137.0 * 2 * Math.PI * Math.cos(latitude)) / 256 / this._getColNum(level);
    return resolution;
  }

  _lngToTileX(longitude, level) {
    let x = (longitude + 180) / 360;
    let tileX = Math.floor(x * this._getColNum(level));

    /**
     * 限定边界值, 解决 longitude=180 时边界值错误
     * latitude 应该没问题, 因为 latitude 不会取到 90/-90
     */
    tileX = Math.min(tileX, Math.pow(2, level) - 1);
    return tileX;
  }

  _latToTileY(latitude, level) {
    let y = (90 - latitude) / 180;
    let tileY = Math.floor(y * this._getRowNum(level));


    // let lat_rad = (latitude * Math.PI) / 180;
    // let y = (1 - Math.log(Math.tan(lat_rad) + 1 / Math.cos(lat_rad)) / Math.PI) / 2;
    // let tileY = Math.floor(y * this._getRowNum(level));
    return tileY;
  }

  /*
   * 从经纬度获取某一级别瓦片坐标编号
   */
  lnglatToTile(longitude, latitude, level) {
    let tileX = this._lngToTileX(longitude, level);
    let tileY = this._latToTileY(latitude, level);

    return {
      tileX,
      tileY,
    };
  }

  _pixelXTolng(pixelX, tileX, level) {
    let pixelXToTileAddition = pixelX / 256.0;
    let lngitude = ((tileX + pixelXToTileAddition) / this._getColNum(level)) * 360 - 180;
    return lngitude;
  }

  _pixelYToLat(pixelY, tileY, level) {
    let pixelYToTileAddition = pixelY / 256.0;
    let latitude = 90 - ((tileY + pixelYToTileAddition) / this._getRowNum(level)) * 180;

    // let pixelYToTileAddition = pixelY / 256.0;
    // let latitude = 90 - (Math.atan(_Math_sinh(Math.PI * (1 - (2 * (tileY + pixelYToTileAddition)) / this._getRowNum(level)))) * 180.0) / Math.PI;
    return latitude;
  }

  /*
   * 从某一瓦片的某一像素点到经纬度
   */
  pixelToLnglat(pixelX, pixelY, tileX, tileY, level) {
    let lng = this._pixelXTolng(pixelX, tileX, level);
    let lat = this._pixelYToLat(pixelY, tileY, level);

    return {
      lng,
      lat,
    };
  }
}

export default TransformClassTianDiTu;
