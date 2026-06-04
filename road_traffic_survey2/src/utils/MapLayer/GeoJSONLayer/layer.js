import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import { GeoJSONPointListGeometry, GeoJSONPointMaterial } from "./point.js";
import { GeoJSONLineListGeometry, GeoJSONLineMaterial, LINE_STYLE, LINE_WIDTH_STYLE } from "./line.js";
import { GeoJSONPolygonListGeometry, GeoJSONPolygonMaterial, GeoJSONPolygonBorderListGeometry } from "./polygon.js";
import { createSortFunc, isPropertiesMapArgument } from "./utils.js";

const textureLoader = new THREE.TextureLoader();

const defaultParams = {
  zIndex: 100,
  unit: "m",
  // ******************** 点 ******************** //
  showPoint: true,
  pointSize: 20,
  pointColor: "#01ae9c", // ffa500
  pointIcon: new URL("./point.svg?url", import.meta.url).href,
  pointOpacity: 1,
  // ******************** 线 ******************** //
  showLine: true,
  lineWidth: 10,
  lineOffset: 0,
  lineStyle: LINE_STYLE.DASHED,
  lineColor: "#01ae9c",
  lineOpacity: 1,
  lineAnimation: 0,
  // ******************** 面 ******************** //
  showPolygon: true,
  polygonHeight: 0,
  polygonColor: "#01ae9c",
  polygonOpacity: 1,
  polygonBorderOpacity: 1,
  polygonBorderWidth: 10,
  polygonBorderColor: "#fff",
  polygonBorderStyle: LINE_STYLE.DASHED,
};

export class GeoJSONLayer extends Layer {
  name = "GeoJSONLayer";
  color = new THREE.Color(0xffa500);

  get center() {
    try {
      return this.map.WebMercatorToCanvasXY(this.data.center[0], this.data.center[1]);
    } catch (e) {
      return [0, 0];
    }
  }
  unit = "m";

  showPoint = true;
  pointCenter = [0, 0];
  pointMeshList = [];
  pointPLMeshList = [];
  pointPMMeshList = [];
  pointGroup = new THREE.Group();
  pointPLGroup = new THREE.Group();
  pointPMGroup = new THREE.Group();
  // 点样式
  pointSort = (v, i, l) => i / l.length;
  pointSize = 1;
  pointColor = 0xffa500;
  pointOpacity = 1;
  pointIcon = null;

  showLine = true;
  lineCenter = [0, 0];
  lineMeshList = [];
  linePLMeshList = [];
  linePMMeshList = [];
  lineGroup = new THREE.Group();
  linePLGroup = new THREE.Group();
  linePMGroup = new THREE.Group();
  // 线样式
  lineSort = (v, i, l) => i / l.length;
  lineWidth = 100;
  lineOffset = 0;
  lineColor = 0xffa500;
  lineOpacity = 1;
  lineStyle = LINE_STYLE.SOLID;
  lineAnimation = 0;

  showPolygon = true;
  polygonCenter = [0, 0];
  polygonMeshList = [];
  polygonPLMeshList = [];
  polygonPMMeshList = [];
  polygonBorderMeshList = [];
  polygonGroup = new THREE.Group();
  polygonPLGroup = new THREE.Group();
  polygonPMGroup = new THREE.Group();
  polygonBorderGroup = new THREE.Group();
  // 面样式
  showPolygon = true;
  polygonColor = 0xffa500;
  polygonOpacity = 1;
  polygonHeight = 0;
  polygonBorderOpacity = 1;
  polygonBorderWidth = 1;
  polygonBorderColor = 0xffffff;
  polygonBorderStyle = LINE_STYLE.SOLID;

