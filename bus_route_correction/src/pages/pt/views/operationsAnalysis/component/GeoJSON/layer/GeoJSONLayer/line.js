import * as THREE from "three";

export const LINE_STYLE = {
  NONE: 1, // 不显示
  SOLID: 2, // 实线
  DASHED: 3, // 虚线
};

export const LINE_WIDTH_STYLE = {
  UNAUTO: 1, // 固定值
  AUTO: 2, // 根据数据值变化
};

export class GeoJSONLineListGeometry extends THREE.BufferGeometry {
  constructor(lineList) {
    super();

    const propertiesIndexList = new Array();
    const attrPosition = new Array();
    const attrPosition2 = new Array();
    const attrPickColor = new Array();
    const attrSide = new Array();
    const attrDistance = new Array();
    // const attrUv = new Array();
    const attrIndex = new Array();

    let indexOffset = 0;

    for (let i = 0, l = lineList.length; i < l; i++) {
      const { propertiesIndex, geometry } = lineList[i];
      const pickColor = new THREE.Color(propertiesIndex);
      for (const line of geometry) {
        const startIndexOffset = indexOffset;
        let distance = 0;
        for (let i2 = 0; i2 < line.length - 1; i2++) {
          const [x, y, z = 0] = line[i2];
          const [x2, y2, z2 = 0] = line[i2 + 1];
          // 0 1
          // 2 3

          // 添加form
          attrPosition[attrPosition.length] = x;
          attrPosition[attrPosition.length] = y;
          attrPosition[attrPosition.length] = z;
          attrPosition[attrPosition.length] = x;
          attrPosition[attrPosition.length] = y;
          attrPosition[attrPosition.length] = z;

          attrPosition2[attrPosition2.length] = x2;
          attrPosition2[attrPosition2.length] = y2;
          attrPosition2[attrPosition2.length] = z2;
          attrPosition2[attrPosition2.length] = x2;
          attrPosition2[attrPosition2.length] = y2;
          attrPosition2[attrPosition2.length] = z2;

          attrPickColor[attrPickColor.length] = pickColor.r;
          attrPickColor[attrPickColor.length] = pickColor.g;
          attrPickColor[attrPickColor.length] = pickColor.b;
          attrPickColor[attrPickColor.length] = pickColor.r;
          attrPickColor[attrPickColor.length] = pickColor.g;
          attrPickColor[attrPickColor.length] = pickColor.b;

          attrSide[attrSide.length] = 1;
          attrSide[attrSide.length] = -1;
          attrSide[attrSide.length] = 1;
          attrSide[attrSide.length] = 1;

          attrDistance[attrDistance.length] = distance;
          attrDistance[attrDistance.length] = distance;

          distance += Math.sqrt(Math.pow(x - x2, 2) + Math.pow(y - y2, 2));

          attrDistance[attrDistance.length] = distance;
          attrDistance[attrDistance.length] = distance;

          // 添加to点

          attrPosition[attrPosition.length] = x2;
          attrPosition[attrPosition.length] = y2;
          attrPosition[attrPosition.length] = 0;
          attrPosition[attrPosition.length] = x2;
          attrPosition[attrPosition.length] = y2;
          attrPosition[attrPosition.length] = 0;

          attrPosition2[attrPosition2.length] = x;
          attrPosition2[attrPosition2.length] = y;
          attrPosition2[attrPosition2.length] = 0;
          attrPosition2[attrPosition2.length] = x;
          attrPosition2[attrPosition2.length] = y;
          attrPosition2[attrPosition2.length] = 0;

          attrPickColor[attrPickColor.length] = pickColor.r;
          attrPickColor[attrPickColor.length] = pickColor.g;
          attrPickColor[attrPickColor.length] = pickColor.b;
          attrPickColor[attrPickColor.length] = pickColor.r;
          attrPickColor[attrPickColor.length] = pickColor.g;
          attrPickColor[attrPickColor.length] = pickColor.b;

          attrSide[attrSide.length] = -1;
          attrSide[attrSide.length] = -1;
          attrSide[attrSide.length] = -1;
          attrSide[attrSide.length] = 1;

          // 线段面
          attrIndex[attrIndex.length] = indexOffset + 0;
          attrIndex[attrIndex.length] = indexOffset + 1;
          attrIndex[attrIndex.length] = indexOffset + 3;
          attrIndex[attrIndex.length] = indexOffset + 0;
          attrIndex[attrIndex.length] = indexOffset + 3;
          attrIndex[attrIndex.length] = indexOffset + 2;

          // 线段之间的连接面
          if (i2 > 0) {
            attrIndex[attrIndex.length] = indexOffset + 0 - 2;
            attrIndex[attrIndex.length] = indexOffset + 1 - 2;
            attrIndex[attrIndex.length] = indexOffset + 3 - 2;
            attrIndex[attrIndex.length] = indexOffset + 1 - 2;
            attrIndex[attrIndex.length] = indexOffset + 2 - 2;
            attrIndex[attrIndex.length] = indexOffset + 0 - 2;
          }

          indexOffset += 4;

          propertiesIndexList[propertiesIndexList.length] = propertiesIndex;
          propertiesIndexList[propertiesIndexList.length] = propertiesIndex;
          propertiesIndexList[propertiesIndexList.length] = propertiesIndex;
          propertiesIndexList[propertiesIndexList.length] = propertiesIndex;
        }
        // 添加头尾线段的连接面
        // {
        //   attrIndex[attrIndex.length] = indexOffset - 1;
        //   attrIndex[attrIndex.length] = startIndexOffset + 1;
        //   attrIndex[attrIndex.length] = startIndexOffset + 0;

        //   attrIndex[attrIndex.length] = startIndexOffset + 1;
        //   attrIndex[attrIndex.length] = indexOffset - 2;
        //   attrIndex[attrIndex.length] = startIndexOffset + 0;
        // }
      }
    }

    this.setAttribute("position", new THREE.Float32BufferAttribute(attrPosition, 3));
    this.setAttribute("position2", new THREE.Float32BufferAttribute(attrPosition2, 3));
    this.setAttribute("pickColor", new THREE.Float32BufferAttribute(attrPickColor, 3));
    this.setAttribute("side", new THREE.Float32BufferAttribute(attrSide, 2));
    this.setAttribute("distance", new THREE.Float32BufferAttribute(attrDistance, 1));
    this.setIndex(attrIndex);
    this.computeVertexNormals();
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
  }
  updateWidth(widthList, defaultWidth = 10) {
    const attrWidth = new Array();
    for (let i = 0; i < this.propertiesIndexList.length; i++) {
      const index = this.propertiesIndexList[i];
      attrWidth[attrWidth.length] = widthList[index] || defaultWidth;
    }
    this.setAttribute("awidth", new THREE.Float32BufferAttribute(attrWidth, 1));
  }

