import * as THREE from "three";
import { GeoJSONLineListGeometry } from "./line";

export class GeoJSONPolygonListGeometry extends THREE.BufferGeometry {
  constructor(polygonList) {
    super();

    const propertiesIndexList = new Array();
    const attrIndex = new Array();
    const attrPosition = new Array();
    const attrPickColor = new Array();
    const attrUv = new Array();
    const attrSide = new Array();
    for (let i = 0, l = polygonList.length; i < l; i++) {
      const { propertiesIndex, geometry } = polygonList[i];
      const pickColor = new THREE.Color(propertiesIndex);
      for (const [shapePoints, ...holesPoints] of geometry) {
        const shape = new THREE.Shape(shapePoints.map((point) => new THREE.Vector2(point[0], point[1])));
        (holesPoints || []).forEach((holePoints) => {
          shape.holes.push(new THREE.Path(holePoints.map((point) => new THREE.Vector2(point[0], point[1]))));
        });
        const points = shape.extractPoints(1);
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
        // {
        //   const indexOffset = attrPosition.length / 3;
        //   // 添加点，法向量，uv，保存点对应的valueKey
        //   for (let i = 0, l = shapeVertices.length; i < l; i++) {
        //     const vertex = shapeVertices[i];
        //     attrPosition.push(vertex.x, vertex.y, 0);
        //     attrSide.push(1);
        //     attrPickColor.push(pickColor.r, pickColor.g, pickColor.b);
        //     attrUv.push(vertex.x, vertex.y);

        //     propertiesIndexList[propertiesIndexList.length] = propertiesIndex;
        //     values.push(0);
        //   }
        //   // 添加面
        //   for (let i = 0, l = faces.length; i < l; i++) {
        //     const face = faces[i];
        //     const a = face[0] + indexOffset;
        //     const b = face[1] + indexOffset;
        //     const c = face[2] + indexOffset;
        //     attrIndex.push(a, b, c);
        //   }
        // }

        // 添加顶面
        {
          const indexOffset = attrPosition.length / 3;
          // 添加点，法向量，uv，保存点对应的valueKey
          for (let i = 0, l = shapeVertices.length; i < l; i++) {
            const vertex = shapeVertices[i];
            attrPosition.push(vertex.x, vertex.y, 0);
            attrSide.push(1);
            attrPickColor.push(pickColor.r, pickColor.g, pickColor.b);
            attrUv.push(vertex.x, vertex.y);

            propertiesIndexList[propertiesIndexList.length] = propertiesIndex;
          }
          // 添加面
          for (let i = 0, l = faces.length; i < l; i++) {
            const face = faces[i];
            const a = face[0] + indexOffset;
            const b = face[1] + indexOffset;
            const c = face[2] + indexOffset;
            attrIndex.push(a, b, c);
          }
        }

        // 添加外墙壁
        {
          const indexOffset = attrPosition.length / 3;
          const shapeList = [...points.shape, points.shape[0]];
          for (let i = 0, l = shapeList.length - 1; i < l; i++) {
            const vertex1 = shapeList[i];
            const vertex2 = shapeList[i + 1];

            attrPosition.push(vertex1.x, vertex1.y, 0);
            attrPosition.push(vertex1.x, vertex1.y, 0);
            attrPosition.push(vertex2.x, vertex2.y, 0);
            attrPosition.push(vertex2.x, vertex2.y, 0);

            attrSide.push(0);
            attrSide.push(1);
            attrSide.push(0);
            attrSide.push(1);

            attrPickColor.push(pickColor.r, pickColor.g, pickColor.b);
            attrPickColor.push(pickColor.r, pickColor.g, pickColor.b);
            attrPickColor.push(pickColor.r, pickColor.g, pickColor.b);
            attrPickColor.push(pickColor.r, pickColor.g, pickColor.b);

            propertiesIndexList[propertiesIndexList.length] = propertiesIndex;
            propertiesIndexList[propertiesIndexList.length] = propertiesIndex;
            propertiesIndexList[propertiesIndexList.length] = propertiesIndex;
            propertiesIndexList[propertiesIndexList.length] = propertiesIndex;

            attrUv.push(vertex1.x, vertex1.y);
            attrUv.push(vertex1.x, vertex1.y);
            attrUv.push(vertex2.x, vertex2.y);
            attrUv.push(vertex2.x, vertex2.y);

            const a = i * 4 + indexOffset;
            const b = i * 4 + 1 + indexOffset;
            const c = i * 4 + 2 + indexOffset;
            const d = i * 4 + 3 + indexOffset;

            attrIndex.push(a, b, c);
            attrIndex.push(c, b, d);
          }
        }

        // 添加孔洞墙壁
        for (const holes of points.holes) {
          const indexOffset = attrPosition.length / 3;
          const holeList = [...holes, holes[0]];
          for (let i = 0, l = holeList.length - 1; i < l; i++) {
            const vertex1 = holeList[i];
            const vertex2 = holeList[i + 1];

            attrPosition.push(vertex1.x, vertex1.y, 0);
            attrPosition.push(vertex1.x, vertex1.y, 0);
            attrPosition.push(vertex2.x, vertex2.y, 0);
            attrPosition.push(vertex2.x, vertex2.y, 0);

            attrSide.push(0);
            attrSide.push(1);
            attrSide.push(0);
            attrSide.push(1);

            attrPickColor.push(pickColor.r, pickColor.g, pickColor.b);
            attrPickColor.push(pickColor.r, pickColor.g, pickColor.b);
            attrPickColor.push(pickColor.r, pickColor.g, pickColor.b);
            attrPickColor.push(pickColor.r, pickColor.g, pickColor.b);

            propertiesIndexList[propertiesIndexList.length] = propertiesIndex;
            propertiesIndexList[propertiesIndexList.length] = propertiesIndex;
            propertiesIndexList[propertiesIndexList.length] = propertiesIndex;
            propertiesIndexList[propertiesIndexList.length] = propertiesIndex;

            attrUv.push(vertex1.x, vertex1.y);
            attrUv.push(vertex1.x, vertex1.y);
            attrUv.push(vertex2.x, vertex2.y);
            attrUv.push(vertex2.x, vertex2.y);

            const a = i * 4 + indexOffset;
            const b = i * 4 + 1 + indexOffset;
            const c = i * 4 + 2 + indexOffset;
            const d = i * 4 + 3 + indexOffset;

            attrIndex.push(a, b, c);
            attrIndex.push(c, b, d);
          }
        }
      }
    }

    this.setIndex(attrIndex);
    this.setAttribute("position", new THREE.Float32BufferAttribute(attrPosition, 3));
    this.setAttribute("side", new THREE.Float32BufferAttribute(attrSide, 1));
    this.setAttribute("pickColor", new THREE.Float32BufferAttribute(attrPickColor, 3));
    this.setAttribute("uv", new THREE.Float32BufferAttribute(attrUv, 2));
    this.computeVertexNormals();
    this.computeBoundingBox();

    this.propertiesIndexList = propertiesIndexList;
  }