  setUnit(unit) {
    this.unit = unit;
    if (this.map) this.on(MAP_EVENT.UPDATE_CAMERA_HEIGHT);
  }
  // ******************** 点 ******************** //
  setShowPoint(showPoint) {
    this.showPoint = showPoint;
    if (this.showPoint) {
      this.scene.add(this.pointGroup);
      this.pickLayerScene.add(this.pointPLGroup);
      this.pickMeshScene.add(this.pointPMGroup);
    } else {
      this.pointGroup.removeFromParent();
      this.pointPLGroup.removeFromParent();
      this.pointPMGroup.removeFromParent();
    }
  }
  setPointSort(pointSort = createSortFunc()) {
    this.pointSort = pointSort;
    return this.data?.propertiesMap(pointSort).then((list) => {
      console.log("pointSort", list);
      this.pointMeshList.forEach((mesh) => {
        mesh.geometry.updateSort(list);
      });
    });
  }
  setPointSize(pointSize) {
    this.pointSize = pointSize;
    if (isPropertiesMapArgument(pointSize)) {
      this.pointMaterial.setValues({ vertexSizes: true });
      this.pointMaterial.needsUpdate = true;
      this.pointPLMaterial.setValues({ vertexSizes: true });
      this.pointPLMaterial.needsUpdate = true;
      this.pointPMMaterial.setValues({ vertexSizes: true });
      this.pointPMMaterial.needsUpdate = true;
      return this.data?.propertiesMap(pointSize).then((list) => {
        this.pointMeshList.forEach((mesh) => {
          mesh.geometry.updateSize(list);
        });
      });
    } else {
      this.pointMaterial.setValues({ vertexSizes: false, size: pointSize });
      this.pointMaterial.needsUpdate = true;
      this.pointPLMaterial.setValues({ vertexSizes: false, size: pointSize });
      this.pointPLMaterial.needsUpdate = true;
      this.pointPMMaterial.setValues({ vertexSizes: false, size: pointSize });
      this.pointPMMaterial.needsUpdate = true;
      return Promise.resolve();
    }
  }
  setPointColor(pointColor) {
    this.pointColor = pointColor;
    if (isPropertiesMapArgument(pointColor)) {
      this.pointMaterial.setValues({
        vertexColors: true,
        color: "#ffffff",
      });
      this.pointMaterial.needsUpdate = true;
      return this.data?.propertiesMap(pointColor).then((list) => {
        const colorList = list.map((item) => new THREE.Color(item).toArray());
        this.pointMeshList.forEach((mesh) => {
          mesh.geometry.updateColor(colorList);
        });
      });
    } else {
      this.pointMaterial.setValues({
        vertexColors: false,
        color: pointColor,
      });
      this.pointMaterial.needsUpdate = true;
      return Promise.resolve();
    }
  }
  setPointOpacity(pointOpacity) {
    this.pointOpacity = pointOpacity;
    this.pointMaterial.setValues({ opacity: pointOpacity });
    this.pointMaterial.needsUpdate = true;
  }
  setPointIcon(pointIcon) {
    this.pointIcon = pointIcon;
    textureLoader.load(
      pointIcon,
      (data) => {
        this.pointMaterial.setValues({
          map: data,
        });
        this.pointMaterial.needsUpdate = true;
      },
      null,
      (error) => {
        this.pointMaterial.setValues({
          map: null,
        });
        this.pointMaterial.needsUpdate = true;
      },
    );
  }
  setPointScale(pointScale) {
    this.pointScale = pointScale;
    this.pointMaterial.setValues({ scale: pointScale });
    this.pointMaterial.needsUpdate = true;
    this.pointPLMaterial.setValues({ scale: pointScale });
    this.pointPLMaterial.needsUpdate = true;
    this.pointPMMaterial.setValues({ scale: pointScale });
    this.pointPMMaterial.needsUpdate = true;
  }

