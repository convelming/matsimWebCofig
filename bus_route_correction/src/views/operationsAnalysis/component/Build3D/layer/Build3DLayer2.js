import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import Build3DLayerWorker from "./Build3DLayerWorker.js";

const BUILD_ZOOM = 12;
const EARTH_RADIUS = 20037508.3427892;

export class Build3DLayer extends Layer {
  name = "Build3DLayer";
  buildColor = "#ff4500";
  buildOpacity = 0.8;

  tileMap = {};
  loadingNum = 0;
  _noLoadTileList = [];

  constructor(opt) {
    super(opt);
    this.buildColor = opt.buildColor || this.buildColor;
    this.buildOpacity = opt.buildOpacity || this.buildOpacity;

    this.material = new THREE.MeshLambertMaterial({
      color: this.buildColor,
      opacity: this.buildOpacity,
      transparent: true,
      // wireframe: true,
    });
    this.pickLayerMeterial = new THREE.MeshBasicMaterial({
      color: this.pickLayerColor,
      transparent: true,
      // wireframe: true,
    });
    this.pickBuildMeterial = new THREE.MeshBasicMaterial({
      transparent: true,
      vertexColors: true,
      // wireframe: true,
    });

    this.worker = new Build3DLayerWorker();
    this.worker.onmessage = (e) => {
      switch (e.data.key) {
        case "success": {
          break;
        }
        case "error": {
          break;
        }
      }
    };
  }

  // 设置拾取图层颜色
  setPickLayerColor(pickLayerColor) {
    this.pickLayerColor = pickLayerColor;
    this.pickLayerMeterial.setValues({ color: pickLayerColor });
    this.pickLayerMeterial.needsUpdate = true;
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      this.loadMesh();
    }
    if (type == MAP_EVENT.HANDLE_PICK_LEFT && data.layerId == this.id) {
      const pickColorNum = data.pickColor;
      // for (const tile of Object.values(this.tileMap)) {
      //   const item = tile.getBuildByPickColor(pickColorNum);

      //   if (item) {
      //     this.handleEventListener(type, item);
      //     break;
      //   }
      // }
    }
    if (type == MAP_EVENT.UPDATE_CAMERA_ROTATE) {
      const { newPitch } = data;
      const show3D = newPitch <= 80;
      if (this.show3D != show3D) {
        this.show3D = show3D;
        this.loadMesh();
      }
    }
  }

  onAdd(map) {
    super.onAdd(map);
    const { pitch } = map;
    const show3D = pitch <= 80;
    if (this.show3D != show3D) {
      this.show3D = show3D;
      this.loadMesh();
    }
    this.loadMesh();
  }

  render() {
    super.render();
  }

  setBuildColor(buildColor) {
    this.buildColor = buildColor;
    this.material.setValues({ color: buildColor });
    this.material.needsUpdate = true;
  }

  setBuildOpacity(buildOpacity) {
    this.buildOpacity = buildOpacity;
    this.material.setValues({ opacity: buildOpacity });
    this.material.needsUpdate = true;
  }

  handleLoadTile(tile) {
    if (this.loadingNum < 20) {
      this.loadingNum++;
      this.handleEventListener(MAP_EVENT.LAYER_LOADING, this.loadingNum > 0);
      tile.loadData().then((data) => {
        const pickColorOffset = this.pickColorNum;
        this.pickColorNum += data.length;
        tile.render(pickColorOffset);

        this.loadingNum--;
        this.handleEventListener(MAP_EVENT.LAYER_LOADING, this.loadingNum > 0);
        if (this._noLoadTileList.length > 0) {
          const _tile = this._noLoadTileList.shift();
          this.handleLoadTile(_tile);
        }
      });
    } else {
      this._noLoadTileList.push(tile);
    }
  }

  async loadMesh() {
    this.clearScene();
    const { row, col, size } = this.map.getTileRangeByZoom(BUILD_ZOOM);

    for (let i = row[0]; i <= row[1]; i++) {
      for (let j = col[0]; j <= col[1]; j++) {
        let key = `${i}_${j}`;
        let tile = this.tileMap[key];
        if (!tile) {
          tile = new BuildTile(i, j, this.material, this.pickLayerMeterial, this.pickBuildMeterial);
          this.tileMap[key] = tile;
          this.handleLoadTile(tile);
        }
        const [x, y] = this.map.WebMercatorToCanvasXY(tile.x, tile.y);

        if (this.show3D) {
          tile.baseMesh.scale.set(1, 1, 1);
          tile.pickLayerMesh.scale.set(1, 1, 1);
          tile.pickBuildMesh.scale.set(1, 1, 1);
        } else {
          tile.baseMesh.scale.set(1, 1, 0.000001);
          tile.pickLayerMesh.scale.set(1, 1, 0.000001);
          tile.pickBuildMesh.scale.set(1, 1, 0.000001);
        }

        tile.baseMesh.position.set(x, y, 0);
        this.scene.add(tile.baseMesh);

        tile.pickLayerMesh.position.set(x, y, 0);
        this.pickLayerScene.add(tile.pickLayerMesh);

        tile.pickBuildMesh.position.set(x, y, 0);
        this.pickMeshScene.add(tile.pickBuildMesh);
      }
    }
  }

  dispose() {
    super.dispose();
    this.material.dispose();
    this.pickLayerMeterial.dispose();
    this.pickBuildMeterial.dispose();
    for (const tile of Object.values(this.tileMap)) {
      tile.dispose();
    }
    this.tileMap = {};
  }
}
