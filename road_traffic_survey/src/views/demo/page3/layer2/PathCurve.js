import * as THREE from "three";

// export class PathCurve extends THREE.Curve {
//   id = 0;
//   minTime = 0;
//   maxTime = 0;

//   dis = 0;
//   nodes = [];
//   center = null;

//   constructor(id, nodes, center) {
//     super();
//     if (!center) center = new THREE.Vector3(nodes[0][0], nodes[0][1], 0);
//     else center = new THREE.Vector3(center[0], center[1], 0);
//     const list = [];
//     let dis = 0;
//     for (let i = 0; i < nodes.length; i++) {
//       let [x, y, z, t] = nodes[i];
//       const v = new THREE.Vector3(x, y, z).sub(center);
//       if (i > 0) {
//         dis += v.distanceTo(list[i - 1].v);
//       }
//       list.push({
//         v: v,
//         t: t,
//         d: dis,
//       });
//     }

//     this.id = id;
//     this.center = center;
//     this.nodes = list;
//     this.dis = dis;
//     this.minTime = list[0].t;
//     this.maxTime = list[list.length - 1].t;
//   }

//   setCenter(center) {
//     const oc = this.center;
//     for (const node of this.nodes) {
//       node.v.add(oc).sub(center);
//     }
//     this.center = center;
//   }

//   getPoint(t, optionalTarget = new THREE.Vector3()) {
//     const dis = t * this.dis;
//     if (dis == 0) {
//       const poi = this.nodes[0].v;
//       return optionalTarget.set(poi.x, poi.y, poi.z);
//     }
//     for (let i = 0; i < this.nodes.length; i++) {
//       const point = this.nodes[i];
//       if (point.d >= dis) {
//         const sp = this.nodes[i - 1];
//         const ep = this.nodes[i];
//         const p = (dis - sp.d) / (ep.d - sp.d);
//         const poi = new THREE.Vector3().lerpVectors(sp.v, ep.v, p);
//         return optionalTarget.set(poi.x, poi.y, poi.z);
//       }
//     }
//     return optionalTarget.set(0, 0, 0);
//   }

//   getPointByTime(time) {
//     if (this.nodes.length == 0) {
//       return {
//         point: new THREE.Vector3(),
//         speed: 0,
//         dir: new THREE.Vector3(),
//       };
//     } else if (time <= this.minTime) {
//       return {
//         point: this.nodes[0].v,
//         speed: 0,
//         dir: this.nodes[0].v,
//       };
//     } else if (time >= this.maxTime) {
//       return {
//         point: this.nodes[this.nodes.length - 1].v,
//         speed: 0,
//         dir: this.nodes[this.nodes.length - 1].v,
//       };
//     } else {
//       for (let i = 0; i < this.nodes.length; i++) {
//         const point = this.nodes[i];
//         if (point.t >= time) {
//           const sp = this.nodes[i - 1];
//           const ep = this.nodes[i];
//           const p = (time - sp.t) / (ep.t - sp.t);
//           const poi = new THREE.Vector3().lerpVectors(sp.v, ep.v, p);
//           return {
//             point: poi,
//             speed: (ep.d - sp.d) / (ep.t - sp.t),
//             dir: poi,
//           };
//         }
//       }
//     }
//   }
// }

/**
 * https://blog.csdn.net/lxt610/article/details/105071368
 * 获取杨辉三角对应阶数的值
 * @param num 杨辉三角阶数
 * @return 杨辉三角对应阶数的值
 */
function getYangHuiTriangle(num) {
  //计算杨辉三角
  let yangHuiArr = [];
  if (num === 1) {
    yangHuiArr[0] = 1;
  } else {
    yangHuiArr[0] = yangHuiArr[1] = 1;
    for (let i = 3; i <= num; i++) {
      let t = [];
      for (let j = 0; j < i - 1; j++) {
        t[j] = yangHuiArr[j];
      }
      yangHuiArr[0] = yangHuiArr[i - 1] = 1;
      for (let j = 0; j < i - 2; j++) {
        yangHuiArr[j + 1] = t[j] + t[j + 1];
      }
    }
  }
  return yangHuiArr;
}

/**
 * https://blog.csdn.net/lxt610/article/details/105071368
 * 获取贝塞尔曲线点坐标
 * @param t 点的位置 [0 .. 1]
 * @param ctrlPosArr 贝塞尔曲线控制点坐标
 * @return 杨辉三角对应阶数的值
 */