  // ******************** 线 ******************** //
  setShowLine(showLine) {
    this.showLine = showLine;
    if (this.showLine) {
      this.scene.add(this.lineGroup);
      this.pickLayerScene.add(this.linePLGroup);
      this.pickMeshScene.add(this.linePMGroup);
    } else {
      this.lineGroup.removeFromParent();
      this.linePLGroup.removeFromParent();
      this.linePMGroup.removeFromParent();
    }
  }
  setLineSort(lineSort = createSortFunc()) {
    this.lineSort = lineSort;
    return this.data?.propertiesMap(lineSort).then((list) => {
      this.lineMeshList.forEach((mesh) => {
        mesh.geometry.updateSort(list);
      });
    });
  }
  setLineWidth(lineWidth) {
    this.lineWidth = lineWidth;
    if (isPropertiesMapArgument(lineWidth)) {
      this.lineMaterial.setValues({ vertexWidths: true });
      this.lineMaterial.needsUpdate = true;
      this.linePLMaterial.setValues({ vertexWidths: true });
      this.linePLMaterial.needsUpdate = true;
      this.linePMMaterial.setValues({ vertexWidths: true });
      this.linePMMaterial.needsUpdate = true;
      return this.data?.propertiesMap(lineWidth).then((list) => {
        this.lineMeshList.forEach((mesh) => {
          mesh.geometry.updateWidth(list);
        });
      });
    } else {
      this.lineMaterial.setValues({ vertexWidths: false, width: lineWidth });
      this.lineMaterial.needsUpdate = true;
      this.linePLMaterial.setValues({ vertexWidths: false, width: lineWidth });
      this.linePLMaterial.needsUpdate = true;
      this.linePMMaterial.setValues({ vertexWidths: false, width: lineWidth });
      this.linePMMaterial.needsUpdate = true;
      return Promise.resolve();
    }
  }
  setLineOffset(lineOffset) {
    this.lineOffset = lineOffset;
    if (isPropertiesMapArgument(lineOffset)) {
      this.lineMaterial.setValues({ vertexOffsets: true });
      this.lineMaterial.needsUpdate = true;
      this.linePLMaterial.setValues({ vertexOffsets: true });
      this.linePLMaterial.needsUpdate = true;
      this.linePMMaterial.setValues({ vertexOffsets: true });
      this.linePMMaterial.needsUpdate = true;
      return this.data?.propertiesMap(lineOffset).then((list) => {
        this.lineMeshList.forEach((mesh) => {
          mesh.geometry.updateOffset(list);
        });
      });
    } else {
      this.lineMaterial.setValues({ vertexOffsets: false, offset: lineOffset });
      this.lineMaterial.needsUpdate = true;
      this.linePLMaterial.setValues({ vertexOffsets: false, offset: lineOffset });
      this.linePLMaterial.needsUpdate = true;
      this.linePMMaterial.setValues({ vertexOffsets: false, offset: lineOffset });
      this.linePMMaterial.needsUpdate = true;
      return Promise.resolve();
    }
  }
  setLineColor(lineColor) {
    this.lineColor = lineColor;
    if (isPropertiesMapArgument(lineColor)) {
      this.lineMaterial.setValues({
        vertexColors: true,
        color: "#ffffff",
      });
      this.lineMaterial.needsUpdate = true;
      return this.data?.propertiesMap(lineColor).then((list) => {
        const colorList = list.map((item) => new THREE.Color(item).toArray());
        this.lineMeshList.forEach((mesh) => {
          mesh.geometry.updateColor(colorList);
        });
      });
    } else {
      this.lineMaterial.setValues({
        vertexColors: false,
        color: lineColor,
      });
      this.lineMaterial.needsUpdate = true;
      return Promise.resolve();
    }
  }
  setLineOpacity(lineOpacity) {
    this.lineOpacity = lineOpacity;
    this.lineMaterial.setValues({ opacity: lineOpacity });
    this.lineMaterial.needsUpdate = true;
  }
  setLineStyle(lineStyle) {
    this.lineStyle = lineStyle;
    // 如果线段样式是虚线或不显示时需要把深度写入关闭，否在会遮盖下方的物体
    // if (lineStyle === LINE_STYLE.DASHED || lineStyle === LINE_STYLE.NONE) {
    //   this.lineMaterial.depthWrite = false;
    // } else {
    //   this.lineMaterial.depthWrite = true;
    // }
    this.lineMaterial.setValues({ style: lineStyle });
    this.lineMaterial.needsUpdate = true;
    this.linePLMaterial.setValues({ style: lineStyle });
    this.linePLMaterial.needsUpdate = true;
    this.linePMMaterial.setValues({ style: lineStyle });
    this.linePMMaterial.needsUpdate = true;
  }
  setLineScale(lineScale) {
    this.lineScale = lineScale;
    this.lineMaterial.setValues({ scale: lineScale });
    this.lineMaterial.needsUpdate = true;
    this.linePLMaterial.setValues({ scale: lineScale });
    this.linePLMaterial.needsUpdate = true;
    this.linePMMaterial.setValues({ scale: lineScale });
    this.linePMMaterial.needsUpdate = true;
  }

