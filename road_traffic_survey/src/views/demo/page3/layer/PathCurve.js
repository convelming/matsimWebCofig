import * as THREE from "three";

export class PathCurve extends THREE.Curve {
  id = 0;
  minTime = 0;
  maxTime = 0;

  dis = 0;
  nodes = [];
  center = null;

  constructor(id, nodes, center) {
    super();
    if (!center) center = new THREE.Vector3(nodes[0][0], nodes[0][1], 0);
    else center = new THREE.Vector3(center[0], center[1], 0);
    const list = [];
    let dis = 0;
    for (let i = 0; i < nodes.length; i++) {
      let [x, y, z, t] = nodes[i];
      const v = new THREE.Vector3(x, y, z).sub(center);
      if (i > 0) {
        dis += v.distanceTo(list[i - 1].v);
      }
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
  }

  setCenter(center) {
    const oc = this.center;
    for (const node of this.nodes) {
      node.v.add(oc).sub(center);
    }
    this.center = center;
  }

  getPoint(t, optionalTarget = new THREE.Vector3()) {
    const dis = t * this.dis;
    if (dis == 0) {
      const poi = this.nodes[0].v;
      return optionalTarget.set(poi.x, poi.y, poi.z);
    }
    for (let i = 0; i < this.nodes.length; i++) {
      const point = this.nodes[i];
      if (point.d >= dis) {
        const sp = this.nodes[i - 1];
        const ep = this.nodes[i];
        const p = (dis - sp.d) / (ep.d - sp.d);
        const poi = new THREE.Vector3().lerpVectors(sp.v, ep.v, p);
        return optionalTarget.set(poi.x, poi.y, poi.z);
      }
    }
    return optionalTarget.set(0, 0, 0);
  }

  getPointByTime(time) {
    if (this.nodes.length == 0) {
      return {
        point: new THREE.Vector3(),
        speed: 0,
        dir: new THREE.Vector3(),
      };
    } else if (time <= this.minTime) {
      return {
        point: this.nodes[0].v,
        speed: 0,
        dir: this.nodes[0].v,
      };
    } else if (time >= this.maxTime) {
      return {
        point: this.nodes[this.nodes.length - 1].v,
        speed: 0,
        dir: this.nodes[this.nodes.length - 1].v,
      };
    } else {
      for (let i = 0; i < this.nodes.length; i++) {
        const point = this.nodes[i];
        if (point.t >= time) {
          const sp = this.nodes[i - 1];
          const ep = this.nodes[i];
          const p = (time - sp.t) / (ep.t - sp.t);
          const poi = new THREE.Vector3().lerpVectors(sp.v, ep.v, p);
          return {
            point: poi,
            speed: (ep.d - sp.d) / (ep.t - sp.t),
            dir: poi,
          };
        }
      }
    }
  }
}