  updateHeight(heightList, defaultHeight = 0) {
    const attrHeight = new Array();
    for (let i = 0; i < this.propertiesIndexList.length; i++) {
      const index = this.propertiesIndexList[i];
      attrHeight[attrHeight.length] = heightList[index] || defaultHeight;
    }
    console.log(attrHeight);
    this.setAttribute("aHeight", new THREE.Float32BufferAttribute(attrHeight, 1));
    this.needsUpdate = true;
  }
  updateColor(colorList, defaultColor = [0, 0, 0]) {
    const attrColor = new Array();
    for (let i = 0; i < this.propertiesIndexList.length; i++) {
      const index = this.propertiesIndexList[i];
      const color = colorList[index] || defaultColor;
      attrColor[attrColor.length] = color[0];
      attrColor[attrColor.length] = color[1];
      attrColor[attrColor.length] = color[2];
    }
    console.log(attrColor);
    this.setAttribute("color", new THREE.Float32BufferAttribute(attrColor, 3));
    this.needsUpdate = true;
  }
}

export class GeoJSONPolygonMaterial extends THREE.MeshBasicMaterial {
  height = 0;
  usePickColor = false;
  vertexHeights = false;

  constructor(argu) {
    const { height = 0, usePickColor = false, vertexHeights = false, ...params } = argu || {};
    super(params);
    this.height = height;
    this.usePickColor = usePickColor;
    this.vertexHeights = vertexHeights;
    // this.wireframe = true

    this.onBeforeCompile = (shader) => {
      this.userData.shader = shader;
      this.updataUserValues();

      shader.vertexShader = shader.vertexShader.replace(
        "#include <common>",
        `
        #include <common>
        
        attribute float side;
        attribute float aHeight;
        attribute vec3 pickColor;

        uniform float height;
        uniform bool vertexHeights;

        varying vec3 vPickColor;

      `,
      );
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `
          vPickColor = pickColor;
          #include <begin_vertex>
          if(vertexHeights) {
            transformed.z += aHeight * side;
          } else {
            transformed.z += height * side;
          }
        `,
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <common>",
        `
          #include <common>
          
          uniform bool usePickColor;
          varying vec3 vPickColor;
        `,
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <color_fragment>",
        `
          if(usePickColor) {
            diffuseColor = vec4(vPickColor, 1.0);
          } else {
            #include <color_fragment>
          }
        `,
      );
    };
  }
  updataUserValues() {
    if (this.userData.shader) {
      this.userData.shader.uniforms.height = { value: this.height };
      this.userData.shader.uniforms.vertexHeights = { value: this.vertexHeights };
      this.userData.shader.uniforms.usePickColor = { value: this.usePickColor };
    }
  }
  setValues(argu) {
    super.setValues(argu);
    this.updataUserValues();
  }
}

export class GeoJSONPolygonBorderListGeometry extends GeoJSONLineListGeometry {
  constructor(polygonList) {
    const lineList = [];
    for (let i = 0, l = polygonList.length; i < l; i++) {
      const { propertiesIndex, geometry } = polygonList[i];
      const lineGeometry = [];
      for (const polygon of geometry) {
        for (let i = 0, l = polygon.length; i < l; i++) {
          const points = polygon[i].map((point) => new THREE.Vector2(point[0], point[1]));
          if (i == 0 && THREE.ShapeUtils.isClockWise(points) === false) {
            points.reverse();
            lineGeometry.push(points.map((point) => point.toArray()));
          } else if (THREE.ShapeUtils.isClockWise(points) === true) {
            points.reverse();
            lineGeometry.push(points.map((point) => point.toArray()));
          }
        }
      }
      lineList.push({
        propertiesIndex,
        geometry: lineGeometry,
      });
    }
    super(lineList);
  }
}