  // ******************** 面 ******************** //
  setShowPolygon(showPolygon) {
    this.showPolygon = showPolygon;
    if (showPolygon) {
      this.scene.add(this.polygonGroup);
      this.pickLayerScene.add(this.polygonPLGroup);
      this.pickMeshScene.add(this.polygonPMGroup);
      if (this.polygonBorderWidth > 0) this.scene.add(this.polygonBorderGroup);
      else this.scene.remove(this.polygonBorderGroup);
    } else {
      this.polygonGroup.removeFromParent();
      this.polygonPLGroup.removeFromParent();
      this.polygonPMGroup.removeFromParent();
      this.polygonBorderGroup.removeFromParent();
    }
  }
  setPolygonSort(polygonSort = createSortFunc()) {
    this.polygonSort = polygonSort;
    return this.data?.propertiesMap(polygonSort).then((list) => {
      this.polygonMeshList.forEach((mesh) => {
        mesh.geometry.updateSort(list);
      });
    });
  }
  setPolygonColor(polygonColor) {
    this.polygonColor = polygonColor;
    if (isPropertiesMapArgument(polygonColor)) {
      this.polygonMaterial.setValues({
        vertexColors: true,
        color: "#ffffff",
      });
      this.polygonMaterial.needsUpdate = true;
      return this.data?.propertiesMap(polygonColor).then((list) => {
        const colorList = list.map((item) => new THREE.Color(item).toArray());
        this.polygonMeshList.forEach((mesh) => {
          let key = new Date().getTime();
          console.time(`updateColor_${key}`);
          mesh.geometry.updateColor(colorList);
          console.timeEnd(`updateColor_${key}`);
        });
      });
    } else {
      this.polygonMaterial.setValues({
        vertexColors: false,
        color: polygonColor,
      });
      this.polygonMaterial.needsUpdate = true;
      return Promise.resolve();
    }
  }
  setPolygonOpacity(polygonOpacity) {
    this.polygonOpacity = polygonOpacity;
    this.polygonMaterial.setValues({ opacity: polygonOpacity });
    this.polygonMaterial.needsUpdate = true;
  }
  setPolygonHeight(polygonHeight) {
    this.polygonHeight = polygonHeight;
    if (isPropertiesMapArgument(polygonHeight)) {
      this.polygonMaterial.setValues({
        vertexHeights: true,
        height: 0,
      });
      this.polygonMaterial.needsUpdate = true;
      return this.data?.propertiesMap(polygonHeight).then((list) => {
        console.log(list);
        this.polygonMeshList.forEach((mesh) => {
          mesh.geometry.updateHeight(list);
        });
      });
    } else {
      this.polygonMaterial.setValues({
        vertexHeights: false,
        height: polygonHeight,
      });
      this.polygonMaterial.needsUpdate = true;
      return Promise.resolve();
    }
  }
  setPolygonBorderOpacity(polygonBorderOpacity) {
    this.polygonBorderOpacity = polygonBorderOpacity;
    this.polygonBorderMaterial.setValues({ opacity: polygonBorderOpacity });
    this.polygonBorderMaterial.needsUpdate = true;
  }
  setPolygonBorderColor(polygonBorderColor) {
    this.polygonBorderColor = polygonBorderColor;
    this.polygonBorderMaterial.setValues({ color: polygonBorderColor });
    this.polygonBorderMaterial.needsUpdate = true;
  }
  setPolygonBorderWidth(polygonBorderWidth) {
    this.polygonBorderWidth = polygonBorderWidth;
    this.polygonBorderMaterial.setValues({ vertexWidths: false, width: polygonBorderWidth, offset: -0.5 * polygonBorderWidth });
    this.polygonBorderMaterial.needsUpdate = true;
    if (this.polygonBorderWidth > 0) this.scene.add(this.polygonBorderGroup);
    else this.scene.remove(this.polygonBorderGroup);
  }
  setPolygonBorderStyle(polygonBorderStyle) {
    this.polygonBorderStyle = polygonBorderStyle;
    // 如果线段样式是虚线或不显示时需要把深度写入关闭，否在会遮盖下方的物体
    // if (polygonBorderStyle === LINE_STYLE.DASHED || polygonBorderStyle === LINE_STYLE.NONE) {
    //   this.polygonBorderMaterial.depthWrite = false;
    // } else {
    //   this.polygonBorderMaterial.depthWrite = true;
    // }
    this.polygonBorderMaterial.setValues({ style: polygonBorderStyle });
    this.polygonBorderMaterial.needsUpdate = true;
  }
  setPolygonBorderScale(polygonBorderScale) {
    this.polygonBorderScale = polygonBorderScale;
    this.polygonBorderMaterial.setValues({ scale: polygonBorderScale });
    this.polygonBorderMaterial.needsUpdate = true;
  }

