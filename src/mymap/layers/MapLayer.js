import { Layer } from "../main/Layer";
import * as THREE from "three";
import { EARTH_RADIUS } from "../utils/LngLatUtils.js";
import { MAP_EVENT } from "../main/Map.js";

const Loader = new THREE.TextureLoader();

// 瓦片类
export class MapTile {
  // 瓦片名称
  static NAME = "MapTile";
  // 地图背景色
  static BACKGROUND = 0xd9ecff;

  _loadNum = 0;

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
  async loadMap() {
    try {
      this._loadNum++;
      const texture = await new Promise((resolve, reject) =>
        Loader.load(this.url, resolve, undefined, reject)
      );
      this.mesh.material.setValues({ map: texture, transparent: false });
      this.mesh.material.needsUpdate = true;
      this._loadStatus = 2;
    } catch (error) {
      if (this._loadNum <= 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, 2000 * Math.random())
        );
        this.loadMap();
      } else {
        this._loadStatus = 3;
      }
    }
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
    // let zd = this.constructor.max_zoom - this.constructor.min_zoom;
    // this._z = (zd - zoom) / zd / 100;
    this._z = 0;
  }
}

export const MAP_LAYER_STYLE = {
  DARK_MATTER: class extends MapTile {
    static NAME = "DARK_MATTER";
    static BACKGROUND = `#0a4173`;
    get url() {
      return `http://192.168.60.231:23334/osm/DarkMatter/${this.zoom}/${this.row}/${this.col}.png`;
    }
  },
  MAP_TILER_BASIC: class extends MapTile {
    static NAME = "MAP_TILER_BASIC";
    get url() {
      return `http://192.168.60.231:23334/osm/MapTilerBasic/${this.zoom}/${this.row}/${this.col}.png`;
    }
  },
  OSM_BROGHT: class extends MapTile {
    static NAME = "OSM_BROGHT";
    get url() {
      return `http://192.168.60.231:23334/osm/OSMBroght/${this.zoom}/${this.row}/${this.col}.png`;
    }
  },
  OSM_LIDERTY: class extends MapTile {
    static NAME = "OSM_LIDERTY";
    get url() {
      return `http://192.168.60.231:23334/osm/OSMLiberty/${this.zoom}/${this.row}/${this.col}.png`;
    }
  },
  POSITRON: class extends MapTile {
    static NAME = "POSITRON";
    get url() {
      return `http://192.168.60.231:23334/osm/Positron/${this.zoom}/${this.row}/${this.col}.png`;
    }
  },
  LIBERTY: class extends MapTile {
    static NAME = "LIBERTY";
    get url() {
      return `http://192.168.60.231:23334/osm/liberty/${this.zoom}/${this.row}/${this.col}.png`;
    }
  },
  SSTYLE_JYL: class extends MapTile {
    static max_zoom = 16;
    // x偏移量
    _x_offset = -256 * 2.32;
    // y偏移量
    _y_offset = 256 * 1.3;
    static NAME = "极夜蓝";
    static BACKGROUND = `#0a4173`;
    get url() {
      return `http://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=ChinaOnlineStreetPurplishBlue&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX=${this.zoom}&TILEROW=${this.row}&TILECOL=${this.col}&tk=1ff53318177e78188444436d0201e763`;
      // return `https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/${this.zoom}/${this.col}/${this.row}&tk=1ff53318177e78188444436d0201e763`;
    }
  },
  MAPBOX: class extends MapTile {
    static NAME = "MAPBOX";
    get url() {
      // const token =
      //   "pk.eyJ1IjoiaGR4MTQ3IiwiYSI6ImNsYWdwajMyMDEwejAzb251MTd4aXV3dWUifQ._QFvRrJtFKNJ5cOdmoRzTQ";
      // const token =
      //   "pk.eyJ1IjoiemFjaHlhbmc4MyIsImEiOiJja211MjRsbm4waXMwMm5wZDE3d3BuZjBuIn0.lcRS0kbOWjzFw-UikwbyHQ";
      // return `https://api.mapbox.com/v4/mapbox.satellite/${this.zoom}/${this.row}/${this.col}.png256?access_token=${token}`;
      return `https://api.mapbox.com/styles/v1/convel/ck8frzi262yko1invkvbif5aw/tiles/512/${this.zoom}/${this.row}/${this.col}@2x?access_token=pk.eyJ1IjoiY29udmVsIiwiYSI6ImNsaHB4cXA2MDBicGIzam1zb25zdGtiOHAifQ.UuaTujcOQlxywCJWWZ0SSg`
    }
  },
  MAPBOX2: class extends MapTile {
    static NAME = "MAPBOX";
    get url() {
      // const token =
      //   "pk.eyJ1IjoiaGR4MTQ3IiwiYSI6ImNsYWdwajMyMDEwejAzb251MTd4aXV3dWUifQ._QFvRrJtFKNJ5cOdmoRzTQ";
      // const token =
      //   "pk.eyJ1IjoiemFjaHlhbmc4MyIsImEiOiJja211MjRsbm4waXMwMm5wZDE3d3BuZjBuIn0.lcRS0kbOWjzFw-UikwbyHQ";
      // return `https://api.mapbox.com/v4/mapbox.satellite/${this.zoom}/${this.row}/${this.col}.png256?access_token=${token}`;
      // mapbox://styles/dasin/cltigm5bp010s01ptciblgffl
      return `https://api.mapbox.com/styles/dasin/cltigm5bp010s01ptciblgffl/tiles/512/${this.zoom}/${this.row}/${this.col}@2x?access_token=pk.eyJ1IjoiY29udmVsIiwiYSI6ImNsaHB4cXA2MDBicGIzam1zb25zdGtiOHAifQ.UuaTujcOQlxywCJWWZ0SSg`
    }
  },
};

