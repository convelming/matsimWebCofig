import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
// import axios from "axios";

export class Build3DLayer extends Layer {
  name = "Build3DLayer";
  buildColor = "#ff4500";
  buildOpacity = 0.8;

  polygonMeshList = [];

  constructor(opt) {
    super(opt);
    this.buildColor = opt.buildColor || this.buildColor;
    this.buildOpacity = opt.buildOpacity || this.buildOpacity;

    this.polygonMaterial = new GeoJSONPolygonMaterial({
      transparent: true,
      color: this.buildColor,
      opacity: this.buildOpacity,
    });
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      for (const mesh of this.scene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
        mesh.position.set(x, y, mesh.position.z);
      }
      for (const mesh of this.pickLayerScene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
        mesh.position.set(x, y, mesh.position.z);
      }
      for (const mesh of this.pickMeshScene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
        mesh.position.set(x, y, mesh.position.z);
      }
    }
  }

  onAdd(map) {
    super.onAdd(map);
    this.updatePolygon();
  }

  setBuildColor(buildColor) {
    this.buildColor = buildColor;
    this.polygonMaterial.uniforms.diffuse.value = new THREE.Color(buildColor);
    this.polygonMaterial.needsUpdate = true;
  }

  setBuildOpacity(buildOpacity) {
    this.buildOpacity = buildOpacity;
    this.polygonMaterial.uniforms.opacity.value = buildOpacity;
    this.polygonMaterial.needsUpdate = true;
  }

  setData(data) {
    this.center = data.center;
    this.polygonArray = data.polygonArray;
    try {
      // this.jzgdList = data.propertiesLabels.Height.values; // 建筑高度
      this.jzgdList = data.propertiesLabels.build_high.values; // 建筑高度
    } catch (error) {
      this.jzgdList = []; // 建筑高度
    }
    try {
      // this.hbgdList = data.propertiesLabels.Sampled_SA.values; // 海拔高度
      this.hbgdList = data.propertiesLabels.dem.values; // 海拔高度
    } catch (error) {
      this.hbgdList = [];
    }
    this.updatePolygon();
  }

  clearPolygon() {
    for (const mesh of this.polygonMeshList) {
      mesh.removeFromParent();
      mesh.geometry.dispose();
    }
    this.polygonMeshList = [];
  }

  async updatePolygon() {
    this.clearPolygon();
    if (!this.polygonArray) return;
    let cx = 0,
      cy = 0;
    if (this.map) [cx, cy] = this.map.WebMercatorToCanvasXY(this.center[0], this.center[1]);
    const maxPolygon = 5000000;
    const polygonList = [];

    const addMesh = (list) => {
      const geometry = new BuildListGeometry(list, this.jzgdList, this.hbgdList);

      const mesh = new THREE.Mesh(geometry, this.polygonMaterial);
      mesh.position.set(cx, cy, 0.1);
      this.polygonMeshList.push(mesh);
      this.scene.add(mesh);

      list.length = 0;
      return new Promise((resolve) => setTimeout(resolve, 0));
    };

    for (let index = 0, l = this.polygonArray.length, num = 0, dataSize = this.polygonArray[0]; index < l; index += 1 + dataSize, dataSize = this.polygonArray[index]) {
      const polygon = this.polygonArray.slice(index + 1, index + 1 + dataSize);
      polygonList[polygonList.length] = polygon;
      if (index - num > maxPolygon) {
        num = index;
        console.log("addMesh",index)
        await addMesh(polygonList);
      }
    }

    if (polygonList.length > 0) {
      await addMesh(polygonList);
    }
  }
}

