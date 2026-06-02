import * as THREE from "three";

export class GeoJSONPointListGeometry extends THREE.BufferGeometry {
  propertiesIndexList = [];
  constructor(pointList) {
    super();
    const propertiesIndexList = new Array();
    const attrPosition = new Array();
    const attrColor = new Array();
    const attrPickColor = new Array();
    const attrNormal = new Array();
    const attrSide = new Array();
    const attrUv = new Array();
    const attrIndex = new Array();

    for (let i = 0, l = pointList.length; i < l; i++) {
      const { propertiesIndex, geometry } = pointList[i];
      const pickColor = new THREE.Color(propertiesIndex);
      for (const point of geometry) {
        const [x, y, z = 0] = point;
        for (let i2 = 0; i2 < 4; i2++) {
          attrPosition[attrPosition.length] = x;
          attrPosition[attrPosition.length] = y;
          attrPosition[attrPosition.length] = z;
          attrPickColor[attrPickColor.length] = pickColor.r;
          attrPickColor[attrPickColor.length] = pickColor.g;
          attrPickColor[attrPickColor.length] = pickColor.b;
          attrColor[attrColor.length] = pickColor.r;
          attrColor[attrColor.length] = pickColor.g;
          attrColor[attrColor.length] = pickColor.b;
          attrNormal[attrNormal.length] = 0;
          attrNormal[attrNormal.length] = 0;
          attrNormal[attrNormal.length] = 1;
          attrSide[attrSide.length] = i2;

          propertiesIndexList[propertiesIndexList.length] = propertiesIndex;
        }

        // 0 2
        // 1 3
        attrUv[attrUv.length] = 0;
        attrUv[attrUv.length] = 1;

        attrUv[attrUv.length] = 0;
        attrUv[attrUv.length] = 0;

        attrUv[attrUv.length] = 1;
        attrUv[attrUv.length] = 1;

        attrUv[attrUv.length] = 1;
        attrUv[attrUv.length] = 0;

        const i1 = attrIndex.length / 6;
        attrIndex[attrIndex.length] = i1 * 4 + 0;
        attrIndex[attrIndex.length] = i1 * 4 + 1;
        attrIndex[attrIndex.length] = i1 * 4 + 3;
        attrIndex[attrIndex.length] = i1 * 4 + 0;
        attrIndex[attrIndex.length] = i1 * 4 + 3;
        attrIndex[attrIndex.length] = i1 * 4 + 2;
      }
    }

    this.setAttribute("position", new THREE.Float32BufferAttribute(attrPosition, 3));
    this.setAttribute("uv", new THREE.Float32BufferAttribute(attrUv, 2));
    this.setAttribute("color", new THREE.Float32BufferAttribute(attrColor, 3));
    this.setAttribute("pickColor", new THREE.Float32BufferAttribute(attrPickColor, 3));
    this.setAttribute("normal", new THREE.Float32BufferAttribute(attrNormal, 3));
    this.setAttribute("side", new THREE.Float32BufferAttribute(attrSide, 1));
    this.setIndex(attrIndex);
    // this.computeVertexNormals();
    this.computeBoundingBox();

    this.propertiesIndexList = propertiesIndexList;
  }

  updateSort(sortList) {
    const attrSort = new Array();
    for (let i = 0; i < this.propertiesIndexList.length; i++) {
      const index = this.propertiesIndexList[i];
      attrSort[attrSort.length] = sortList[index] || 0;
    }
    this.setAttribute("asort", new THREE.Float32BufferAttribute(attrSort, 1));
    this.needsUpdate = true;
  }
  updateSize(sizeList, defaultSize = 10) {
    const attrSize = new Array();
    for (let i = 0; i < this.propertiesIndexList.length; i++) {
      const index = this.propertiesIndexList[i];
      attrSize[attrSize.length] = sizeList[index] || defaultSize;
    }
    this.setAttribute("asize", new THREE.Float32BufferAttribute(attrSize, 1));
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
    this.setAttribute("color", new THREE.Float32BufferAttribute(attrColor, 3));
    this.needsUpdate = true;
  }
}

export class GeoJSONPointMaterial extends THREE.MeshBasicMaterial {
  size = 50;
  scale = 50;
  vertexSizes = false;
  usePickColor = false;

  constructor(argu) {
    const { size = 50, scale = 1, vertexSizes = false, usePickColor = false, ...params } = argu || {};
    super(params);
    // 解决点叠加时显示不全问题
    this.alphaTest = 0.2;
    this.depthWrite = false;

    this.size = size;
    this.scale = scale;
    this.vertexSizes = vertexSizes;
    this.usePickColor = usePickColor;

    this.onBeforeCompile = (shader) => {
      this.userData.shader = shader;
      this.updataUserValues();

      shader.vertexShader = shader.vertexShader.replace(
        "#include <common>",
        `
        #include <common>
        
        attribute float side;
        attribute float asort;
        attribute float asize;
        attribute vec3 pickColor;

        uniform float size;
        uniform float scale;
        uniform bool vertexSizes;
        uniform bool usePickColor;

        varying vec3 vPickColor;

      `,
      );
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `
          vPickColor = pickColor;
          #include <begin_vertex>
          // 0 2
          // 1 3 
          float _size = (vertexSizes ? asize : size) * scale;
          if(side == 0.0) {
            transformed.x = position.x - _size / 2.0;
            transformed.y = position.y + _size / 2.0;
            transformed.z = position.z + asort;
          } else if(side == 1.0) {
            transformed.x = position.x - _size / 2.0;
            transformed.y = position.y - _size / 2.0;
            transformed.z = position.z + asort;
          } else if(side == 2.0) {
            transformed.x = position.x + _size / 2.0;
            transformed.y = position.y + _size / 2.0;
            transformed.z = position.z;
          } else if(side == 3.0) {
            transformed.x = position.x + _size / 2.0;
            transformed.y = position.y - _size / 2.0;
            transformed.z = position.z + asort;
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
            diffuseColor = vec4(vPickColor, 1);
          } else {
            #include <color_fragment>
          }
        `,
      );
    };
  }

  updataUserValues() {
    if (this.userData.shader) {
      this.userData.shader.uniforms.size = { value: this.size };
      this.userData.shader.uniforms.scale = { value: this.scale };
      this.userData.shader.uniforms.vertexSizes = { value: this.vertexSizes };
      this.userData.shader.uniforms.usePickColor = { value: this.usePickColor };
    }
  }

  setValues(argu) {
    super.setValues(argu);
    this.updataUserValues();
  }
}
