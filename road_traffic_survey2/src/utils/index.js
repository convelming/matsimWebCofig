import { GeoJSONLayer, LINE_WIDTH_STYLE, LINE_STYLE } from "./GeoJSONLayer.js";
import GeoJSONLayerWorker from "./GeoJSONLayer.worker.js?worker";
import * as THREE from "three";


export function parserGeoJSON(text) {
  return new Promise((resolve, reject) => {
    const worker = new GeoJSONLayerWorker();
    worker.onmessage = (event) => {
      const { range, center, pointArray, lineArray, polygonArray, propertiesListArray, propertiesLabelsArray, geomListArray } = event.data;

      const textDecoder = new TextDecoder();
      const propertiesLabels = JSON.parse(textDecoder.decode(propertiesLabelsArray));
      const propertiesList = JSON.parse(textDecoder.decode(propertiesListArray));
      const geomList = JSON.parse(textDecoder.decode(geomListArray));

      resolve({ range, center, pointArray, lineArray, polygonArray, propertiesList, propertiesLabels, geomList });
      worker.terminate();
    };
    worker.addEventListener("error", (error) => {
      reject(error);
      worker.terminate();
    });

    let textEncoder = new TextEncoder();
    const array = new Int8Array(textEncoder.encode(text));
    worker.postMessage(array, [array.buffer]);
  }).catch(console.log);
}

export function getColorBarByPropertie(aData, aItem) {
  try {
    const data = Object.assign(
      {},
      {
        type: "Number",
        name: "",
        min: 0,
        max: 10,
        values: [0, 10],
      },
      aData
    );
    const item = Object.assign(
      {},
      {
        valueKey: "",
        valueType: "",
        startColor: "#FEE0D2",
        endColor: "#B50404",
        // startColor: "#CCE7F9",
        // endColor: "#1B60A1",
        model: "count", // count interval
        modelClass: 5,
        labelRule: undefined, // null || undefined 使用`${min} ~ ${max}` en 使用字母顺序
        toFixed: 4,
        colorList: ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"],
      },
      aItem
    );
    const startColor = new THREE.Color(item.startColor);
    const endColor = new THREE.Color(item.endColor);
    const list = [];

    function getLabel(labelRule, { min, max, index }) {
      try {
        switch (labelRule) {
          case "EN": {
            const n1 = Math.floor(index / 26);
            const n2 = index % 26;
            const arr = new Array(n1).fill("z");
            arr.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ"[n2]);
            return arr.join("");
          }
          case "en": {
            const n1 = Math.floor(index / 26);
            const n2 = index % 26;
            const arr = new Array(n1).fill("z");
            arr.push("abcdefghijklmnopqrstuvwxyz"[n2]);
            return arr.join("");
          }
        }
      } catch (error) {}
      return `${min} ~ ${max}`;
    }

    if (data.type == "Number" && item.model == "count") {
      const modelClass = item.modelClass;
      let min = data.min;
      let max = data.max;
      if (min == max) {
        min--;
        max++;
      }
      const step = (max - min) / modelClass;
      for (let i = 0; i < modelClass; i++) {
        const color = new THREE.Color().lerpColors(startColor, endColor, i / modelClass);
        const min2 = Number(Number(min + step * i).toFixed(item.toFixed));
        const max2 = Number(Number(min + step * (i + 1)).toFixed(item.toFixed));
        list.push({
          min: min2,
          max: max2,
          range: [min, max],
          color: "#" + color.getHexString(),
          label: getLabel(item.labelRule, { min: min2, max: max2, index: i }),
          use: true,
        });
      }
    } else if (data.type == "Number" && item.model == "interval") {
      const modelClass = item.modelClass;
      const values = Array.from(data.values || []);
      values.shift();
      values.sort((a, b) => a - b);
      const step = values.length / modelClass;
      for (let i = 0; i < modelClass; i++) {
        let s = Math.floor(i * step);
        let e = Math.floor((i + 1) * step) - 1;
        if (e < s) e = s;
        const color = new THREE.Color().lerpColors(startColor, endColor, i / modelClass);
        list.push({
          min: values[s],
          max: values[e],
          range: [data.min, data.max],
          color: "#" + color.getHexString(),
          // label: `${values[s]} ~ ${values[e]}`,
          label: getLabel(item.labelRule, { min: values[s], max: values[e], index: i }),
          use: true,
        });
      }
    } else if (data.type == "String") {
      const mapList = Object.entries(data.map);
      for (let i = 0, l = mapList.length; i < l; i++) {
        const [mk, mi] = mapList[i];
        const color = new THREE.Color(item.colorList[i % item.colorList.length]); //new THREE.Color().lerpColors(startColor, endColor, i / l);
        list.push({
          min: mi - 0.5,
          max: mi + 0.5,
          range: [data.min, data.max],
          color: "#" + color.getHexString(),
          label: mk == "null" || !mk ? "未知" : mk,
          use: true,
        });
      }
    }
    return list;
  } catch (error) {
    return [];
  }
}

