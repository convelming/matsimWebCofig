// 版权声明：本文为博主原创文章，遵循 CC 4.0 BY-SA 版权协议，转载请附上原文出处链接和本声明。
// 原文链接：https://blog.csdn.net/u014361280/article/details/124122954

import { Layer, MAP_EVENT } from "@/mymap";
import * as THREE from "three";
import { ColorBar2D } from "./ColorBar2D";

export class HeatmMapLayer extends Layer {
  name = "HeatmMapLayer";
  loader = new THREE.TextureLoader();
  colorStops = null;
  opacity = 0.8;

  constructor(opt) {
    super(opt);
    // 透明度阶梯图
    this.alphaScaleCanvas = document.createElement("canvas");

    // 渐变颜色条图
    this.paletteColorBar = new ColorBar2D([
      { min: 0.0, max: 0.2, range: [0, 1], color: "#ffffbf", label: "0% ~ 20%", use: true },
      { min: 0.2, max: 0.4, range: [0, 1], color: "#fee090", label: "20% ~ 40%", use: true },
      { min: 0.4, max: 0.6, range: [0, 1], color: "#fdae61", label: "40% ~ 60%", use: true },
      { min: 0.6, max: 0.8, range: [0, 1], color: "#f46d43", label: "60% ~ 80%", use: true },
      { min: 0.8, max: 1.0, range: [0, 1], color: "#d73027", label: "80% ~ 100%", use: true },
    ]);

    this.geometry = new THREE.BufferGeometry();

    const positions = [0, 0, 0, 0, 100, 0, 100, 100, 0, 100, 0, 0];
    const normals = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1];
    // const uvs = [0, 0, 0, 1, 1, 1, 1, 0];
    // 未知原因需要把y轴翻转
    const uvs = [0, 1, 0, 0, 1, 0, 1, 1];
    const indexs = [0, 2, 1, 0, 3, 2];
    this.geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    this.geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    this.geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    this.geometry.setIndex(indexs);