  constructor(opt) {
    super(opt);

    const params = Object.assign({}, defaultParams, opt);
    this.setUnit(params.unit);
    // ******************** 点 ******************** //
    this.pointMaterial = new GeoJSONPointMaterial({
      transparent: true,
    });
    this.pointPLMaterial = new GeoJSONPointMaterial({
      transparent: false,
      color: this.pickLayerColor,
    });
    this.pointPMMaterial = new GeoJSONPointMaterial({
      transparent: false,
      usePickColor: true,
    });
    this.pointMeshList = [];
    this.pointPLMeshList = [];
    this.pointPMMeshList = [];

    this.setShowPoint(params.showPoint);
    this.setPointSort(params.pointSort);
    this.setPointSize(params.pointSize);
    this.setPointColor(params.pointColor);
    this.setPointOpacity(params.pointOpacity);
    this.setPointIcon(params.pointIcon);

    // ******************** 线 ******************** //
    this.lineMaterial = new GeoJSONLineMaterial({
      transparent: true,
    });
    this.linePLMaterial = new GeoJSONLineMaterial({
      transparent: false,
      color: this.pickLayerColor,
    });
    this.linePMMaterial = new GeoJSONLineMaterial({
      transparent: false,
      usePickColor: true,
    });
    this.lineMeshList = [];
    this.linePLMeshList = [];
    this.linePMMeshList = [];
    this.setShowLine(this.showLine);
    this.setLineSort(params.lineSort);
    this.setLineWidth(params.lineWidth);
    this.setLineOffset(params.lineOffset);
    this.setLineColor(params.lineColor);
    this.setLineOpacity(params.lineOpacity);
    this.setLineStyle(params.lineStyle);

    // ******************** 面 ******************** //
    this.polygonMaterial = new GeoJSONPolygonMaterial({
      transparent: true,
      side: THREE.DoubleSide,
    });
    this.polygonPLMaterial = new GeoJSONPolygonMaterial({
      transparent: false,
      color: this.pickLayerColor,
    });
    this.polygonPMMaterial = new GeoJSONPolygonMaterial({
      transparent: false,
      usePickColor: true,
    });
    this.polygonBorderMaterial = new GeoJSONLineMaterial({
      transparent: true,
      width: 10,
      offset: -5,
      color: "#ffffff",
    });
    this.polygonMeshList = [];
    this.polygonPLMeshList = [];
    this.polygonPMMeshList = [];
    this.polygonBorderMeshList = [];
    this.setShowPolygon(params.showPolygon);
    this.setPolygonOpacity(params.polygonOpacity);
    this.setPolygonColor(params.polygonColor);
    this.setPolygonHeight(params.polygonHeight);
    this.setPolygonBorderOpacity(params.polygonBorderOpacity);
    this.setPolygonBorderColor(params.polygonBorderColor);
    this.setPolygonBorderWidth(params.polygonBorderWidth);
    this.setPolygonBorderStyle(params.polygonBorderStyle);
  }

