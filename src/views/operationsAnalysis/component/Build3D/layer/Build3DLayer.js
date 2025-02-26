import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { guid } from "@/utils/utils";

import { getTileFacilities } from "@/api/index";

const BUILD_ZOOM = 11;
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
      for (const tile of Object.values(this.tileMap)) {
        const item = tile.getBuildByPickColor(pickColorNum);

        if (item) {
          this.handleEventListener(type, item); 
          break;
          // console.log(pickColorNum, item);
        }
      }
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
    this.material.dispose();
    this.pickLayerMeterial.dispose();
    this.pickBuildMeterial.dispose();
    for (const tile of Object.values(this.tileMap)) {
      tile.dispose();
    }
    this.tileMap = {};
  }
}

export class BuildTile {
  _loadNum = 0;

  // 加载状态 1未加载 2加载成功 3加载失败 4加载中 5已卸载
  _loadStatus = 1;

  _pickColorOffset = 0;

  get loadStatus() {
    return this._loadStatus;
  }
  get row() {
    return this._row;
  }
  get col() {
    return this._col;
  }
  get x() {
    return this._x;
  }
  get y() {
    return this._y;
  }
  get geometry() {
    return this._geometry;
  }
  get baseMesh() {
    return this._baseMesh;
  }
  get pickLayerMesh() {
    return this._pickLayerMesh;
  }
  get pickBuildMesh() {
    return this._pickBuildMesh;
  }

  constructor(row, col, baseMaterial, pickLayerMeterial, pickBuildMeterial) {
    this._uuid = guid();
    this._row = row;
    this._col = col;
    this._x = ((row + 0.5) * (EARTH_RADIUS * 2)) / Math.pow(2, BUILD_ZOOM) - EARTH_RADIUS;
    this._y = EARTH_RADIUS - ((col + 0.5) * (EARTH_RADIUS * 2)) / Math.pow(2, BUILD_ZOOM);

    this.data = [];
    this._geometry = new THREE.BufferGeometry();

    this._baseMesh = new THREE.Mesh(this._geometry, baseMaterial);
    this._pickLayerMesh = new THREE.Mesh(this._geometry, pickLayerMeterial);
    this._pickBuildMesh = new THREE.Mesh(this._geometry, pickBuildMeterial);
  }

  async loadData() {
    try {
      this._loadStatus = 4;
      if (this._geometry) {
        this._geometry.dispose();
      }
      const { data } = await getTileFacilities({ x: this._row, y: this._col });
      this.data = data;
      this._loadStatus = 2;
    } catch (error) {
      this._loadStatus = 3;
    }
    return this.data;
  }

  render(pickColorOffset) {
    if (this._geometry) {
      this._geometry.dispose();
    }
    this._pickColorOffset = pickColorOffset;
    if (this.data && this.data.length > 0) {
      const geometryList = [];
      for (let i = 0, l = this.data.length; i < l; i++) {
        const v = this.data[i];
        if (!v) continue;
        v.pickColorNum = this._pickColorOffset + i + 1;
        const pickColor = new THREE.Color(v.pickColorNum);
        const shapes = [
          {
            points: v.coordinates[0],
            holes: v.coordinates.slice(1),
          },
        ];
        geometryList.push(new BuildGeometry({ shapes, height: v.height, color: pickColor }));
      }

      this._geometry = BufferGeometryUtils.mergeBufferGeometries(geometryList, false);
    } else {
      this._geometry = new THREE.BufferGeometry();
    }

    this._baseMesh.geometry = this._geometry;
    this._baseMesh.needsUpdate = true;
    this._pickLayerMesh.geometry = this._geometry;
    this._pickLayerMesh.needsUpdate = true;
    this._pickBuildMesh.geometry = this._geometry;
    this._pickBuildMesh.needsUpdate = true;
  }

  // async load(layer) {
  //   try {
  //     this._loadStatus = 4;
  //     if (this._geometry) {
  //       this._geometry.dispose();
  //     }
  //     const { data } = await getTileFacilities({ x: this._row, y: this._col });
  //     if (data && data.length > 0) {
  //       const geometryList = [];
  //       for (let i = 0, l = data.length; i < l; i++) {
  //         const v = data[i];
  //         if (!v) continue;
  //         v.pickColorNum = ++layer.pickColorNum;
  //         const pickColor = new THREE.Color(v.pickColorNum);
  //         const shapes = [
  //           {
  //             points: v.coordinates[0],
  //             holes: v.coordinates.slice(1),
  //           },
  //         ];
  //         geometryList.push(new BuildGeometry({ shapes, height: v.height, color: pickColor }));
  //         this._data.set(v.pickColorNum, v);
  //       }

  //       this._geometry = BufferGeometryUtils.mergeBufferGeometries(geometryList, false);
  //     } else {
  //       this._geometry = new THREE.BufferGeometry();
  //     }
  //     this._loadStatus = 2;
  //   } catch (error) {
  //     this._geometry = new THREE.BufferGeometry();
  //     this._loadStatus = 3;
  //     console.log(this._row, this._col, error);
  //   }

  //   this._baseMesh.geometry = this._geometry;
  //   this._baseMesh.needsUpdate = true;
  //   this._pickLayerMesh.geometry = this._geometry;
  //   this._pickLayerMesh.needsUpdate = true;
  //   this._pickBuildMesh.geometry = this._geometry;
  //   this._pickBuildMesh.needsUpdate = true;
  //   return this;
  // }

  getBuildByPickColor(pickColor) {
    return this.data[pickColor - this._pickColorOffset - 1];
  }