    this.material = new THREE.ShaderMaterial({
      depthWrite: false,
      transparent: true,
      vertexShader: `
          #include <common>
          #include <logdepthbuf_pars_vertex>
          varying vec2 vUv;
          void main() {

            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

            #include <logdepthbuf_vertex>
          }
        `,
      fragmentShader: `
          #include <common>
          #include <logdepthbuf_pars_fragment>

          varying vec2 vUv;
          uniform float opacity;
          uniform sampler2D alphaScaleMap;
          uniform sampler2D paletteMap;
          void main() {
            // 温度转为权重alpha 并且 createRadialGradient 渐变的图
            vec4 alphaColor = texture2D(alphaScaleMap, vUv);
            // 根据温度转换为的权重alpha，确定改点的颜色 ，paletteMap 指定颜色条形图
            vec4 color = texture2D(paletteMap, vec2(alphaColor.a, 0.0));
            gl_FragColor = vec4(color.r, color.g, color.b, alphaColor.a * opacity);
            #include <logdepthbuf_fragment>
          }
        `,
      uniforms: {
        opacity: {
          type: "f",
          value: 0.8,
        },
        alphaScaleMap: {
          type: "t",
        },
        paletteMap: {
          type: "t",
          value: this.paletteColorBar.texture,
        },
      },
    });
    this.heatMapMesh = new THREE.Mesh(this.geometry, this.material);
  }

  setOpacity(opacity = 0.8) {
    this.opacity = opacity;
    this.heatMapMesh.material.uniforms.opacity.value = this.opacity;
    this.heatMapMesh.material.needsUpdate = true;
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
      this.heatMapMesh.position.set(x, y, 0);
    }
  }

  onAdd(map) {
    super.onAdd(map);
    this.scene.add(this.heatMapMesh);
    const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
    this.heatMapMesh.position.set(x, y, 0);
  }

  setData(data, valueKey = "", defValue = 0.5) {
    if (data) {
      console.log("setData");
      const { center, range, pointArray, lineArray, propertiesLabels } = data;
      const { minx, miny, maxx, maxy } = range;

      const properties = propertiesLabels[valueKey] || { min: 0, max: 1, values: [] };
      const minValue = properties.min;
      const maxValue = properties.max;
      const valueList = properties.values;
      const pw = maxx - minx;
      const ph = maxy - miny;
      const canvasWidth = 1024 * 5;
      const grain = canvasWidth * 0.04;
      const scale = canvasWidth / pw;
      const width = canvasWidth;
      const height = ph * scale;

      this.alphaScaleCanvas.width = width;
      this.alphaScaleCanvas.height = height;
      const alphaScaleContext2D = this.alphaScaleCanvas.getContext("2d");
      alphaScaleContext2D.clearRect(0, 0, width, height);

      // 绘制点数组的透明度阶梯图
      for (let i = 0, l = pointArray.length / 3; i < l; i++) {
        let weight = valueList[pointArray[i * 3 + 2]] / (maxValue - minValue) || defValue;
        if (weight > 1) weight = 1;
        const x = Math.floor((pointArray[i * 3] + center[0] - minx) * scale);
        const y = Math.floor((pointArray[i * 3 + 1] + center[1] - miny) * scale);
        const radius = Math.floor(Math.abs(parseInt(grain * weight)));

        // 创建圆设置填充色
        const rGradient = alphaScaleContext2D.createRadialGradient(x, y, 0, x, y, radius);
        rGradient.addColorStop(0, "rgba(0, 0, 0, 1)");
        rGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        alphaScaleContext2D.fillStyle = rGradient;
        // 设置globalAlpha
        alphaScaleContext2D.globalAlpha = weight;
        alphaScaleContext2D.beginPath();
        alphaScaleContext2D.arc(x, y, radius, 0, 2 * Math.PI);
        alphaScaleContext2D.closePath();
        alphaScaleContext2D.fill();
      }

      // 绘制线数组的透明度阶梯图

      for (let index = 0, l = lineArray.length, dataSize = lineArray[0], num = 0; index < l; index += 1 + dataSize, dataSize = lineArray[index]) {
        const line = lineArray.slice(index + 1, index + 1 + dataSize);
        let weight = valueList[line[0]] / (maxValue - minValue) || defValue;
        if (weight > 1) weight = 1;
        const array = line.slice(1);
        for (let i2 = 0, l2 = array.length / 3; i2 < l2; i2++) {
          const x = Math.floor((array[i2 * 3] + center[0] - minx) * scale);
          const y = Math.floor((array[i2 * 3 + 1] + center[1] - miny) * scale);
          const radius = Math.floor(Math.abs(parseInt(grain * weight)));

          // 创建圆设置填充色
          const rGradient = alphaScaleContext2D.createRadialGradient(x, y, 0, x, y, radius);
          rGradient.addColorStop(0, "rgba(0, 0, 0, 1)");
          rGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
          alphaScaleContext2D.fillStyle = rGradient;
          // 设置globalAlpha
          alphaScaleContext2D.globalAlpha = weight;
          alphaScaleContext2D.strokeStyle = rGradient;
          alphaScaleContext2D.beginPath();
          alphaScaleContext2D.arc(x, y, radius, 0, 2 * Math.PI);
          alphaScaleContext2D.closePath();
          alphaScaleContext2D.fill();
        }
      }

      const url = this.alphaScaleCanvas.toDataURL("image/png");
      const texture = new THREE.TextureLoader().load(url);
      texture.minFilter = THREE.NearestFilter;
      texture.needsUpdate = true;
      this.heatMapMesh.material.uniforms.alphaScaleMap.value = texture;
      this.heatMapMesh.material.needsUpdate = true;

      // 创建热力图渲染的平面几何体
      const positionList = [0, 0, 0, 0, ph, 0, pw, ph, 0, pw, 0, 0];
      this.geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positionList), 3));
      this.geometry.computeBoundingSphere();
      this.geometry.needsUpdate = true;

      this.center = [minx, miny];
      if (this.map) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
        this.heatMapMesh.position.set(x, y, 0);
      }
    } else {
    }
  }
}
