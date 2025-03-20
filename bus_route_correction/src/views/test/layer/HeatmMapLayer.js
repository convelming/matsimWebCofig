// 版权声明：本文为博主原创文章，遵循 CC 4.0 BY-SA 版权协议，转载请附上原文出处链接和本声明。
// 原文链接：https://blog.csdn.net/u014361280/article/details/124122954

import { Layer, MAP_EVENT } from "@/mymap";
import * as THREE from "three";

export class HeatmMapLayer extends Layer {
  name = "HeatmMapLayer";
  loader = new THREE.TextureLoader();
  colorStops = null;
  center = [];
  opacity = 0.8;

  get canvas2D() {
    if (!this._canvas2D) {
      this._canvas2D = document.createElement("canvas");
    }
    return this._canvas2D;
  }

  get context2D() {
    if (!this._context2D) {
      this._context2D = this.canvas2D.getContext("2d");
    }
    return this._context2D;
  }

  // 渐变颜色条图
  get paletteTexture() {
    if (!this._paletteTexture) {
      //颜色条的颜色分布
      const colorStops = this.colorStops;
      //颜色条的大小
      const width = 256,
        height = 1;

      // 创建canvas
      const paletteCanvas = document.createElement("canvas");
      paletteCanvas.width = width;
      paletteCanvas.height = height;
      const ctx = paletteCanvas.getContext("2d");

      // 创建线性渐变色
      const linearGradient = ctx.createLinearGradient(0, 0, width, 0);
      for (const key in colorStops) {
        linearGradient.addColorStop(key, colorStops[key]);
      }

      // 绘制渐变色条
      ctx.fillStyle = linearGradient;
      ctx.fillRect(0, 0, width, height);

      const url = paletteCanvas.toDataURL("image/png");
      ctx.clearRect(0, 0, width, height);

      const paletteTexture = new THREE.TextureLoader().load(url);
      paletteTexture.minFilter = THREE.NearestFilter;
      paletteTexture.needsUpdate = true;

      this._paletteTexture = paletteTexture;
    }
    return this._paletteTexture;
  }

  get heatMapMesh() {
    if (!this._heatMapMesh) {
      const geometry = new THREE.PlaneGeometry(100, 100);
      // 创建热力图渲染的材质
      const material = new THREE.ShaderMaterial({
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
            value: this.paletteTexture,
          },
        },
      });
      this._heatMapMesh = new THREE.Mesh(geometry, material);
    }
    return this._heatMapMesh;
  }

  constructor(opt) {
    super(opt);
    this.setColorStops(opt.colorStops);
    this.setOpacity(opt.opacity);
    this.setData(opt.data);
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

  setColorStops(colorStops) {
    this.colorStops = colorStops || {
      0.0: "#313695",
      0.1: "#4575b4",
      0.2: "#74add1",
      0.3: "#abd9e9",
      0.4: "#e0f3f8",
      0.5: "#ffffbf",
      0.6: "#fee090",
      0.7: "#fdae61",
      0.8: "#f46d43",
      0.9: "#d73027",
      1.0: "#a50026",
    };
    this._paletteTexture = null;

    this.heatMapMesh.material.uniforms.paletteMap.value = this.paletteTexture;
    this.heatMapMesh.material.needsUpdate = true;
  }

  setData(data) {
    this.data = data || [];
    const { width, height, texture, center } = this.getAlphaScaleMap(this.data);
    // 创建热力图渲染的平面几何体
    const positionList = [
      -width,
      height,
      0,
      width,
      height,
      0,
      -width,
      -height,
      0,
      width,
      -height,
      0,
    ];
    this.heatMapMesh.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(positionList), 3)
    );
    this.heatMapMesh.geometry.computeBoundingSphere();
    this.heatMapMesh.geometry.needsUpdate = true;

    this.heatMapMesh.material.uniforms.alphaScaleMap.value = texture;
    this.heatMapMesh.material.needsUpdate = true;

    this.center = center;
    if (this.map) {
      const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
      this.heatMapMesh.position.set(x, y, 0);
    }
  }

  getAlphaScaleMap(data, grain = 50) {
    let minX = Number.MAX_SAFE_INTEGER;
    let maxX = Number.MIN_SAFE_INTEGER;
    let minY = Number.MAX_SAFE_INTEGER;
    let maxY = Number.MIN_SAFE_INTEGER;

    for (const item of data) {
      if (item[0] < minX) {
        minX = item[0];
      }
      if (item[0] > maxX) {
        maxX = item[0];
      }
      if (item[1] < minY) {
        minY = item[1];
      }
      if (item[1] > maxY) {
        maxY = item[1];
      }
    }

    const width = Math.floor(maxX - minX + grain * 4);
    const height = Math.floor(maxY - minY + grain * 4);

    this.canvas2D.width = width || 1024;
    this.canvas2D.height = height || 1024;
    this.context2D.clearRect(0, 0, width, height);

    // 绘制透明度阶梯图
    for (const item of data) {
      const weight = Math.abs(item[2]);
      const x = Math.floor(item[0] - minX + grain * 2);
      const y = Math.floor(item[1] - minY + grain * 2);
      const radius = Math.floor(Math.abs(parseInt(grain * weight)));
      // 创建圆设置填充色
      const rGradient = this.context2D.createRadialGradient(
        x,
        y,
        0,
        x,
        y,
        radius
      );
      rGradient.addColorStop(0, "rgba(0, 0, 0, 1)");
      rGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      this.context2D.fillStyle = rGradient;
      // 设置globalAlpha
      this.context2D.globalAlpha = weight;
      this.context2D.beginPath();
      this.context2D.arc(x, y, radius, 0, 2 * Math.PI);
      this.context2D.closePath();
      this.context2D.fill();
    }

    const url = this.canvas2D.toDataURL("image/png");
    this.context2D.clearRect(0, 0, width, height);

    const texture = new THREE.TextureLoader().load(url);
    texture.minFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    return {
      texture: texture,
      width: width,
      height: height,
      grain: grain,
      center: [(minX + maxX) / 2, (minY + maxY) / 2],
    };
  }
}
