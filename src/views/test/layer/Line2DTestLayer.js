import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap";
import { Line2DGeometry, Line2DMaterial } from "@/mymap/geometry/Line2D";


export class Line2DTestLayer extends Layer {
  get pickNum() {
    return pickNum;
  }
  constructor(opt) {
    super(opt);
    const geometry = new THREE.PlaneGeometry(500, 500);
    const colors = [new THREE.Color(0xff0000).toArray(), new THREE.Color(0x00ff00).toArray(), new THREE.Color(0x0000ff).toArray(), new THREE.Color(0x000000).toArray()].flat();
    geometry.setAttribute("pickColor", new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute("arr", new THREE.Float32BufferAttribute(colors, 3));

    // const matrix4 = new THREE.Matrix4();
    // matrix4.setPosition(new THREE.Vector3(250, 0, 0));
    // geometry.applyMatrix4(matrix4);

    const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0xff00cc, vertexColors: true }));
    // mesh.rotateZ(Math.PI * 1.5);
    mesh.position.y = 600;
    this.scene.add(mesh);

    // const mesh2 = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
    // mesh2.rotateZ(Math.PI / 0.6);
    // this.scene.add(mesh2);

    // const mesh3 = new THREE.Mesh(new THREE.CircleGeometry(50, 9), new THREE.MeshBasicMaterial({ color: 0x0000ff }));
    // this.scene.add(mesh3);

    const texture = new THREE.TextureLoader().load(require("@/assets/image/address.png"));
    // geometry = new Line2DGeometry();
    const material = new Line2DMaterial({ color: 0xff00cc, map: texture });
    const line = new THREE.Mesh(geometry, material);
    this.scene.add(line);
  }
  render() {
    super.render();
    // this.material.textureOffset((x, y) => [x + 0.01 >= 1 ? -1 : x + 0.01, y]);
  }
}
