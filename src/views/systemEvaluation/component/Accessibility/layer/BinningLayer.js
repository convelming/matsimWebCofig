import { Layer, MAP_EVENT } from "@/mymap";
import * as THREE from "three";

import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";

import BinningWorker from "../worker/BinningLayer.worker";

import Vue from "vue";
import BinningColors from "../component/BinningColors";
const BinningColorsExtend = Vue.extend(BinningColors);

export class BinningLayer extends Layer {
  name = "BinningLayer";

  segm = 1;
  size = 110;
  colors = [
    "#313695",
    "#4575b4",
    "#74add1",
    "#abd9e9",
    "#e0f3f8",
    "#ffffbf",
    "#fee090",
    "#fdae61",
    "#f46d43",
    "#d73027",
    "#a50026",
  ];

  get colorsDom() {
    if (!this._colorsDom) {
      this._colorsDom = new BinningColorsExtend({
        data: { colors: [], minValue: 0, maxValue: 0 },
      }).$mount();
    }
    return this._colorsDom;
  }

  valueFunc = (value) => value;

  constructor(opt) {
    super(opt);
    this.segm = opt.segm || this.segm;
    this.colors = opt.colors || this.colors;
    this.valueFunc = opt.valueFunc || this.valueFunc;
    this.colorsDom.colors = this.colors;

    this.worker = new BinningWorker();
    this.worker.onmessage = (event) => {
      const { key, data } = event.data;
      switch (key) {
        case "setData":
          this.update();
          break;
        case "update":
          this.handleUpdateCallback(data);
          break;
      }
    };
    this.worker.addEventListener("error", (error) => {
      console.log(error);
    });
    console.log(this);
  }

  onAdd(map) {
    super.onAdd(map);
    map.rootDoc.appendChild(this.colorsDom.$el);
    this.update();
  }
  

  onRemove() {
    super.onRemove();
    this.colorsDom.$el.remove();
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      for (const mesh of this.scene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...mesh.userData.center);
        mesh.position.set(x, y, mesh.position.z);
      }
      for (const mesh of this.pickLayerScene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...mesh.userData.center);
        mesh.position.set(x, y, mesh.position.z);
      }
      for (const mesh of this.pickMeshScene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...mesh.userData.center);
        mesh.position.set(x, y, mesh.position.z);
      }
    }
  }

  dispose() {
    super.dispose();
    this.worker.terminate();
  }

  setSegm(segm) {
    this.segm = segm;
    this.update();
  }

  setValueFunc(valueFunc) {
    this.valueFunc = valueFunc;
    this.update();
  }

  setColors(colors) {
    this.colors = colors;
    this.colorsDom.colors = colors;
    this.update();
  }

  setData(data) {
    this.worker.postMessage({ key: "setData", data: data });
  }

  handleUpdateCallback({ values, positions, center }) {
    this.clearScene();
    const { size, segm } = this;
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    this.colorsDom.maxValue = maxValue;
    this.colorsDom.minValue = minValue;

    const geometryList = [];
    for (let i = 0, l = values.length; i < l; i++) {
      const value = values[i];
      const position = positions[i];

      const percentage = (value - minValue) / (maxValue - minValue);

      let colorIndex = Math.floor(percentage * this.colors.length);
      if (colorIndex >= this.colors.length) colorIndex = this.colors.length - 1;

      const colorStr = this.colors[colorIndex];
      const color = new THREE.Color(colorStr);
      const attrColor = new Array(24).fill([color.r, color.g, color.b]).flat();
      const geometry = new THREE.BoxGeometry(
        size * segm,
        size * segm,
        size * segm * percentage * 10
      );
      geometry.setAttribute(
        "color",
        new THREE.BufferAttribute(new Float32Array(attrColor), 3)
      );

      const matrix4 = new THREE.Matrix4();
      matrix4.setPosition(
        position[0],
        position[1],
        size * segm * percentage * 5
      );
      geometry.attributes.position.applyMatrix4(matrix4);

      geometryList.push(geometry);
    }

    const geometry = BufferGeometryUtils.mergeBufferGeometries(
      geometryList,
      false
    );

    const material = new THREE.MeshLambertMaterial({
      vertexColors: true,
      transparent: false,
    });

    const [x, y] = this.map.WebMercatorToCanvasXY(...center);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, 0);
    mesh.userData.center = center;

    this.scene.add(mesh);
  }

  update() {
    if (!this.map) return;
    this.worker.postMessage({
      key: "update",
      data: {
        segm: this.segm,
        valueFuncStr: this.valueFunc.toString(),
      },
    });
  }

  getColorByValue(value) {}
}
