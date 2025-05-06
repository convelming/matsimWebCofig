import { Layer, MAP_EVENT } from "@/mymap/index.js";
import * as THREE from "three";
import { EARTH_RADIUS, WGS84ToMercator } from "@/mymap/utils/LngLatUtils";

import * as GeoTIFF from "geotiff";
import { BaiduTileUtils } from "@/mymap/utils/BaiduTileUtils.js";
import { OSMTileUtils } from "@/mymap/utils/OSMTileUtils.js";

// 地图图层类
export class TileLayer extends Layer {
  name = "TileLayer";

  meshMap = {};

  constructor(opt) {
    super(opt);
    for (let zoom = 5; zoom <= 18; zoom++) {
      this.meshMap[zoom] = new TileMesh(zoom, [0, 0]);
    }
    // this.getTif();
  }

  async getTif() {
    const tif = await GeoTIFF.fromUrl(process.env.VUE_APP_BASE_API + "/demo/新丰县dem.tif");
    const tifImage = await tif.getImage();
    const tifImageData = await tifImage.readRasters({
      interleave: true,
    });
    const { width, height } = tifImageData;

    const geometry = new THREE.PlaneGeometry(width, height, width - 1, height - 1);
    const position = geometry.attributes.position;
    for (let i = 0; i < position.count; i++) {
      position.array[3 * i + 2] = tifImageData[i] * 0.8;
    }
    geometry.computeVertexNormals();
    const normal = geometry.attributes.normal;
    const noArray = new Uint8Array(normal.count * 4);
    for (let i = 0; i < normal.count; i++) {
      noArray[i * 4] = Math.floor((normal.getX(i) + 1) * 0.5 * 255);
      noArray[i * 4 + 1] = Math.floor((normal.getY(i) + 1) * 0.5 * 255);
      noArray[i * 4 + 2] = Math.floor((normal.getZ(i) + 1) * 0.5 * 255);
      noArray[i * 4 + 3] = 255;
    }
    const noCanvas = document.createElement("canvas");
    noCanvas.width = width;
    noCanvas.height = height;
    const noCtx = noCanvas.getContext("2d");
    noCtx.putImageData(new ImageData(new Uint8ClampedArray(noArray), width, height), 0, 0);

    const array = new Uint8Array(tifImageData.length * 4);
    for (let i = 0, l = tifImageData.length; i < l; i++) {
      const hex = tifImageData[i] * 0.8;
      const r = (hex >> 16) & 255;
      const g = (hex >> 8) & 255;
      const b = hex & 255;
      array[i * 4] = r;
      array[i * 4 + 1] = g;
      array[i * 4 + 2] = b;
      array[i * 4 + 3] = 255;
    }

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
    };
    for (const tileZoom in this.meshMap) {
      const tile = this.meshMap[tileZoom];
      tile.tifImage = obj;
    }
  }

  // 地图加载完成回调
  async onAdd(map) {
    super.onAdd(map);
    this.update();
  }

  render() {
    // this.update();
  }

  update() {
    const zoom = Math.floor(this.map.zoom);
    const center = [...this.map.center];
    for (const tileZoom in this.meshMap) {
      const tile = this.meshMap[tileZoom];
      tile.setCenter(center);
      if (zoom == tileZoom) {
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

  constructor(zoom, center) {
    super();
    this.center = center;

    this.zoom = zoom;
    this.tileColRow = Math.min(Math.pow(2, zoom), 10);
    const [tileWidth, tileHeight] = BaiduTileUtils.getTileSize(zoom);
    this.geoWidth = tileWidth * this.tileColRow;
    this.geoHieght = tileHeight * this.tileColRow;
    this.geoSegments = this.tileColRow * 127;
    this.imageWidth = 512;
    this.imageHeight = (512 * tileHeight) / tileWidth;
    this.canvasWidth = this.imageWidth * this.tileColRow;
    this.canvasHeight = this.imageHeight * this.tileColRow;

    this.geometry = new THREE.PlaneGeometry(this.geoWidth, this.geoHieght, this.geoSegments, this.geoSegments);
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
    this.tifNoCanvas.width = this.tifNoCanvas.height = this.canvasSize;
    this.tifNoTexture = new THREE.CanvasTexture(this.tifNoCanvas);
    // MeshLambertMaterial MeshBasicMaterial
    this.material = new THREE.MeshLambertMaterial({
      // color: 0x000000,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
      map: this.tileTexture,
      displacementMap: this.tifTexture,
      normalMap: this.tifNoTexture,
      // wireframe: true,
    });

    this.material.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader.replace(
        "#include <displacementmap_vertex>",
        `
          #ifdef USE_DISPLACEMENTMAP
            float tiff_height = 0.0;
            float index = 0.0;
            for (float i = -0.001; i <= 0.001; i+=0.001) {
              for (float j = -0.001; j <= 0.001; j+=0.001) {
                vec2 tiff_uv = vec2(vUv.x + i, vUv.y + j);
                if(tiff_uv.x < 0.0 || tiff_uv.x > 1.0 || tiff_uv.y < 0.0 || tiff_uv.y > 1.0) break;
                vec4 sampledDiffuseColor1 = texture2D( displacementMap, tiff_uv );
                tiff_height += sampledDiffuseColor1.r * 255.0 * 255.0 * 255.0 + sampledDiffuseColor1.g * 255.0 * 255.0 + sampledDiffuseColor1.b * 255.0;
                index += 1.0;
              }
            }
            tiff_height /= index;
            transformed += normalize( objectNormal ) * tiff_height;
          #endif
        `
      );
    };

    this.material.customProgramCacheKey = () => {
      return JSON.stringify({
        uuid: this.material.uuid,
      });
    };
  }

  setCenter(center) {
    this.center = center;
  }

  update() {
    const [cx, cy] = this.center;
    // {
    //   console.time("tileImage");
    //   function getUrl(row, col, zoom) {
    //     // return `http://192.168.60.231:23334/baidu/satellite/${zoom}/${row}/${col}.jpg`;
    //     return `http://online4.map.bdimg.com/tile/?qt=tile&x=${row}&y=${col}&z=${zoom}&;styles=pl&scaler=1&udt=20170406`;
    //     // return `http://192.168.60.231:23334/baidu/satellite/${zoom}/${row}/${col}.jpg`
    //     return `https://api.mapbox.com/styles/v1/dasin/cltigm5bp010s01ptciblgffl/tiles/512/${zoom}/${row}/${col}@2x?access_token=pk.eyJ1IjoiY29udmVsIiwiYSI6ImNtOW50Z2c0NTAyNGMybHB5Y2txcXY0NmgifQ.zM_QAebuyQtVh-A93w5wyA`;
    //     return `http://192.168.60.231:23334/osm/Positron/${zoom}/${row}/${col}.png`;
    //   }
    //   const crow = BaiduTileUtils.xToRow(cx, this.zoom);
    //   const ccol = BaiduTileUtils.yToCol(cy, this.zoom);
    //   const srow = Math.floor(crow - this.tileColRow / 2);
    //   const scol = Math.floor(ccol - this.tileColRow / 2);
    //   const maxRowCol = Math.pow(2, this.zoom);
    //   const ctx = this.tileCanvas.getContext("2d");
    //   ctx.clearRect(0, 0, this.tileCanvas.width, this.tileCanvas.height);
    //   for (let i = 0; i < this.tileColRow; i++) {
    //     for (let j = 0; j < this.tileColRow; j++) {
    //       let row = srow + i;
    //       let col = scol + j;
    //       if (row > maxRowCol) row = row % maxRowCol;
    //       if (row > maxRowCol) row = row % maxRowCol;
    //       const key = `${row}_${col}`;
    //       let image = this.imagePool[key];
    //       if (!image) {
    //         image = new Image();
    //         image.crossOrigin = "Anonymous";
    //         image.onload = () => {
    //           image._loaded = true;
    //         };
    //         image.onerror = () => {
    //           image._loaded = false;
    //         };
    //         image.src = getUrl(row, col, this.zoom);
    //         this.imagePool[key] = image;
    //       }
    //       if (image.complete && image._loaded) {
    //         ctx.drawImage(image, 0, 0, image.width, image.height, parseInt(i * this.imageSize), parseInt(j * this.imageSize), parseInt(this.imageSize), parseInt(this.imageSize));
    //       }
    //     }
    //   }
    //   this.tileTexture.needsUpdate = true;
    //   console.timeEnd("tileImage");
    // }
    {
      function getUrl(row, col, zoom) {
        // return `http://192.168.60.231:23334/baidu/satellite/${zoom}/${row}/${col}.jpg`;
        return `http://online4.map.bdimg.com/tile/?qt=tile&x=${row}&y=${col}&z=${zoom}&;styles=pl&scaler=1&udt=20170406`;
        // return `http://192.168.60.231:23334/baidu/satellite/${zoom}/${row}/${col}.jpg`
        return `https://api.mapbox.com/styles/v1/dasin/cltigm5bp010s01ptciblgffl/tiles/512/${zoom}/${row}/${col}@2x?access_token=pk.eyJ1IjoiY29udmVsIiwiYSI6ImNtOW50Z2c0NTAyNGMybHB5Y2txcXY0NmgifQ.zM_QAebuyQtVh-A93w5wyA`;
        return `http://192.168.60.231:23334/osm/Positron/${zoom}/${row}/${col}.png`;
      }

      const rx = this.geoWidth / 2;
      const ry = this.geoHieght / 2;
      const sx = cx + rx;
      const sy = cy - ry;
      const ex = cx - rx;
      const ey = cy + ry;
      const srow = BaiduTileUtils.xToRow(sx, this.zoom);
      const scol = BaiduTileUtils.yToCol(sy, this.zoom);
      const erow = BaiduTileUtils.xToRow(ex, this.zoom);
      const ecol = BaiduTileUtils.yToCol(ey, this.zoom);
      const ctx = this.tileCanvas.getContext("2d");
      ctx.clearRect(0, 0, this.tileCanvas.width, this.tileCanvas.height);
      for (let i = Math.min(srow, erow); i <= Math.abs(srow - erow); i++) {
        for (let j = Math.min(scol, ecol); j <= Math.abs(scol - ecol); j++) {
          const key = `${i}_${j}`;
          let image = this.imagePool[key];
          if (!image) {
            image = {
              data: new Image(),
              loaded: false,
              errored: false,
              x: BaiduTileUtils.rowToX(i, this.zoom),
              y: BaiduTileUtils.colToY(j, this.zoom),
            };
            image.data.crossOrigin = "Anonymous";
            image.data.onload = () => {
              image.loaded = true;
            };
            image.data.onerror = () => {
              image.errored = true;
            };
            image.data.src = getUrl(i, j, this.zoom);
            this.imagePool[key] = image;
          }
          if (image.loaded) {
            ctx.drawImage(image.data, 0, 0, image.data.width, image.data.height, parseInt(i * this.imageSize), parseInt(j * this.imageSize), parseInt(this.imageSize), parseInt(this.imageSize));
          }
        }
      }
    }

    if (this.tifImage) {
      console.time("tifImage");
      const crow = OSMTileUtils.xToRow(cx, this.zoom);
      const ccol = OSMTileUtils.yToCol(cy, this.zoom);
      const srow = Math.floor(crow - this.tileColRow / 2);
      const scol = Math.floor(ccol - this.tileColRow / 2);
      const sx = OSMTileUtils.rowToX(srow, this.zoom);
      const sy = OSMTileUtils.colToY(scol, this.zoom);
      const ex = OSMTileUtils.rowToX(srow + this.tileColRow + 1, this.zoom);
      const ey = OSMTileUtils.colToY(scol + this.tileColRow + 1, this.zoom);
      const { bbox, width, height, image, normal } = this.tifImage;
      const tsx = bbox[0];
      const tsy = bbox[1];
      const tex = bbox[2];
      const tey = bbox[3];
      const x1 = tsx - sx;
      const y1 = sy - tsy;
      const scale = this.canvasSize / this.geoSize;

      const ctx = this.tifCanvas.getContext("2d");
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, this.tifCanvas.width, this.tifCanvas.height);
      ctx.drawImage(image, 0, 0, width, height, x1 * scale, y1 * scale, Math.abs(tsx - tex) * scale, Math.abs(tsy - tey) * scale);
      this.tifTexture.needsUpdate = true;
      // this.tifCanvas.style = `position: fixed;top:0;left:0;width: ${this.tifCanvas.width / 5}px;height: ${this.tifCanvas.width / 5}px;z-index: 9999;`;
      // document.body.appendChild(this.tifCanvas);

      const ctxNo = this.tifNoCanvas.getContext("2d");
      ctxNo.fillStyle = "#808080";
      ctxNo.fillRect(0, 0, this.tifNoCanvas.width, this.tifNoCanvas.height);
      ctxNo.drawImage(normal, 0, 0, width, height, x1 * scale, y1 * scale, Math.abs(tsx - tex) * scale, Math.abs(tsy - tey) * scale);
      this.tifNoTexture.needsUpdate = true;
      console.timeEnd("tifImage");
    }

    // const x = (crow * (EARTH_RADIUS * 2)) / Math.pow(2, this.zoom) - EARTH_RADIUS - cx;
    // const y = EARTH_RADIUS - (ccol * (EARTH_RADIUS * 2)) / Math.pow(2, this.zoom) - cy;
    // this.position.set(x, y, 0);
  }
}
