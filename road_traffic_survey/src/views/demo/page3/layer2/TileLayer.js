import { Layer, MAP_EVENT } from "@/mymap/index.js";
import * as THREE from "three";
import { EARTH_RADIUS, WGS84ToMercator } from "@/mymap/utils/LngLatUtils";

import * as GeoTIFF from "geotiff";
import { BaiduTileUtils } from "@/mymap/utils/BaiduTileUtils.js";
import { OSMTileUtils } from "@/mymap/utils/OSMTileUtils.js";

const TileUtils = OSMTileUtils;

// 地图图层类
export class TileLayer extends Layer {
  name = "TileLayer";

  meshMap = {};

  constructor(opt) {
    super(opt);
    for (let zoom = 5; zoom <= 18; zoom++) {
      this.meshMap[zoom] = new TileMesh(zoom, [0, 0]);
      this.meshMap[zoom].setOpacity(opt.opacity || this.opacity);
    }
    this.setTif(opt.tifUrl);
  }

  async setTif(tifUrl = "") {
    console.log("getTif", tifUrl);
    try {
      let tif = null;
      if (typeof tifUrl === "string") {
        console.log("fromUrl");
        tif = await GeoTIFF.fromUrl(tifUrl);
      } else if (tifUrl instanceof ArrayBuffer) {
        console.log("fromArrayBuffer");
        tif = await GeoTIFF.fromArrayBuffer(tifUrl);
      }
      const tifImage = await tif.getImage();
      console.log(tifImage);
      const nodata = tifImage.getGDALNoData() || 0;
      const tifImageData = await tifImage.readRasters({
        interleave: true,
        fillValue: 0,
      });

      const { width, height } = tifImageData;

      const geometry = new THREE.PlaneGeometry(width, height, width - 1, height - 1);
      const position = geometry.attributes.position;
      let dScale = 0;
      for (let i = 0; i < tifImageData.length; i++) {
        if (tifImageData[i] == nodata) {
          tifImageData[i] = 0;
        }
        dScale = Math.max(dScale, Math.abs(tifImageData[i]));
        position.array[3 * i + 2] = tifImageData[i];
      }
      geometry.computeVertexNormals();

      const normal = geometry.attributes.normal;
      const noArray = new Uint8Array(tifImageData.length * 4);
      const array = new Uint8Array(tifImageData.length * 4);

      for (let i = 0; i < tifImageData.length; i++) {
        noArray[i * 4] = Math.floor((normal.getX(i) + 1) * 0.5 * 255);
        noArray[i * 4 + 1] = Math.floor((normal.getY(i) + 1) * 0.5 * 255);
        noArray[i * 4 + 2] = Math.floor((normal.getZ(i) + 1) * 0.5 * 255);
        noArray[i * 4 + 3] = 255;

        const hex = ((tifImageData[i] - dScale) / (dScale * 2)) * 255;
        array[i * 4] = hex;
        array[i * 4 + 1] = hex;
        array[i * 4 + 2] = hex;
        array[i * 4 + 3] = 255;
      }
      const noCanvas = document.createElement("canvas");
      noCanvas.width = width;
      noCanvas.height = height;
      const noCtx = noCanvas.getContext("2d");
      noCtx.putImageData(new ImageData(new Uint8ClampedArray(noArray), width, height), 0, 0);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.putImageData(new ImageData(new Uint8ClampedArray(array), width, height), 0, 0);

      const origin = tifImage.getOrigin();
      const resolution = tifImage.getResolution();
      const [x1, y1] = WGS84ToMercator(origin[0], origin[1]);
      const [x2, y2] = WGS84ToMercator(origin[0] + resolution[0] * width, origin[1] + resolution[1] * height);
      const obj = {
        bbox: [x1, y1, x2, y2],
        image: canvas,
        normal: noCanvas,
        width: width,
        height: height,
        dScale: dScale,
      };
      for (const tileZoom in this.meshMap) {
        const tile = this.meshMap[tileZoom];
        tile.tifImage = obj;
      }
      this.update();
    } catch (error) {
      console.log(error)
      for (const tileZoom in this.meshMap) {
        const tile = this.meshMap[tileZoom];
        tile.tifImage = null;
      }
      this.update();
    }
  }