  dispose() {
    this._geometry.dispose();
    this._loadStatus = 5;
  }
}

export class BuildGeometry extends THREE.BufferGeometry {
  constructor({ shapes = [], curveSegments = 12, height = 10, color = new THREE.Color(0xff0000) }) {
    super();

    this.type = "BuildGeometry";

    const colors = [];
    const indices = [];
    const vertices = [];
    const normals = [];
    const uvs = [];

    for (const item of shapes) {
      const shape = new THREE.Shape(item.points.map((v) => new THREE.Vector2(v[0], v[1])));
      for (const item2 of item.holes) {
        const holePath = new THREE.Path(item2.map((v) => new THREE.Vector2(v[0], v[1])));
        shape.holes.push(holePath);
      }
      addShape(shape);
    }

    for (let i = 0, l = vertices.length / 3; i < l; i++) {
      colors.push(color.r, color.g, color.b);
    }

    this.setIndex(indices);
    this.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    this.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    // this.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    this.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    this.computeVertexNormals();

    function addShape(shape) {
      const points = shape.extractPoints(curveSegments);

      // 把所有路径变成顺时针
      if (THREE.ShapeUtils.isClockWise(points.shape) === false) {
        points.shape = points.shape.reverse();
      }
      for (let i = 0, l = points.holes.length; i < l; i++) {
        const shapeHole = points.holes[i];
        if (THREE.ShapeUtils.isClockWise(shapeHole) === true) {
          points.holes[i] = shapeHole.reverse();
        }
      }

      // 根据路径和空洞生成面
      const faces = THREE.ShapeUtils.triangulateShape(points.shape, points.holes);

      const shapeVertices = [].concat(points.shape);
      for (let i = 0, l = points.holes.length; i < l; i++) {
        const shapeHole = points.holes[i];
        for (const vec2 of shapeHole) {
          shapeVertices[shapeVertices.length] = vec2;
        }
      }

      // 添加底面
      {
        for (let i = 0, l = shapeVertices.length; i < l; i++) {
          const vertex = shapeVertices[i];

          vertices.push(vertex.x, vertex.y, 0);
          // normals.push(0, 0, -1);
          uvs.push(vertex.x, vertex.y); // world uvs
        }

        for (let i = 0, l = faces.length; i < l; i++) {
          const face = faces[i];

          const a = face[0];
          const b = face[1];
          const c = face[2];

          indices.push(c, b, a);
        }
      }
      // 添加顶面
      {
        const indicesOffset = vertices.length / 3;
        for (let i = 0, l = shapeVertices.length; i < l; i++) {
          const vertex = shapeVertices[i];

          vertices.push(vertex.x, vertex.y, height);
          // normals.push(0, 0, 1);
          uvs.push(vertex.x, vertex.y); // world uvs
        }

        for (let i = 0, l = faces.length; i < l; i++) {
          const face = faces[i];

          const a = face[0] + indicesOffset;
          const b = face[1] + indicesOffset;
          const c = face[2] + indicesOffset;

          indices.push(a, b, c);
        }
      }

      // 添加外墙壁
      {
        const indicesOffset = vertices.length / 3;
        const shapeList = [...points.shape, points.shape[0]];
        for (let i = 0, l = shapeList.length - 1; i < l; i++) {
          const vertex1 = shapeList[i];
          const vertex2 = shapeList[i + 1];

          vertices.push(vertex1.x, vertex1.y, 0);
          vertices.push(vertex1.x, vertex1.y, height);
          vertices.push(vertex2.x, vertex2.y, 0);
          vertices.push(vertex2.x, vertex2.y, height);

          // normals.push(0, 0, -1);
          // normals.push(0, 0, -1);
          // normals.push(0, 0, -1);
          // normals.push(0, 0, -1);
          uvs.push(vertex1.x, vertex1.y); // world uvs
          uvs.push(vertex1.x, vertex1.y); // world uvs
          uvs.push(vertex2.x, vertex2.y); // world uvs
          uvs.push(vertex2.x, vertex2.y); // world uvs

          const a = i * 4 + indicesOffset;
          const b = i * 4 + 1 + indicesOffset;
          const c = i * 4 + 2 + indicesOffset;
          const d = i * 4 + 3 + indicesOffset;

          indices.push(a, b, c);
          indices.push(c, b, d);
        }
      }

      // 添加孔洞墙壁
      for (const holes of points.holes) {
        const indicesOffset = vertices.length / 3;
        const holeList = [...holes, holes[0]];
        for (let i = 0, l = holeList.length - 1; i < l; i++) {
          const vertex1 = holeList[i];
          const vertex2 = holeList[i + 1];

          vertices.push(vertex1.x, vertex1.y, 0);
          vertices.push(vertex1.x, vertex1.y, height);
          vertices.push(vertex2.x, vertex2.y, 0);
          vertices.push(vertex2.x, vertex2.y, height);

          // normals.push(0, 0, -1);
          // normals.push(0, 0, -1);
          // normals.push(0, 0, -1);
          // normals.push(0, 0, -1);
          uvs.push(vertex1.x, vertex1.y); // world uvs
          uvs.push(vertex1.x, vertex1.y); // world uvs
          uvs.push(vertex2.x, vertex2.y); // world uvs
          uvs.push(vertex2.x, vertex2.y); // world uvs

          const a = i * 4 + indicesOffset;
          const b = i * 4 + 1 + indicesOffset;
          const c = i * 4 + 2 + indicesOffset;
          const d = i * 4 + 3 + indicesOffset;

          indices.push(a, b, c);
          indices.push(c, b, d);
        }
      }
    }
  }
}