// 地图图层类
export class MapLayer extends Layer {
  name = "MapLayer";

  /**
   * 地图图层使用的瓦片类
   * @type {Function}
   */
  tileClass = null;

  styleMap = null;

  /**
   * 获取当前缩放级别
   * 根据瓦片类的min_zoom和max_zoom来现在最大和最小的缩放级别
   * @returns {number}
   */
  get zoom() {
    let zoom = Math.floor(this.map.zoom);
    if (zoom > this.tileClass.max_zoom) zoom = this.tileClass.max_zoom;
    else if (zoom < this.tileClass.min_zoom) zoom = this.tileClass.min_zoom;
    return zoom;
  }

  // 地图瓦片分组Map
  get zoomMap() {
    if (!this._zoomMap) {
      this._zoomMap = {};
      for (let i = this.tileClass.min_zoom; i <= this.tileClass.max_zoom; i++) {
        this._zoomMap[i] = {
          scene: new THREE.Group(),
          tileMap: {},
          show: false,
        };
      }
    }
    return this._zoomMap;
  }

  // 地图菜单div
  // get menuDoc() {
  //   if (!this._menuDoc) {
  //     const menuDoc = document.createElement("div");
  //     menuDoc.classList.add("MapLayer_menu", "hide");
  //     menuDoc.style = `height: ${Object.values(this.styleMap).length * 50 -10
  //       }px;`;

  //     const openHideBtn = document.getElementById("map-switch");
  //     // openHideBtn.classList.add("open_hide_btn");
  //     openHideBtn.onclick = (event) => {
  //       if (menuDoc.classList.contains("hide")) {
  //         menuDoc.classList.remove("hide");
  //       } else {
  //         menuDoc.classList.add("hide");
  //       }
  //     };
  //     // menuDoc.append(openHideBtn);
  //     const itemDocList = [];
  //     for (const [key, value] of Object.entries(this.styleMap)) {
  //       const itemDoc = document.createElement("img");
  //       itemDoc.title = value.NAME;
  //       itemDoc.src = new value(15, 26700, 14218, 200).url;
  //       itemDoc.classList.add("item");
  //       if (value === this.tileClass) itemDoc.classList.add("active");
  //       itemDoc.onclick = (event) => {
  //         itemDocList.forEach((itemDoc) => {
  //           itemDoc.classList.remove("active");
  //         });
  //         itemDoc.classList.add("active");
  //         this.setTileClass(value);
  //       };