  setOpacity(opacity) {
    this.opacity = opacity;
    this.update();
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER || type == MAP_EVENT.UPDATE_ZOOM) {
      this.update();
    }
  }

  // 地图加载完成回调
  async onAdd(map) {
    super.onAdd(map);
    this.update();
  }

  render() {}

  update() {
    if (!this.map) return;
    const zoom = Math.floor(this.map.zoom);
    const center = [...this.map.center];
    const opacity = this.opacity;
    for (const tileZoom in this.meshMap) {
      const tile = this.meshMap[tileZoom];
      tile.setOpacity(opacity);
      tile.setCenter(center);
      if (zoom == tileZoom) {
        tile.update();
        this.scene.add(tile);
      } else if (zoom > 18 && tileZoom == 18) {
        tile.update();
        this.scene.add(tile);
      } else if (zoom < 5 && tileZoom == 5) {
        tile.update();
        this.scene.add(tile);
      } else {
        tile.removeFromParent();
      }
    }
  }
}

/**
 * TODO: 瓦片加载优化
 * 1. WebWorker 绘制瓦片纹理和地形纹理
 *
 * TODU：瓦片加载方式修改
 * 1. geometry的大小和分区不用与瓦片数量挂钩
 * 2. 瓦片算法要兼容多种地图服务
 * 3.
 */
export class TileMesh extends THREE.Mesh {
  zoom = 0;

  imagePool = {};

  tifImage = null;

  imageSize = 256;

  opacity = 1;
  constructor(zoom, center) {
    super();
    this.center = center;

    this.zoom = zoom;
    this.tileColRow = Math.min(Math.pow(2, zoom), 10);
    const [tileWidth, tileHeight] = TileUtils.getTileSize(zoom);
    this.tileHeight = tileHeight;
    this.geoWidth = tileWidth * this.tileColRow;
    this.geoHeight = tileHeight * this.tileColRow;
    // this.geoSegments = 2000; //this.tileColRow * 127;
    this.geoSegments = this.tileColRow * 127;

    this.imageScale = this.imageSize / tileWidth;
    this.imageWidth = this.imageSize;
    this.imageHeight = tileHeight * this.imageScale;
    this.canvasWidth = this.imageWidth * this.tileColRow;
    this.canvasHeight = this.imageHeight * this.tileColRow;

    this.geometry = new THREE.PlaneGeometry(this.geoWidth, this.geoHeight, this.geoSegments, this.geoSegments);
    this.geometry.needsUpdate = true;

    this.tileCanvas = document.createElement("canvas");
    this.tileCanvas.width = this.canvasWidth;
    this.tileCanvas.height = this.canvasHeight;
    this.tileTexture = new THREE.CanvasTexture(this.tileCanvas);

    this.tifCanvas = document.createElement("canvas");
    this.tifCanvas.width = this.canvasWidth;
    this.tifCanvas.height = this.canvasHeight;
    this.tifTexture = new THREE.CanvasTexture(this.tifCanvas);

    this.tifNoCanvas = document.createElement("canvas");
    this.tifNoCanvas.width = this.canvasWidth;
    this.tifNoCanvas.height = this.canvasHeight;
    this.tifNoTexture = new THREE.CanvasTexture(this.tifNoCanvas);
    // MeshLambertMaterial MeshBasicMaterial
    this.material = new THREE.MeshLambertMaterial({
      // color: 0x000000,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
      map: this.tileTexture,
      displacementMap: this.tifTexture,
      // displacementScale: 1,
      // displacementBias: 0,
      normalMap: this.tifNoTexture,
      // wireframe: true,
    });
  }

  setCenter(center) {
    this.center = center;
  }

  setOpacity(opacity) {
    this.opacity = opacity;
    this.material.setValues({ opacity: this.opacity });
    this.material.needsUpdate = true;
  }