function getCubicBezierNPoint(t, ctrlPosArr) {
  /**贝塞尔曲线控制点数目（阶数）*/
  let number = ctrlPosArr.length;
  /**杨辉三角数据 */
  let yangHuiArr = getYangHuiTriangle(number);
  let tmpX = 0;
  let tmpY = 0;
  let tmpZ = 0;
  for (let j = 0; j < number; j++) {
    tmpX += Math.pow(1 - t, number - j - 1) * ctrlPosArr[j].x * Math.pow(t, j) * yangHuiArr[j];
    tmpY += Math.pow(1 - t, number - j - 1) * ctrlPosArr[j].y * Math.pow(t, j) * yangHuiArr[j];
    tmpZ += Math.pow(1 - t, number - j - 1) * ctrlPosArr[j].z * Math.pow(t, j) * yangHuiArr[j];
  }
  return new THREE.Vector3(tmpX, tmpY, tmpZ);
}

export class PathCurve extends THREE.Curve {
  id = 0;
  center = new THREE.Vector3();
  nodes = [];

  dis = 0;
  minTime = 0;
  maxTime = 0;
  yangHuiArr = [];

  constructor(id, nodes, center) {
    super();
    const list = [];
    let dis = 0;
    for (let i = 0; i < nodes.length; i++) {
      let [x, y, z, t] = nodes[i];
      const v = new THREE.Vector3(x, y, z).sub(center);
      if (i > 0) dis += v.distanceTo(list[i - 1].v);
      list.push({
        v: v,
        t: t,
        d: dis,
      });
    }

    this.id = id;
    this.center = center;
    this.nodes = list;

    this.dis = dis;
    this.minTime = list[0].t;
    this.maxTime = list[list.length - 1].t;
    this.yangHuiArr = getYangHuiTriangle(list.length);
  }

  getPoint(t, optionalTarget = new THREE.Vector3()) {
    /**贝塞尔曲线控制点数目（阶数）*/
    let number = this.nodes.length;
    let tmpX = 0;
    let tmpY = 0;
    let tmpZ = 0;
    for (let j = 0; j < number; j++) {
      tmpX += Math.pow(1 - t, number - j - 1) * this.nodes[j].v.x * Math.pow(t, j) * this.yangHuiArr[j];
      tmpY += Math.pow(1 - t, number - j - 1) * this.nodes[j].v.y * Math.pow(t, j) * this.yangHuiArr[j];
      tmpZ += Math.pow(1 - t, number - j - 1) * this.nodes[j].v.z * Math.pow(t, j) * this.yangHuiArr[j];
    }
    return optionalTarget.set(tmpX, tmpY, tmpZ);
  }

  // getPointByTime(time) {
  //   if (this.nodes.length == 0) {
  //     return {
  //       point: new THREE.Vector3(),
  //       speed: 0,
  //       dir: new THREE.Vector3(),
  //     };
  //   } else if (time <= this.minTime) {
  //     const point = this.getPoint(0);
  //     return {
  //       point: point,
  //       speed: 0,
  //       dir: point,
  //     };
  //   } else if (time >= this.maxTime) {
  //     const point = this.getPoint(1);
  //     return {
  //       point: point,
  //       speed: 0,
  //       dir: point,
  //     };
  //   } else {
  //     for (let i = 0; i < this.nodes.length; i++) {
  //       const point = this.nodes[i];
  //       if (point.t >= time) {
  //         const sp = this.nodes[i - 1];
  //         const ep = this.nodes[i];
  //         const p = (time - sp.t) / (ep.t - sp.t);
  //         const t = (sp.d + (ep.d - sp.d) * p) / this.dis;
  //         const point = this.getPoint(t);
  //         return {
  //           point: point,
  //           speed: (ep.d - sp.d) / (ep.t - sp.t),
  //           dir: point,
  //         };
  //       }
  //     }
  //   }
  // }

  getPointByTime(time) {
    if (time <= this.minTime) {
      const point = this.getPoint(0);
      return {
        point: point,
        speed: 0,
        dir: point,
      };
    } else if (time >= this.maxTime) {
      const point = this.getPoint(1);
      return {
        point: point,
        speed: 0,
        dir: point,
      };
    } else {
      const t = (time - this.minTime) / (this.maxTime - this.minTime);
      return {
        point: this.getPoint(t),
        speed: this.dis / (this.maxTime - this.minTime),
        dir: this.getPoint(t),
      };
    }
  }
}
