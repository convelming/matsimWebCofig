import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";

export class PolygonsLayer extends Layer {
  name = "PolygonLayer";
  color = 0x409eff;
  opacity = 0.5;
  paths = [];
  groupList = [];

  constructor(opt) {
    super(opt);
    this.color = opt.color || 0x409eff;
    this.opacity = opt.opacity || 0.5;
    this.material1 = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: this.opacity,
      color: new THREE.Color(this.color),
      depthFunc: THREE.AlwaysDepth,
      alphaTest: 0.2,
      // depthWrite: false
    });

    this.material2 = new THREE.MeshBasicMaterial({
      transparent: true,
      color: new THREE.Color(this.color),
      depthFunc: THREE.AlwaysDepth,
      alphaTest: 0.2,
      // depthWrite: false
    });
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      for (const group of this.groupList) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...group.userData.center);
        group.position.set(x, y, 0);
      }
    }
  }

  setPaths(paths) {
    this.paths = paths;
    this.update();
  }

  update() {
    this.clearScene();
    if (!this.paths) return;
    this.groupList = [];
    for (const path of this.paths) {
      const group = new THREE.Group();
      const [cx, cy] = path[0];
      const points = path.map(([x, y]) => new THREE.Vector2(x - cx, y - cy));

      const geometry1 = new THREE.ShapeGeometry(new THREE.Shape(points));
      const mesh = new THREE.Mesh(geometry1, this.material1);

      const geometry2 = new THREE.BufferGeometry();
      geometry2.setFromPoints(points);
      const line = new THREE.LineLoop(geometry2, this.material2);

      group.add(mesh, line);
      group.userData.center = [cx, cy];
      this.groupList.push(group);

      this.scene.add(group);
    }
    if (this.map) this.on(MAP_EVENT.UPDATE_CENTER);
  }

  onAdd(map) {
    super.onAdd(map);
    this.on(MAP_EVENT.UPDATE_CENTER);
  }

  // update() {
  //   const [cx, cy] = this.center;
  //   const path = this.path.map(([x, y]) => new THREE.Vector2(x - cx, y - cy));
  //   path.push(new THREE.Vector2(this.movePoint[0] - cx, this.movePoint[1] - cy));
  //   const shape = new THREE.Shape(path);
  //   const points = shape.extractPoints(12);

  //   let shapeVertices = points.shape;
  //   const shapeHoles = points.holes;

  //   const indices = [];
  //   const vertices = [];
  //   const normals = [];
  //   const uvs = [];

  //   // check direction of vertices
  //   if (THREE.ShapeUtils.isClockWise(shapeVertices) === false) {
  //     shapeVertices = shapeVertices.reverse();
  //   }
  //   for (let i = 0, l = shapeHoles.length; i < l; i++) {
  //     const shapeHole = shapeHoles[i];
  //     if (THREE.ShapeUtils.isClockWise(shapeHole) === true) {
  //       shapeHoles[i] = shapeHole.reverse();
  //     }
  //   }
  //   const faces = THREE.ShapeUtils.triangulateShape(shapeVertices, shapeHoles);
  //   // join vertices of inner and outer paths to a single array
  //   for (let i = 0, l = shapeHoles.length; i < l; i++) {
  //     const shapeHole = shapeHoles[i];
  //     shapeVertices = shapeVertices.concat(shapeHole);
  //   }
  //   // vertices, normals, uvs
  //   for (let i = 0, l = shapeVertices.length; i < l; i++) {
  //     const vertex = shapeVertices[i];
  //     vertices.push(vertex.x, vertex.y, 0);
  //     normals.push(0, 0, 1);
  //     uvs.push(vertex.x, vertex.y); // world uvs
  //   }

  //   // indices
  //   for (let i = 0, l = faces.length; i < l; i++) {
  //     const face = faces[i];
  //     const a = face[0];
  //     const b = face[1];
  //     const c = face[2];
  //     indices.push(a, b, c);
  //   }

  //   this.geometry1.setIndex(indices);
  //   this.geometry1.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  //   this.geometry1.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  //   this.geometry1.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  //   this.geometry1.needsUpdate = true;
  //   this.geometry1.computeBoundingSphere();

  //   this.geometry2.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  //   this.geometry2.needsUpdate = true;
  //   this.geometry2.computeBoundingSphere();

  //   const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
  //   this.mesh1.position.set(x, y, 0);
  //   this.mesh2.position.set(x, y, 0);
  // }
}
