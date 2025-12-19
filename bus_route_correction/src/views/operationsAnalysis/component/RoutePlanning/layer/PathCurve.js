import * as THREE from "three";

export class LinePath extends THREE.Curve {
  id = 0;
  minTime = 0;
  maxTime = 0;

  dis = 0;
  nodes = [];
  center = null;

  constructor(id, nodes, center) {
    super();
    const list = [];
    let dis = 0;
    for (let i = 0; i < nodes.length; i++) {
      let x, y, z, t;
      if (nodes[i] instanceof Array) {
        [x, y, z, t] = nodes[i];
      } else if (nodes[i] instanceof Object) {
        ({ x, y, z, t } = nodes[i]);
      }
      const v = new THREE.Vector3(x, y, z).sub(center);
      if (i > 0) dis += v.distanceTo(list[i - 1].v);
      list.push({
        v: v,
        t: t || 0,
        d: dis,
      });
    }

    this.id = id;
    this.center = center;
    this.nodes = list;

    this.dis = dis;
    this.minTime = list[0].t;
    this.maxTime = list[list.length - 1].t;
  }

  getPoint(t, optionalTarget = new THREE.Vector3()) {
    if (t <= 0) {
      const poi = this.nodes[0].v;
      return optionalTarget.set(poi.x, poi.y, poi.z);
    } else if (t >= 1) {
      const poi = this.nodes[this.nodes.length - 1].v;
      return optionalTarget.set(poi.x, poi.y, poi.z);
    } else {
      const dis = t * this.dis;
      for (let i = 0; i < this.nodes.length; i++) {
        const point = this.nodes[i];
        if (point.d >= dis) {
          const sp = this.nodes[i - 1];
          const ep = this.nodes[i];
          const p = (dis - sp.d) / (ep.d - sp.d);
          const poi = new THREE.Vector3().lerpVectors(sp.v, ep.v, p);
          return optionalTarget.set(poi.x, poi.y, poi.z);
          // const poi = this.nodes[i].v;
          // return optionalTarget.set(poi.x, poi.y, poi.z);
        }
      }
      return optionalTarget.set(0, 0, 0);
    }
  }

  getPointByTime(time) {
    if (time <= this.minTime) {
      const poi = this.nodes[0].v;
      let dir = poi.clone().normalize();
      if (this.nodes[1]) {
        dir = this.nodes[1].v.clone().sub(poi).normalize();
      }
      return {
        point: poi.clone(),
        speed: 0,
        speedX: 0,
        speedY: 0,
        speedZ: 0,
        tDis: Math.abs(Math.floor(this.dis)),
        dis: 0,
        dir: dir,
        isEnd: true,
      };
    } else if (time >= this.maxTime) {
      const poi = this.nodes[this.nodes.length - 1].v;
      let dir = poi.clone().normalize();
      if (this.nodes[this.nodes.length - 2]) {
        dir = poi
          .clone()
          .sub(this.nodes[this.nodes.length - 2].v)
          .normalize();
      }
      return {
        point: poi.clone(),
        speed: 0,
        speedX: 0,
        speedY: 0,
        speedZ: 0,
        tDis: Math.abs(Math.floor(this.dis)),
        dis: Math.abs(Math.floor(this.dis)),
        dir: dir,
        isEnd: true,
      };
    } else {
      let poi = new THREE.Vector3();
      let dir = new THREE.Vector3();
      let speed = 0;
      let speedX = 0;
      let speedY = 0;
      let speedZ = 0;
      let dis = 0;
      for (let i = 0; i < this.nodes.length; i++) {
        if (this.nodes[i].t >= time) {
          const sp = this.nodes[i - 1];
          const ep = this.nodes[i];
          const dtime = ep.t - sp.t;
          speed = (ep.d - sp.d) / dtime;
          speedX = (ep.v.x - sp.v.x) / dtime;
          speedY = (ep.v.y - sp.v.y) / dtime;
          speedZ = (ep.v.z - sp.v.z) / dtime;
          const p = (time - sp.t) / dtime;
          poi = new THREE.Vector3().lerpVectors(sp.v, ep.v, p);
          dir = ep.v.clone().sub(sp.v).normalize();
          dis = p * (ep.d - sp.d) + sp.d;
          break;
        }
      }
      return {
        point: poi,
        speed: Math.abs(Math.floor(speed)),
        speedX: Math.abs(Math.floor(speedX)),
        speedY: Math.abs(Math.floor(speedY)),
        speedZ: Math.abs(Math.floor(speedZ)),
        tDis: Math.abs(Math.floor(this.dis)),
        dis: Math.abs(Math.floor(dis)),
        dir: dir,
        isEnd: false,
      };
    }
  }

