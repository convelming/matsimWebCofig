import { Layer } from "../main/Layer";
import * as THREE from "three";
import { EARTH_RADIUS } from "../utils/LngLatUtils.js";
import { MAP_EVENT } from "../main/Map.js";

const Loader = new THREE.TextureLoader();

// 地图图层类
export class MapLayer extends Layer {
  name = "MapLayer";
  zoomMap = {};

  /**
   * 地图图层使用的瓦片类
   * @type {Function}
   */
  TileClass = LocalOpenStreetMapTile;

  /**
   * 获取当前缩放级别
   * 根据瓦片类的min_zoom和max_zoom来现在最大和最小的缩放级别
   * @returns {number}
   */
  get zoom() {
    let zoom = Math.floor(this.map.zoom);
    if (zoom > this.TileClass.max_zoom) zoom = this.TileClass.max_zoom;
    else if (zoom < this.TileClass.min_zoom) zoom = this.TileClass.min_zoom;
    return zoom;
  }

  constructor(opt) {
    super(opt);
    this.TileClass = opt.TileClass || this.TileClass;
    this.TileClass.max_zoom =
      this.TileClass.max_zoom || this.TileClass.max_zoom;
    this.TileClass.min_zoom =
      this.TileClass.min_zoom || this.TileClass.min_zoom;
    this.zoomMap = {};
    for (let i = this.TileClass.min_zoom; i <= this.TileClass.max_zoom; i++) {
      this.zoomMap[i] = {
        scene: new THREE.Group(),
        tileMap: {},
        show: false,
      };
    }
  }

  async onAdd(map) {
    super.onAdd(map);
    this.loadMesh();
    this.setShowZoom(this.zoom);
    this.setMeshPosition(this.map.center);
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_ZOOM) {
      this.loadMesh();
      this.setShowZoom(this.zoom);
      this.setMeshPosition(this.map.center);
    }
    if (type == MAP_EVENT.UPDATE_CENTER) {
      this.loadMesh();
      this.setShowZoom(this.zoom);
      this.setMeshPosition(this.map.center);
    }
    super.on(type, data);
  }

  setShowZoom(zoom) {
    for (const z of Object.keys(this.zoomMap)) {
      const map = this.zoomMap[z];
      if (z == zoom) {
        map.show = true;
        this.scene.add(map.scene);
      } else if (map.show) {
        map.show = false;
        this.scene.remove(map.scene);
      }
    }
  }

  setMeshPosition([cx, cy]) {
    for (const z of Object.keys(this.zoomMap)) {
      const map = this.zoomMap[z];
      for (const tk of Object.keys(map.tileMap)) {
        const tile = map.tileMap[tk];
        const [x, y] = this.map.WebMercatorToCanvasXY(tile.x, tile.y, cx, cy);
        tile.mesh.position.set(x, y, tile.z);
      }
    }
  }

  loadMesh() {
    const zoom = this.zoom;
    const [mapCenterX, mapCenterY] = this.map.center;
    const { far, fov } = this.map.camera;
    const width = far / Math.cos((Math.PI * fov) / 180);

    const [row, col] = [
      Math.floor(
        ((EARTH_RADIUS + mapCenterX) * Math.pow(2, zoom)) / (EARTH_RADIUS * 2)
      ),
      Math.floor(
        ((EARTH_RADIUS - mapCenterY) * Math.pow(2, zoom)) / (EARTH_RADIUS * 2)
      ),
    ];
    const tileSize = (EARTH_RADIUS * 2) / Math.pow(2, zoom);
    const radius = Math.ceil(width / tileSize);

    const max_row_col = Math.pow(2, zoom);
    let rowStart = row - radius;
    if (rowStart < 0) rowStart = 0;
    let rowEnd = row + radius;
    if (rowEnd > max_row_col) rowEnd = max_row_col;

    let colStart = col - radius;
    if (colStart < 0) colStart = 0;
    let colEnd = col + radius;
    if (colEnd > max_row_col) colEnd = max_row_col;

    let urlList = [];
    for (let i = rowStart; i < rowEnd; i++) {
      for (let j = colStart; j < colEnd; j++) {
        let key = `${i}_${j}`;
        if (!this.zoomMap[zoom].tileMap[key]) {
          const tile = new this.TileClass(zoom, i, j, tileSize);
          this.zoomMap[zoom].tileMap[key] = tile;
          this.zoomMap[zoom].scene.add(tile.mesh);
        }

        urlList.push({
          level: Math.max(Math.abs(row - i), Math.abs(col - j)),
          tile: this.zoomMap[zoom].tileMap[key],
        });
      }
    }
    urlList
      .sort((a, b) => a.level - b.level)
      .forEach((v) => {
        if (v.tile.loadStatus == 1) {
          v.tile.loadMap();
        }
      });
  }
}