  // 设置拾取图层颜色
  setPickLayerColor(pickLayerColor) {
    this.pickLayerColor = new THREE.Color(pickLayerColor);

    this.pointPLMaterial.setValues({ color: pickLayerColor });
    this.pointPLMaterial.needsUpdate = true;

    this.linePLMaterial.setValues({ color: pickLayerColor });
    this.linePLMaterial.needsUpdate = true;

    this.polygonPLMaterial.setValues({ color: pickLayerColor });
    this.polygonPLMaterial.needsUpdate = true;
  }

  render() {
    super.render();
    // this.lineMaterial.updateAnimation();
    this.on(MAP_EVENT.UPDATE_CENTER, {});
    this.on(MAP_EVENT.UPDATE_CAMERA_HEIGHT);
  }

  dispose() {
    super.dispose();
    this.clearScene();
  }

  clearScene() {
    this.data = null;
    this.clearPoint();
    this.clearLine();
    this.clearPolygon();
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CAMERA_HEIGHT || type == MAP_EVENT.UPDATE_RENDERER_SIZE) {
      // this.map.nextFrame(() => {
      //   console.log("update camera height");
      //   if (this.unit == "px") {
      //     this.setPointScale(this.map.plottingScale);
      //     this.setLineScale(this.map.plottingScale);
      //     this.setPolygonBorderScale(this.map.plottingScale);
      //   } else if (this.unit == "m") {
      //     this.setPointScale(1);
      //     this.setLineScale(1);
      //     this.setPolygonBorderScale(1);
      //   }
      // });
    }
    if (type == MAP_EVENT.UPDATE_CENTER) {
      const list = [this.pointMeshList, this.pointPLMeshList, this.pointPMMeshList, this.lineMeshList, this.linePLMeshList, this.linePMMeshList, this.polygonMeshList, this.polygonPLMeshList, this.polygonPMMeshList, this.polygonBorderMeshList];
      for (const item1 of list) {
        for (const mesh of item1) {
          const [x, y] = this.center;
          mesh.position.set(x, y, mesh.position.z);
        }
      }
    }
  }

  setData(data) {
    this.data = data;
    this.updatePoint();
    this.updateLine();
    this.updatePolygon();
  }
  clearPoint() {
    for (const mesh of this.pointMeshList) {
      mesh.removeFromParent();
      mesh.geometry.dispose();
    }
    this.pointMeshList = [];

    for (const mesh of this.pointPLMeshList) {
      mesh.removeFromParent();
      mesh.geometry.dispose();
    }
    this.pointPLMeshList = [];

    for (const mesh of this.pointPMMeshList) {
      mesh.removeFromParent();
      mesh.geometry.dispose();
    }
    this.pointPMMeshList = [];
  }

  async updatePoint() {
    this.clearPoint();
    if (!this.data) return;

    const [cx, cy] = this.center;
    const maxPoint = 100000;
    const pointList = await this.data.getAllPoint();

    // for (let i = 0, l = pointList.length; i < l; i += maxPoint) {
    //   const list = pointList.slice(i, i + maxPoint);

    //   const geometry = new GeoJSONPointListGeometry(list);

    //   const mesh = new THREE.Mesh(geometry, this.pointMaterial);
    //   mesh.position.set(cx, cy, 0.4);
    //   this.pointMeshList.push(mesh);
    //   this.pointGroup.add(mesh);

    //   const pickLayerMesh = new THREE.Mesh(geometry, this.pointPLMaterial);
    //   pickLayerMesh.position.set(cx, cy, 0.4);
    //   this.pointPLMeshList.push(pickLayerMesh);
    //   this.pointPLGroup.add(pickLayerMesh);

    //   const pickItemMesh = new THREE.Mesh(geometry, this.pointPMMaterial);
    //   pickItemMesh.position.set(cx, cy, 0.4);
    //   this.pointPMMeshList.push(pickItemMesh);
    //   this.pointPMGroup.add(pickItemMesh);

    //   await new Promise((resolve) => setTimeout(resolve, 0));
    // }
    for (const list of pointList) {
      console.log(list);
      const geometry = new GeoJSONPointListGeometry(list);

      const mesh = new THREE.Mesh(geometry, this.pointMaterial);
      mesh.position.set(cx, cy, 0.4);
      this.pointMeshList.push(mesh);
      this.pointGroup.add(mesh);

      const pickLayerMesh = new THREE.Mesh(geometry, this.pointPLMaterial);
      pickLayerMesh.position.set(cx, cy, 0.4);
      this.pointPLMeshList.push(pickLayerMesh);
      this.pointPLGroup.add(pickLayerMesh);

      const pickItemMesh = new THREE.Mesh(geometry, this.pointPMMaterial);
      pickItemMesh.position.set(cx, cy, 0.4);
      this.pointPMMeshList.push(pickItemMesh);
      this.pointPMGroup.add(pickItemMesh);

      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    await this.setPointSort(this.pointSort);
    await this.setPointSize(this.pointSize);
    await this.setPointColor(this.pointColor);
  }

  clearLine() {
    for (const mesh of this.lineMeshList) {
      mesh.removeFromParent();
      mesh.geometry.dispose();
    }
    this.lineMeshList = [];

    for (const mesh of this.linePLMeshList) {
      mesh.removeFromParent();
      mesh.geometry.dispose();
    }
    this.linePLMeshList = [];

    for (const mesh of this.linePMMeshList) {
      mesh.removeFromParent();
      mesh.geometry.dispose();
    }
    this.linePMMeshList = [];
  }
  async updateLine() {
    this.clearLine();
    if (!this.data) return;
    const [cx, cy] = this.center;
    const maxLine = 100000;
    const lineList = await this.data.getAllLine();

    // for (let i = 0, l = lineList.length; i < l; i += maxLine) {
    //   const list = lineList.slice(i, i + maxLine);

    //   const geometry = new GeoJSONLineListGeometry(list);

    //   const mesh = new THREE.Mesh(geometry, this.lineMaterial);
    //   mesh.position.set(cx, cy, 0.2);
    //   this.lineMeshList.push(mesh);
    //   this.lineGroup.add(mesh);

    //   const pickLayerMesh = new THREE.Mesh(geometry, this.linePLMaterial);
    //   pickLayerMesh.position.set(cx, cy, 0.2);
    //   this.linePLMeshList.push(pickLayerMesh);
    //   this.linePLGroup.add(pickLayerMesh);

    //   const pickItemMesh = new THREE.Mesh(geometry, this.linePMMaterial);
    //   pickItemMesh.position.set(cx, cy, 0.2);
    //   this.linePMMeshList.push(pickItemMesh);
    //   this.linePMGroup.add(pickItemMesh);

    //   await new Promise((resolve) => setTimeout(resolve, 0));
    // }

    for (const list of lineList) {
      const geometry = new GeoJSONLineListGeometry(list);

      const mesh = new THREE.Mesh(geometry, this.lineMaterial);
      mesh.position.set(cx, cy, 0.2);
      this.lineMeshList.push(mesh);
      this.lineGroup.add(mesh);

      const pickLayerMesh = new THREE.Mesh(geometry, this.linePLMaterial);
      pickLayerMesh.position.set(cx, cy, 0.2);
      this.linePLMeshList.push(pickLayerMesh);
      this.linePLGroup.add(pickLayerMesh);

      const pickItemMesh = new THREE.Mesh(geometry, this.linePMMaterial);
      pickItemMesh.position.set(cx, cy, 0.2);
      this.linePMMeshList.push(pickItemMesh);
      this.linePMGroup.add(pickItemMesh);

      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    await this.setLineSort(this.lineSort);
    await this.setLineWidth(this.lineWidth);
    await this.setLineOffset(this.lineOffset);
    await this.setLineColor(this.lineColor);
  }

  clearPolygon() {
    for (const mesh of this.polygonMeshList) {
      mesh.removeFromParent();
      mesh.geometry.dispose();
    }
    this.polygonMeshList = [];

    for (const mesh of this.polygonPLMeshList) {
      mesh.removeFromParent();
      mesh.geometry.dispose();
    }
    this.polygonPLMeshList = [];

    for (const mesh of this.polygonPMMeshList) {
      mesh.removeFromParent();
      mesh.geometry.dispose();
    }
    this.polygonPMMeshList = [];

    for (const mesh of this.polygonBorderMeshList) {
      mesh.removeFromParent();
      mesh.geometry.dispose();
    }
    this.polygonBorderMeshList = [];
  }
  async updatePolygon() {
    this.clearPolygon();
    if (!this.data) return;
    const [cx, cy] = this.center;
    const maxPolygon = 100000;
    const polygonList = await this.data.getAllPolygon();
    // for (let i = 0, l = polygonList.length; i < l; i += maxPolygon) {
    //   const list = polygonList.slice(i, i + maxPolygon);

    //   const geometry = new GeoJSONPolygonListGeometry(list);

    //   const mesh = new THREE.Mesh(geometry, this.polygonMaterial);
    //   mesh.position.set(cx, cy, 0);
    //   this.polygonMeshList.push(mesh);
    //   this.polygonGroup.add(mesh);

    //   const pickLayerMesh = new THREE.Mesh(geometry, this.polygonPLMaterial);
    //   pickLayerMesh.position.set(cx, cy, 0);
    //   this.polygonPLMeshList.push(pickLayerMesh);
    //   this.polygonPLGroup.add(pickLayerMesh);

    //   const pickItemMesh = new THREE.Mesh(geometry, this.polygonPMMaterial);
    //   pickItemMesh.position.set(cx, cy, 0);
    //   this.polygonPMMeshList.push(pickItemMesh);
    //   this.polygonPMGroup.add(pickItemMesh);

    //   const borderGeometry = new GeoJSONPolygonBorderListGeometry(list);

    //   const borderMesh = new THREE.Mesh(borderGeometry, this.polygonBorderMaterial);
    //   borderMesh.position.set(cx, cy, 0.2);
    //   this.polygonBorderMeshList.push(borderMesh);
    //   this.polygonBorderGroup.add(borderMesh);

    //   await new Promise((resolve) => setTimeout(resolve, 0));
    // }

    for (const list of polygonList) {
      const geometry = new GeoJSONPolygonListGeometry(list);

      const mesh = new THREE.Mesh(geometry, this.polygonMaterial);
      mesh.position.set(cx, cy, 0);
      this.polygonMeshList.push(mesh);
      this.polygonGroup.add(mesh);

      const pickLayerMesh = new THREE.Mesh(geometry, this.polygonPLMaterial);
      pickLayerMesh.position.set(cx, cy, 0);
      this.polygonPLMeshList.push(pickLayerMesh);
      this.polygonPLGroup.add(pickLayerMesh);

      const pickItemMesh = new THREE.Mesh(geometry, this.polygonPMMaterial);
      pickItemMesh.position.set(cx, cy, 0);
      this.polygonPMMeshList.push(pickItemMesh);
      this.polygonPMGroup.add(pickItemMesh);

      const borderGeometry = new GeoJSONPolygonBorderListGeometry(list);

      const borderMesh = new THREE.Mesh(borderGeometry, this.polygonBorderMaterial);
      borderMesh.position.set(cx, cy, 0.2);
      this.polygonBorderMeshList.push(borderMesh);
      this.polygonBorderGroup.add(borderMesh);

      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    await this.setPolygonColor(this.polygonColor);
    await this.setPolygonHeight(this.polygonHeight);
  }
}