  getPoints2() {
    return this.nodes.map((v) => v.v);
  }
}

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

export class CubicBezierPath extends THREE.Curve {
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
      let x, y, z, t;
      if (nodes[i] instanceof Array) {
        [x, y, z, t] = nodes[i];
      } else if (nodes[i] instanceof Object) {
        ({ x, y, z, t } = nodes[i]);
      }
      const v = new THREE.Vector3(x, y, z).sub(center);
      if (i > 0) dis += v.distanceTo(list[i - 1].v);
      list.push({
        v: v,
        t: t || 0,
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
    if (t < 0) return this.getPoint(0, optionalTarget);
    if (t > 1) return this.getPoint(1, optionalTarget);
    /**贝塞尔曲线控制点数目（阶数）*/
    let number = this.nodes.length;
    let tmpX = 0;
    let tmpY = 0;
    let tmpZ = 0;
    for (let j = 0; j < number; j++) {
      let p = Math.pow(1 - t, number - j - 1) * Math.pow(t, j) * this.yangHuiArr[j];
      tmpX += p * this.nodes[j].v.x;
      tmpY += p * this.nodes[j].v.y;
      tmpZ += p * this.nodes[j].v.z;
    }
    return optionalTarget.set(tmpX, tmpY, tmpZ);
  }

  getPointByTime(time) {
    if (time <= this.minTime) {
      const point = this.getPoint(0);
      const point2 = this.getPoint(0.01);
      return {
        point: point,
        speed: 0,
        speedX: 0,
        speedY: 0,
        speedZ: 0,
        tDis: Math.abs(Math.floor(this.dis)),
        dis: 0,
        dir: point2.clone().sub(point).normalize(),
        isEnd: true,
      };
    } else if (time >= this.maxTime) {
      const point = this.getPoint(1);
      const point2 = this.getPoint(0.99);
      return {
        point: point,
        speed: 0,
        speedX: 0,
        speedY: 0,
        speedZ: 0,
        tDis: Math.abs(Math.floor(this.dis)),
        dis: Math.abs(Math.floor(this.dis)),
        dir: point.clone().sub(point2).normalize(),
        isEnd: true,
      };
    } else {
      let poi = new THREE.Vector3();
      let dir = new THREE.Vector3();
      let speed = 0;
      let speedX = 0;
      let speedY = 0;
      let speedZ = 0;
      let dis = 0;
      for (let i = 0; i < this.nodes.length; i++) {
        if (this.nodes[i].t > time) {
          const sp = this.nodes[i - 1];
          const ep = this.nodes[i];
          const dtime = ep.t - sp.t;
          dis = ((time - sp.t) / dtime) * (ep.d - sp.d) + sp.d;
          const t = dis / this.dis;
          poi = this.getPoint(t);

          const t2 = (((time + 1 - sp.t) / dtime) * (ep.d - sp.d) + sp.d) / this.dis;
          const poi2 = this.getPoint(t2);
          dir = poi2.clone().sub(poi);
          speed = poi2.length();
          speedX = dir.x;
          speedY = dir.y;
          speedZ = dir.z;
          dir = dir.normalize();
          break;
        }
      }
      return {
        point: poi,
        speed: Math.abs(Math.floor(speed)),
        speedX: Math.abs(Math.floor(speedX)),
        speedY: Math.abs(Math.floor(speedY)),
        speedZ: Math.abs(Math.floor(speedZ)),
        tDis: Math.abs(Math.floor(this.dis)),
        dis: Math.abs(Math.floor(dis)),
        dir: dir,
        isEnd: false,
      };
    }
  }

  getPoints2() {
    return this.getPoints(Math.ceil(this.dis / 100));
  }
}