  //       itemDocList.push(itemDoc);
  //       menuDoc.append(itemDoc);
  //     }
  //     this._menuDoc = menuDoc;
  //   }
  //   return this._menuDoc;
  // }

  constructor(opt) {
    super(opt);
    this.tileClass = opt.tileClass || MAP_LAYER_STYLE.MAP_TILER_BASIC;
    this.styleMap = opt.styleMap || MAP_LAYER_STYLE;

    this.setStyleMap(this.styleMap);
  }

  setStyleMap(styleMap) {
    this.styleMap = styleMap;

    // if (this._menuDoc) {
    //   if (this._menuDoc.parentElement)
    //     this._menuDoc.parentElement.removeChild(menuDoc);
    //   this._menuDoc = null;
    // }
    let item = Object.values(styleMap).find((v) => v === this.tileClass);
    if (item) {
      this.setTileClass(item);
    } else {
      this.setTileClass(Object.values(styleMap)[0]);
    }
  }

  // 设置瓦片类
  setTileClass(tileClass) {
    if (new tileClass() instanceof MapTile) {
      this.tileClass = tileClass;
      this._zoomMap = null;
      this.clearScene();
      if (this.map) {
        this.map.setBackground(new THREE.Color(this.tileClass.BACKGROUND));
        this.loadMesh();
        this.setShowZoom(this.zoom);
        this.setMeshPosition(this.map.center);
      }
    } else {
      console.error("tileClass must be a subclass of MapTile");
    }
  }

  // 地图加载完成回调
  async onAdd(map) {
    super.onAdd(map);
    if (this.map) {
      this.map.setBackground(new THREE.Color(this.tileClass.BACKGROUND));
      this.loadMesh();
      this.setShowZoom(this.zoom);
      this.setMeshPosition(this.map.center);
      // if(document.getElementById('map-switch-list')){
      //   document.getElementById('map-switch-list').append(this.menuDoc)
      // }
    }
  }

  // 地图事件回调
  on(type, data) {
    if (type == MAP_EVENT.UPDATE_ZOOM) {
      if (this.map) {
        this.loadMesh();
        this.setShowZoom(this.zoom);
        this.setMeshPosition(this.map.center);
      }
    }
    if (type == MAP_EVENT.UPDATE_CENTER) {
      if (this.map) {
        this.loadMesh();
        this.setShowZoom(this.zoom);
        this.setMeshPosition(this.map.center);
      }
    }
    super.on(type, data);
  }

  // 显示指定缩放级别的瓦片
  setShowZoom(zoom) {
    for (const z of Object.keys(this.zoomMap)) {
      const map = this.zoomMap[z];
      if (z == zoom) {
        map.show = true;
        map.scene.position.setZ(0);
        this.scene.add(map.scene);
      } else if (z == zoom + 1) {
        map.show = true;
        map.scene.position.setZ(-0.1);
        this.scene.add(map.scene);
      } else if (map.show) {
        map.show = false;
        this.scene.remove(map.scene);
      }
    }
  }

  // 设置地图瓦片位置
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

  // 加载瓦片
  loadMesh() {
    const zoom = this.zoom;
    const [mapCenterX, mapCenterY] = this.map.center;
    const { far, fov } = this.map.camera;
    const width = far / (Math.cos((Math.PI * fov) / 180) * 2);

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
          const tile = new this.tileClass(zoom, i, j, tileSize);
          this.zoomMap[zoom].tileMap[key] = tile;
          this.zoomMap[zoom].scene.add(tile.mesh);

          urlList.push({
            level: Math.max(Math.abs(row - i), Math.abs(col - j)),
            tile: this.zoomMap[zoom].tileMap[key],
          });
        }
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