export function getMapContext() {
  return new Promise((resolve, reject) => {
    const MapRef = inject("MapRef");
    if (MapRef.value) {
      resolve(MapRef.value);
    } else {
      const stopWatch = watch(
        MapRef,
        (mapContext) => {
          if (mapContext) {
            resolve(mapContext);
            stopWatch();
          }
        },
        { immediate: true }
      );
    }
  });
}

export function getMapBack() {
  const layerObj = inject("layerObj");
  const _BackLayer1 = layerObj.value._BackLayer1;
  const _BackLayer2 = layerObj.value._BackLayer2;
  const _BackLayer_gz = layerObj.value._BackLayer_gz;
  const _BackLayer_hp = layerObj.value._BackLayer_hp;
  const _BackLayer_kxc = layerObj.value._BackLayer_kxc;
  function add(map, layers = []) {
    if (layers.includes("back1")) {
      map.addLayer(_BackLayer1);
    }
    if (layers.includes("back2")) {
      map.addLayer(_BackLayer2);
    }
    if (layers.includes("back_gz")) {
      map.addLayer(_BackLayer_gz);
    }
    if (layers.includes("back_hp")) {
      map.addLayer(_BackLayer_hp);
    }
    if (layers.includes("back_kxc")) {
      map.addLayer(_BackLayer_kxc);
    }
  }

  function remove() {
    _BackLayer1.removeFromParent();
    _BackLayer2.removeFromParent();
    _BackLayer_gz.removeFromParent();
    _BackLayer_hp.removeFromParent();
    _BackLayer_kxc.removeFromParent();
  }

  function dispose() {
    _BackLayer1.dispose();
    _BackLayer2.dispose();
    _BackLayer_gz.dispose();
    _BackLayer_hp.dispose();
    _BackLayer_kxc.dispose();
  }

  function setCenterAndSize(key, center, size) {
    switch (key) {
      case "gz":
        _BackLayer1.setCenter([12633830, 2656621]);
        _BackLayer1.setSize(210000, 210000);
        _BackLayer2.setCenter([12633830, 2656621]);
        _BackLayer2.setSize(210000, 210000 * 1.4);
        break;
      case "hp":
        _BackLayer1.setCenter([12634609, 2659952]);
        _BackLayer1.setSize(50000, 50000);
        _BackLayer2.setCenter([12634609, 2659952]);
        _BackLayer2.setSize(50000, 50000 * 1.4);
        break;
      case "kxc":
        _BackLayer1.setCenter([12632921, 2651292]);
        _BackLayer1.setSize(21000, 21000);
        _BackLayer2.setCenter([12632921, 2651292]);
        _BackLayer2.setSize(21000, 21000 * 1.4);
        break;
      default:
        _BackLayer1.setCenter(center);
        _BackLayer1.setSize(size, size);
        _BackLayer2.setCenter(center);
        _BackLayer2.setSize(size, size * 1.4);
        break;
    }
  }

  return {
    layerObj,
    add,
    remove,
    dispose,
    setCenterAndSize,
  };
}