// 瓦片类
export class MapTile {
  // 加载状态 1未加载 2加载成功 3加载失败
  _loadStatus = 1;
  // x偏移量
  _x_offset = 0;
  // y偏移量
  _y_offset = 0;
  // 瓦片的最大缩放级别
  static max_zoom = 18;
  // 瓦片的最小缩放级别
  static min_zoom = 5;

  get loadStatus() {
    return this._loadStatus;
  }

  // 瓦片的行号
  get row() {
    return this._row;
  }
  set row(v) {
    this._row = v;
  }

  // 瓦片的列号
  get col() {
    return this._col;
  }
  set col(v) {
    this._col = v;
  }

  // 瓦片的缩放级别
  get zoom() {
    return this._zoom;
  }
  set zoom(v) {
    this._zoom = v;
  }

  // 瓦片的大小
  get size() {
    return this._size;
  }
  set size(v) {
    this._size = v;
  }

  // 瓦片的x坐标
  get x() {
    return this._x + this._x_offset;
  }

  // 瓦片的y坐标
  get y() {
    return this._y + this._y_offset;
  }

  // 瓦片的z坐标
  get z() {
    return this._z;
  }

  // 瓦片贴图url
  get url() {
    return ``;
  }

  // 瓦片的mesh
  get mesh() {
    if (!this._mesh) {
      let material = new THREE.MeshBasicMaterial({
        transparent: true,
        // side: THREE.DoubleSide, //双面显示
        color: 0xffffff,
        opacity: 0,
        // color: 0x000000,
      });
      let geometry = new THREE.PlaneGeometry(this._size, this._size);
      this._mesh = new THREE.Mesh(geometry, material);
      return this._mesh;
    } else {
      return this._mesh;
    }
  }

  // 加载瓦片贴图
  loadMap() {
    return new Promise((resolve, reject) => {
      Loader.load(
        this.url,
        (texture) => {
          this.mesh.material.setValues({ map: texture, opacity: 1 });
          this.mesh.material.needsUpdate = true;
          this._loadStatus = 2;
          resolve();
        },
        undefined,
        (error) => {
          this._loadStatus = 3;
          resolve(error);
        }
      );
    });
  }

  constructor(zoom, row, col, size) {
    this.zoom = zoom;
    this.row = row;
    this.col = col;
    this.size = size;

    this._x =
      ((row + 0.5) * (EARTH_RADIUS * 2)) / Math.pow(2, zoom) - EARTH_RADIUS;
    this._y =
      EARTH_RADIUS - ((col + 0.5) * (EARTH_RADIUS * 2)) / Math.pow(2, zoom);
    let zd = this.constructor.max_zoom - this.constructor.min_zoom;
    this._z = (zd - zoom) / zd / 1000;
  }
}
/**
 * 本地地图瓦片
 */
export class LocalRoadMapTile extends MapTile {
  _x_offset = -592;
  _y_offset = 330;

  static max_zoom = 16;
  static min_zoom = 5;

  get url() {
    return `http://192.168.60.231:23334/mapabc/roadmap/${this.zoom}/${this.row}/${this.col}.png`;
  }
}
/**
 * MapBox瓦片
 */
export class LocalOpenStreetMapTile extends MapTile {
  _x_offset = 0;
  _y_offset = 0;

  static max_zoom = 18;
  static min_zoom = 5;

  get url() {
    return `http://192.168.60.231:23334/osm/liberty/${this.zoom}/${this.row}/${this.col}.png`;
  }
}