  updateTile() {
    function getUrl(row, col, zoom) {
      const key = 'pk.eyJ1Ijoic2t1bjE2IiwiYSI6ImNsNmN6bDAxaDAwbmozam55bjBrZWVybTUifQ.vg3pEDwpnUgxmJMmeB8nGQ'
      // const key = "pk.eyJ1IjoiY29udmVsIiwiYSI6ImNtOW50Z2c0NTAyNGMybHB5Y2txcXY0NmgifQ.zM_QAebuyQtVh-A93w5wyA"
      // return `http://wprd0.is.autonavi.com/appmaptile?x=${row}&y=${col}&z=${zoom}&lang=zh_cn&size=1&scl=1&style=7`;
      // 百度算法
      // return `http://192.168.60.231:23334/baidu/satellite/${zoom}/${row}/${col}.jpg`;
      // return `https://maponline0.bdimg.com/starpic/?qt=satepc&u=x=${row};y=${col};z=${zoom};v=009;type=sate&fm=46&app=webearth2&v=009&udt=20250424`;
      // return `https://maponline3.bdimg.com/starpic/?qt=satepc&u=x=${row};y=${col};z=${zoom};v=009;type=sate&fm=46&app=webearth2&v=009&udt=20250424`;
      // return `http://online4.map.bdimg.com/tile/?qt=tile&x=${row}&y=${col}&z=${zoom}&;styles=pl&scaler=1&udt=20170406`;
      // 天地图
      // return `http://t0.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX=${zoom}&TILEROW=${col}&TILECOL=${row}&tk=fcaaabe9f71c6322310f751c434a8a2b`;
      // return `http://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX=${zoom}&TILEROW=${col}&TILECOL=${row}&tk=fcaaabe9f71c6322310f751c434a8a2b`;
      // osm算法
      // return `https://m.earthol.me/map.jpg?lyrs=y&gl=cn&x=${row}&y=${col}&z=${zoom}` // 403报错
      // return `https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${col}/${row}`;
      // return `http://192.168.60.231:23334/baidu/satellite/${zoom}/${row}/${col}.jpg`
      return `https://api.mapbox.com/styles/v1/dasin/cltigm5bp010s01ptciblgffl/tiles/512/${zoom}/${row}/${col}@2x?access_token=${key}`;
      // return `http://192.168.60.231:23334/osm/Positron/${zoom}/${row}/${col}.png`;
      return `http://192.168.60.231:23334/osm/Arcgis/${zoom}/${row}/${col}.png`;
      return `http://192.168.60.231:23334/osm/liberty/${zoom}/${row}/${col}.png`;
    }

    const v = this.v;
    const [cx, cy] = this.center;
    const rx = this.geoWidth / 2;
    const ry = this.geoHeight / 2;
    const sx = cx - rx;
    const sy = cy + ry;
    const ex = cx + rx;
    const ey = cy - ry;

    const srow = TileUtils.xToRow(sx, this.zoom);
    const scol = TileUtils.yToCol(sy, this.zoom);
    const erow = TileUtils.xToRow(ex, this.zoom);
    const ecol = TileUtils.yToCol(ey, this.zoom);
    const ctx = this.tileCanvas.getContext("2d");
    ctx.clearRect(0, 0, this.tileCanvas.width, this.tileCanvas.height);
    for (let i = Math.min(srow, erow), il = Math.max(srow, erow); i <= il; i++) {
      for (let j = Math.min(scol, ecol), jl = Math.max(scol, ecol); j <= jl; j++) {
        const key = `${i}_${j}`;
        let image = this.imagePool[key];
        if (!image) {
          image = {
            data: new Image(),
            loaded: false,
            errored: false,
            x: TileUtils.rowToDrawX(i, this.zoom),
            y: TileUtils.colToDrawY(j, this.zoom),
          };
          image.data.crossOrigin = "Anonymous";
          image.data.onload = (e) => {
            if (image.v == this.v) {
              const dx = (image.x - sx) * this.imageScale;
              const dy = (sy - image.y) * this.imageScale;
              const dw = Math.ceil(this.imageWidth + 1); // +1 消除瓦片间的缝隙（缝隙原因猜测是计算误差）
              const dh = Math.ceil(this.imageHeight + 1); // +1 消除瓦片间的缝隙（缝隙原因猜测是计算误差）
              ctx.drawImage(image.data, 0, 0, image.data.width, image.data.height, dx, dy, dw, dh);
              this.tileTexture.needsUpdate = true;
            }
            image.loaded = true;
          };
          image.data.onerror = () => {
            image.errored = true;
          };
          image.data.src = getUrl(i, j, this.zoom);
          this.imagePool[key] = image;
        }
        image.v = v;
        if (image.loaded) {
          const dx = (image.x - sx) * this.imageScale;
          const dy = (sy - image.y) * this.imageScale;
          const dw = Math.ceil(this.imageWidth + 1); // +1 消除瓦片间的缝隙（缝隙原因猜测是计算误差）
          const dh = Math.ceil(this.imageHeight + 1); // +1 消除瓦片间的缝隙（缝隙原因猜测是计算误差）
          ctx.drawImage(image.data, 0, 0, image.data.width, image.data.height, dx, dy, dw, dh);
        }
      }
    }
    this.tileTexture.needsUpdate = true;
  }