export class BuildListGeometry extends THREE.BufferGeometry {
  constructor(polygonList = [], jzgdList = [], hbgdList = []) {
    super();
    this.type = "BuildListGeometry";
    this.isBuildListGeometry = true;

    // buffers
    const indices = [];
    const vertices = [];
    const pickColors = [];
    const uvs = [];
    for (let i = 0; i < polygonList.length; i++) {
      const { shape, value } = getShape(polygonList[i]);
      addShape(shape, value);
    }
    // build geometry
    this.setIndex(indices);
    this.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    this.setAttribute("pickColor", new THREE.Float32BufferAttribute(pickColors, 3));
    this.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    this.computeVertexNormals();
    this.computeBoundingBox();
    // helper functions
    function addShape(shape, value) {
      const pickColor = new THREE.Color(value);

      const hbgd = hbgdList[value] || 0;
      const jzgd = jzgdList[value] || 3;

      const ldgd = jzgd + hbgd;

      const points = shape.extractPoints(12);

      let shapeVertices = points.shape;
      const shapeHoles = points.holes;

      // 把所有路径变成顺时针
      if (THREE.ShapeUtils.isClockWise(shapeVertices) === false) {
        shapeVertices = shapeVertices.reverse();
      }

      for (let i = 0, l = shapeHoles.length; i < l; i++) {
        const shapeHole = shapeHoles[i];
        if (THREE.ShapeUtils.isClockWise(shapeHole) === true) {
          shapeHoles[i] = shapeHole.reverse();
        }
      }
      // 根据路径和空洞生成面
      const faces = THREE.ShapeUtils.triangulateShape(shapeVertices, shapeHoles);
      for (let i = 0, l = shapeHoles.length; i < l; i++) {
        const shapeHole = shapeHoles[i];
        shapeVertices = shapeVertices.concat(shapeHole);
      }

      // 添加底面
      {
        const indicesOffset = vertices.length / 3;
        // 添加点，法向量，uv，保存点对应的valueKey
        for (let i = 0, l = shapeVertices.length; i < l; i++) {
          const vertex = shapeVertices[i];
          vertices.push(vertex.x, vertex.y, hbgd);
          pickColors.push(pickColor.r, pickColor.g, pickColor.b);
          // normals.push(0, 0, 1);
          uvs.push(vertex.x, vertex.y); // world uvs
        }
        // 添加面
        for (let i = 0, l = faces.length; i < l; i++) {
          const face = faces[i];
          const a = face[0] + indicesOffset;
          const b = face[1] + indicesOffset;
          const c = face[2] + indicesOffset;
          indices.push(a, b, c);
        }
      }

      // 添加顶面
      {
        const indicesOffset = vertices.length / 3;
        // 添加点，法向量，uv，保存点对应的valueKey
        for (let i = 0, l = shapeVertices.length; i < l; i++) {
          const vertex = shapeVertices[i];
          vertices.push(vertex.x, vertex.y, ldgd);
          pickColors.push(pickColor.r, pickColor.g, pickColor.b);
          uvs.push(vertex.x, vertex.y); // world uvs
        }
        // 添加面
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

          vertices.push(vertex1.x, vertex1.y, hbgd);
          vertices.push(vertex1.x, vertex1.y, ldgd);
          vertices.push(vertex2.x, vertex2.y, hbgd);
          vertices.push(vertex2.x, vertex2.y, ldgd);

          pickColors.push(pickColor.r, pickColor.g, pickColor.b);
          pickColors.push(pickColor.r, pickColor.g, pickColor.b);
          pickColors.push(pickColor.r, pickColor.g, pickColor.b);
          pickColors.push(pickColor.r, pickColor.g, pickColor.b);

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

          vertices.push(vertex1.x, vertex1.y, hbgd);
          vertices.push(vertex1.x, vertex1.y, ldgd);
          vertices.push(vertex2.x, vertex2.y, hbgd);
          vertices.push(vertex2.x, vertex2.y, ldgd);

          pickColors.push(pickColor.r, pickColor.g, pickColor.b);
          pickColors.push(pickColor.r, pickColor.g, pickColor.b);
          pickColors.push(pickColor.r, pickColor.g, pickColor.b);
          pickColors.push(pickColor.r, pickColor.g, pickColor.b);

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

    function getShape(array) {
      const value = array[0];
      const shapeArray = array.slice(1);
      let shape = null;
      for (let j = 0, l = shapeArray.length, size = shapeArray[0]; j < l; j += 1 + size, size = shapeArray[j]) {
        const v = shapeArray.slice(j + 1, j + 1 + size);
        const points = [];
        for (let k = 0, l3 = v.length / 2; k < l3; k++) {
          points[points.length] = new THREE.Vector2(v[k * 2 + 0], v[k * 2 + 1]);
        }
        if (!shape) {
          shape = new THREE.Shape(points);
        } else {
          const holePath = new THREE.Path(points);
          shape.holes.push(holePath);
        }
      }
      return { shape, value };
    }
  }
}

export class GeoJSONPolygonMaterial extends THREE.Material {
  constructor(argu) {
    super();
    this.isGeoJSONLineMaterial = true;
    this.side = THREE.DoubleSide;
    const { color = 0xff0000, opacity = 1, size = 50, colorBar = null, usePickColor = false, ...params } = argu || {};
    this.defines = {
      USE_COLOR_BAR: !!colorBar,
      USE_3D: false,
      USE_PICK_COLOR: usePickColor,
    };
    this.uniforms = {
      diffuse: {
        value: new THREE.Color(color),
      },
      opacity: {
        value: opacity,
      },
      size: {
        value: size,
      },
      colorBar: {
        value: !!colorBar ? colorBar : null,
      },
      minValue: {
        value: !!colorBar ? colorBar.min : 0,
      },
      maxValue: {
        value: !!colorBar ? colorBar.max : 1,
      },
      scale3D: {
        value: 1,
      },
    };
    this.vertexShader = `
      #include <common>
      #include <logdepthbuf_pars_vertex>


      attribute float value;
      attribute vec3 pickColor;
      
      varying vec3 vColor;
      varying vec3 vPickColor;
      varying vec2 vUv;
      varying float vValue;

      uniform float size;
      uniform mat3 uvTransform;
      uniform float maxValue;
      uniform float minValue;

      uniform float scale3D;

      void main() {
        vValue = value;
        vPickColor = pickColor;

        vec3 transformed = position;
        float p = (value - minValue) / (maxValue - minValue) + 0.1;
        
        #ifdef USE_3D
          transformed.z *= value * scale3D;
        #endif

        gl_Position = projectionMatrix * modelViewMatrix * vec4( transformed.xy, transformed.z + p, 1.0 );

        #include <logdepthbuf_vertex>

      }
    `;
    this.fragmentShader = `
      #include <common>
      #include <logdepthbuf_pars_fragment>

      uniform vec3 diffuse;
      uniform float opacity;
      uniform sampler2D map;
      uniform sampler2D colorBar;
      uniform float maxValue;
      uniform float minValue;
      
      varying vec3 vColor;
      varying vec3 vPickColor;
      varying vec2 vUv;
      varying float vValue;

      void main() {
        vec4 diffuseColor = vec4( diffuse, opacity );
        
        #include <logdepthbuf_fragment>
        
        #ifdef USE_COLOR_BAR
          float p = 0.0;
          if(maxValue != minValue) {
            p = (vValue - minValue) / (maxValue - minValue);
          }
          if(p > 1.0) p = 1.0;
          if(p < 0.0) p = 0.0;
          vec4 barDiffuseColor = texture2D(colorBar, vec2(p , 0.5));
          diffuseColor.rgb = barDiffuseColor.rgb;
          diffuseColor.a *= barDiffuseColor.a;
        #endif
        
        #ifdef USE_PICK_COLOR
          diffuseColor = vec4(vPickColor, 1.0);
        #endif

        gl_FragColor = diffuseColor;
      }
    `;
    this.setValues(params);
  }

  setColorBar(colorBar, USE_COLOR_BAR = true) {
    if (!!colorBar) {
      this.defines.USE_COLOR_BAR = USE_COLOR_BAR && true;
      this.uniforms.colorBar.value = colorBar.texture;
      this.uniforms.minValue.value = colorBar.min;
      this.uniforms.maxValue.value = colorBar.max;
    } else {
      this.defines.USE_COLOR_BAR = USE_COLOR_BAR && false;
      this.uniforms.colorBar.value = null;
      this.uniforms.minValue.value = 0;
      this.uniforms.maxValue.value = 1;
    }
    this.needsUpdate = true;
  }
}