  updateOffset(offsetList, defaultOffset = 10) {
    const attrOffset = new Array();
    for (let i = 0; i < this.propertiesIndexList.length; i++) {
      const index = this.propertiesIndexList[i];
      attrOffset[attrOffset.length] = offsetList[index] || defaultOffset;
    }
    this.setAttribute("aoffset", new THREE.Float32BufferAttribute(attrOffset, 1));
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

export class GeoJSONLineMaterial extends THREE.MeshBasicMaterial {
  width = 1;
  offset = 0;
  scale = 1;
  style = LINE_STYLE.SOLID;
  vertexWidths = false;
  vertexOffsets = false;
  usePickColor = false;

  constructor(argu) {
    const { width = 50, offset = 0, scale = 1, vertexWidths = false, vertexOffsets = false, style = LINE_STYLE.SOLID, usePickColor = false, ...params } = argu || {};
    super(params);
    this.alphaTest = 0.1;
    // this.wireframe = true;
    // this.side = THREE.DoubleSide;

    this.width = width;
    this.offset = offset;
    this.style = style;
    this.scale = scale;
    this.vertexWidths = vertexWidths;
    this.vertexOffsets = vertexOffsets;
    this.usePickColor = usePickColor;

    this.onBeforeCompile = (shader) => {
      this.userData.shader = shader;
      this.updataUserValues();

      shader.vertexShader = shader.vertexShader.replace(
        "#include <common>",
        `
        #include <common>
        
        attribute vec2 side;
        attribute vec3 pickColor;
        attribute vec3 position2;
        attribute float asort;
        attribute float awidth;
        attribute float aoffset;
        attribute float distance;

        uniform float width;
        uniform float offset;
        uniform float scale;
        uniform float style;
        uniform bool vertexWidths;
        uniform bool vertexOffsets;

        varying vec3 vPickColor;
        varying float vDistance;
        varying float vWidth;

      `,
      );
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `
          vPickColor = pickColor;
          vDistance = distance;
          #include <begin_vertex>
          // 0 2
          // 1 3 
          vec2 dir = normalize(position.xy - position2.xy) * side.x;
          vec2 normal = vec2(-dir.y, dir.x);
          float _width = (vertexWidths ? awidth : width) * scale;
          vWidth = _width;
          float _offset = (vertexOffsets ? aoffset : offset) * scale;
          float pointOffset = _width * 0.5 * side.y + _offset;
          transformed = vec3(position.xy + normal * pointOffset , position.z + asort);
        `,
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <common>",
        `
          #include <common>
          
          uniform bool usePickColor;
          uniform float style;

          varying vec3 vPickColor;
          varying float vDistance;
          varying float vWidth;
          
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
          if(style == ${Number(LINE_STYLE.DASHED).toFixed(1)}){
            float dl = mod(vDistance / (vWidth * 3.0) , 1.0);
            if(0.50 < dl && dl <= 1.0){
              diffuseColor.a = 0.0;
            }
          } else if(style == ${Number(LINE_STYLE.NONE).toFixed(1)}){
            diffuseColor.a = 0.0;
          }
        `,
      );
    };
  }

  updataUserValues() {
    if (this.userData.shader) {
      this.userData.shader.uniforms.width = { value: this.width };
      this.userData.shader.uniforms.offset = { value: this.offset };
      this.userData.shader.uniforms.scale = { value: this.scale };
      this.userData.shader.uniforms.style = { value: this.style };
      this.userData.shader.uniforms.vertexWidths = { value: this.vertexWidths };
      this.userData.shader.uniforms.vertexOffsets = { value: this.vertexOffsets };
      this.userData.shader.uniforms.usePickColor = { value: this.usePickColor };
    }
  }

  setValues(argu) {
    super.setValues(argu);
    this.updataUserValues();
  }
}