  updateTiff() {
    if (!this.tifImage) {
      const ctx = this.tifCanvas.getContext("2d");
      ctx.fillStyle = "#7f7f7f00";
      ctx.fillRect(0, 0, this.tifCanvas.width, this.tifCanvas.height);
      const ctxNo = this.tifNoCanvas.getContext("2d");
      ctxNo.fillStyle = "#7f7fff00";
      ctxNo.fillRect(0, 0, this.tifNoCanvas.width, this.tifNoCanvas.height);
      return;
    }
    const [cx, cy] = this.center;
    const rx = this.geoWidth / 2;
    const ry = this.geoHeight / 2;
    const sx = cx - rx;
    const sy = cy + ry;
    const ex = cx + rx;
    const ey = cy - ry;

    const { bbox, width, height, image, normal, dScale } = this.tifImage;
    const tsx = bbox[0];
    const tsy = bbox[1];
    const tex = bbox[2];
    const tey = bbox[3];
    const x1 = tsx - sx;
    const y1 = sy - tsy;
    const scale = this.imageScale;

    const ctx = this.tifCanvas.getContext("2d");
    ctx.fillStyle = "#7f7f7f";
    ctx.fillRect(0, 0, this.tifCanvas.width, this.tifCanvas.height);
    ctx.drawImage(image, 0, 0, width, height, x1 * scale, y1 * scale, Math.abs(tsx - tex) * scale, Math.abs(tsy - tey) * scale);
    this.tifTexture.needsUpdate = true;
    // this.tifCanvas.style = `position: fixed;top:0;left:0;width: auto;height: 300px;z-index: 9999;`;
    // document.body.appendChild(this.tifCanvas);

    const ctxNo = this.tifNoCanvas.getContext("2d");
    ctxNo.fillStyle = "#7f7fff";
    ctxNo.fillRect(0, 0, this.tifNoCanvas.width, this.tifNoCanvas.height);
    ctxNo.drawImage(normal, 0, 0, width, height, x1 * scale, y1 * scale, Math.abs(tsx - tex) * scale, Math.abs(tsy - tey) * scale);

    // this.tifNoCanvas.style = `position: fixed;top:300px;left:0;width: auto;height: 300px;z-index: 9999;`;
    // document.body.appendChild(this.tifNoCanvas);
    this.tifNoTexture.needsUpdate = true;

    this.material.setValues({
      displacementScale: dScale * 2,
      displacementBias: -dScale,
    });
  }

  update() {
    this.v = new Date().getTime();
    this.updateTile();
    this.updateTiff();
  }

  dispose() {
    this.removeFromParent();
    this.geometry.dispose();
    this.material.dispose();
    this.tifTexture.dispose();
    this.tileTexture.dispose();
    this.tifNoTexture.dispose();
  }
}
