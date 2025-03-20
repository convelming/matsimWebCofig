import * as THREE from "three";

export class CarTravelPath {
  constructor(opt = []) {
    this._opt = JSON.parse(JSON.stringify(opt));
    const startPoint = new CarTravelPoint(opt[0].startPoint);
    const endPoint = new CarTravelPoint(opt[opt.length - 1].endPoint);
    const startTime = opt[0].startTime;
    const endTime = opt[opt.length - 1].endTime;

    let minX = Number.MAX_VALUE;
    let minY = Number.MAX_VALUE;

    let maxX = Number.MIN_VALUE;
    let maxY = Number.MIN_VALUE;

    let totalDistance = 0;
    let lIndex = 0;
    const lineList = [];

    for (const v of opt) {
      const line = {
        speed: v.speed,
        linkId: v.linkId,

        time: v.endTime - v.startTime,
        startTime: v.startTime,
        endTime: v.endTime,

        distance: v.distance,
        startDistance: totalDistance,
        endDistance: totalDistance + v.distance,
        start: new CarTravelPoint(v.startPoint),
        end: new CarTravelPoint(v.endPoint),

        index: lIndex++,
      };
      totalDistance = line.endDistance;
      lineList[lineList.length] = line;

      minX = Math.min(minX, v.startPoint[0], v.endPoint[0]);
      maxX = Math.max(maxX, v.startPoint[0], v.endPoint[0]);
      minY = Math.min(minY, v.startPoint[1], v.endPoint[1]);
      maxY = Math.max(maxY, v.startPoint[1], v.endPoint[1]);
    }

    this.originPoint = new CarTravelPoint([minX, minY]);
    this.resultPoint = new CarTravelPoint([maxX, maxY]);

    this.startPoint = startPoint;
    this.endPoint = endPoint;
    this.startTime = startTime;
    this.endTime = endTime;
    this.totalDistance = totalDistance;
    this.lineList = lineList;
  }

  // 根据距离获取点坐标
  getPointByTime(time) {
    if (time <= this.startTime) {
      const line = this.lineList[0];
      return { start: line.start, end: line.end, isRunning: false };
    } else if (time >= this.endTime) {
      const line = this.lineList[this.lineList.length - 1];
      return { start: line.end, end: line.end, isRunning: false };
    }
    for (const line of this.lineList) {
      const { startTime, endTime } = line;
      if (startTime <= time && time < endTime) {
        const percentage = (time - startTime) / endTime;
        return {
          start: line.start.move(line.end, percentage),
          end: line.end,
          isRunning: true,
        };
      }
    }
  }

  toJSON() {
    return JSON.parse(JSON.stringify(this._opt));
  }
}

export class CarTravelPoint {

  x = 0;
  y = 0;
  constructor(arr = [0, 0]) {
    this.x = arr[0];
    this.y = arr[1];
  }

  // 向目标点移动
  move(point, percentage, newObject = true) {
    let x = this.x + (point.x - this.x) * percentage;
    let y = this.y + (point.y - this.y) * percentage;
    if (newObject) {
      return new this.constructor([x, y]);
    } else {
      this.x = x;
      this.y = y;
      return this;
    }
  }

  scale(scale, newObject = true) {
    if (newObject) {
      return new this.constructor([this.x * scale, this.y * scale]);
    } else {
      this.x *= scale;
      this.y *= scale;
      return this;
    }
  }

  offset(point, newObject = true) {
    if (newObject) {
      return new this.constructor([this.x - point.x, this.y - point.y]);
    } else {
      this.x -= point.x;
      this.y -= point.y;
      return this;
    }
  }

  unOffset(point, newObject = true) {
    if (newObject) {
      return new this.constructor([this.x + point.x, this.y + point.y]);
    } else {
      this.x += point.x;
      this.y += point.y;
      return this;
    }
  }

  length() {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  }

  static distance(start, end) {
    return end.offset(start).length();
  }

  clone() {
    return new this.constructor([this.x, this.y]);
  }

  toJSON() {
    return [this.x, this.y];
  }

}


export class CarTravelRouteListGeometry extends THREE.BufferGeometry {
  constructor(routeList) {
    super();
    this.type = "CarTravelRouteGeometry";
    this.isCarTravelRouteGeometry = true;

    const attrPosition = new Array();
    const attrStartPosition = new Array();
    const attrEndPosition = new Array();
    const attrSide = new Array();
    const attrTime = new Array();
    const attrIndex = new Array();
    let indexOffset = 0;
    for (let i1 = 0, l1 = routeList.length; i1 < l1; i1++) {
      const array = routeList[i1];
      for (let i2 = 0, l2 = array.length / 3; i2 < l2; i2++) {
        let prevX = array[i2 * 3 - 3];
        let prevY = array[i2 * 3 - 2];
        let prevL = array[i2 * 3 - 1];
        let thatX = array[i2 * 3 + 0];
        let thatY = array[i2 * 3 + 1];
        let thatL = array[i2 * 3 + 2];
        let nextX = array[i2 * 3 + 3];
        let nextY = array[i2 * 3 + 4];
        let nextL = array[i2 * 3 + 5];
        if (i2 === 0) {
          prevX = thatX * 2 - nextX;
          prevY = thatY * 2 - nextY;
        }
        if (i2 >= l2 - 1) {
          nextX = thatX * 2 - prevX;
          nextY = thatY * 2 - prevY;
        }

        attrPosition[attrPosition.length] = thatX;
        attrPosition[attrPosition.length] = thatY;
        attrPosition[attrPosition.length] = 0;
        attrPosition[attrPosition.length] = thatX;
        attrPosition[attrPosition.length] = thatY;
        attrPosition[attrPosition.length] = 0;

        attrStartPosition[attrStartPosition.length] = prevX;
        attrStartPosition[attrStartPosition.length] = prevY;
        attrStartPosition[attrStartPosition.length] = prevX;
        attrStartPosition[attrStartPosition.length] = prevY;

        attrEndPosition[attrEndPosition.length] = nextX;
        attrEndPosition[attrEndPosition.length] = nextY;
        attrEndPosition[attrEndPosition.length] = nextX;
        attrEndPosition[attrEndPosition.length] = nextY;

        attrTime[attrTime.length] = thatL;
        attrTime[attrTime.length] = thatL;

        attrSide[attrSide.length] = -1;
        attrSide[attrSide.length] = 1;

        if (i2 < l2 - 1) {
          attrIndex[attrIndex.length] = indexOffset + 0;
          attrIndex[attrIndex.length] = indexOffset + 1;
          attrIndex[attrIndex.length] = indexOffset + 3;
          attrIndex[attrIndex.length] = indexOffset + 0;
          attrIndex[attrIndex.length] = indexOffset + 3;
          attrIndex[attrIndex.length] = indexOffset + 2;
        };
        indexOffset += 2;
      }
    }
    this.setAttribute("position", new THREE.Float32BufferAttribute(attrPosition, 3));
    this.setAttribute("startPosition", new THREE.Float32BufferAttribute(attrStartPosition, 2));
    this.setAttribute("endPosition", new THREE.Float32BufferAttribute(attrEndPosition, 2));
    this.setAttribute("side", new THREE.Int8BufferAttribute(attrSide, 1));
    this.setAttribute("time", new THREE.Float32BufferAttribute(attrTime, 1));
    this.setIndex(attrIndex);
    this.computeVertexNormals();
  }
}

export class CarTravelRouteGeometry extends THREE.BufferGeometry {
  constructor(array) {
    super();
    this.type = "CarTravelRouteGeometry";
    this.isCarTravelRouteGeometry = true;

    const length = array.length / 3;
    const attrPosition = new Array();
    const attrStartPosition = new Array();
    const attrEndPosition = new Array();
    const attrSide = new Array();
    const attrTime = new Array();
    const attrIndex = new Array();
    for (let index = 0; index < length; index++) {
      let prevX = array[index * 3 - 3]
      let prevY = array[index * 3 - 2]
      let prevL = array[index * 3 - 1]
      let thatX = array[index * 3 + 0]
      let thatY = array[index * 3 + 1]
      let thatL = array[index * 3 + 2]
      let nextX = array[index * 3 + 3]
      let nextY = array[index * 3 + 4]
      let nextL = array[index * 3 + 5]

      if (index === 0) {
        prevX = thatX * 2 - nextX;
        prevY = thatY * 2 - nextY;
      }
      if (index >= length - 1) {
        nextX = thatX * 2 - prevX;
        nextY = thatY * 2 - prevY;
      }

      attrPosition[index * 6] = thatX;
      attrPosition[index * 6 + 1] = thatY;
      attrPosition[index * 6 + 2] = 0;
      attrPosition[index * 6 + 3] = thatX;
      attrPosition[index * 6 + 4] = thatY;
      attrPosition[index * 6 + 5] = 0;

      attrStartPosition[index * 4] = prevX;
      attrStartPosition[index * 4 + 1] = prevY;
      attrStartPosition[index * 4 + 2] = prevX;
      attrStartPosition[index * 4 + 3] = prevY;

      attrEndPosition[index * 4] = nextX;
      attrEndPosition[index * 4 + 1] = nextY;
      attrEndPosition[index * 4 + 2] = nextX;
      attrEndPosition[index * 4 + 3] = nextY;

      attrTime[index * 2] = thatL;
      attrTime[index * 2 + 1] = thatL;

      attrSide[index * 2] = -1;
      attrSide[index * 2 + 1] = 1;

      if (index < length - 1) {
        attrIndex[index * 6] = index * 2 + 0
        attrIndex[index * 6 + 1] = index * 2 + 1
        attrIndex[index * 6 + 2] = index * 2 + 3
        attrIndex[index * 6 + 3] = index * 2 + 0
        attrIndex[index * 6 + 4] = index * 2 + 3
        attrIndex[index * 6 + 5] = index * 2 + 2
      };
    }
    this.setAttribute("position", new THREE.Float32BufferAttribute(attrPosition, 3));
    this.setAttribute("startPosition", new THREE.Float32BufferAttribute(attrStartPosition, 2));
    this.setAttribute("endPosition", new THREE.Float32BufferAttribute(attrEndPosition, 2));
    this.setAttribute("side", new THREE.Int8BufferAttribute(attrSide, 1));
    this.setAttribute("time", new THREE.Float32BufferAttribute(attrTime, 1));
    this.setIndex(attrIndex);
    this.computeVertexNormals();
  }
}

export class CarTraveRoutelMaterial extends THREE.Material {
  constructor(argu) {
    super();
    const { color = 0xff0000, opacity = 1, lineWidth = 50, lineOffset = 0, map = null, trailLength = 10, trailTime = 0, ...params } = argu || {};
    this.alphaTest = 0.1;
    this.transparent = true;
    this.depthWrite = false;
    this.defines = {
      USE_MAP: !!map,
    };
    this.uniforms = {
      diffuse: {
        value: new THREE.Color(color),
      },
      opacity: {
        value: opacity,
      },
      lineWidth: {
        value: lineWidth,
      },
      lineOffset: {
        value: lineOffset,
      },
      map: {
        value: map,
      },
      uvTransform: {
        value: new THREE.Matrix3(),
      },
      trailLength: {
        value: trailLength,
      },
      trailTime: {
        value: trailTime,
      },
    };
    this.vertexShader = `
      #include <common>
      #include <logdepthbuf_pars_vertex>

      attribute vec3 pickColor;
      attribute float side;
      attribute float time;
      attribute vec2 startPosition;
      attribute vec2 endPosition;
      
      varying vec3 vColor;
      varying vec2 vUv;
      varying float vTime;

      // 当前时间
      uniform float trailTime;
      uniform float lineWidth;
      uniform float lineOffset;
      uniform mat3 uvTransform;

      void main() {

        vTime = time;
        #ifdef USE_MAP
          vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
        #endif
        
        vec3 transformed = vec3(1.0);

        float offset = lineWidth / 2.0 * side + lineOffset;

        float lenA = length(position.xy - startPosition);
        float lenB = length(position.xy - endPosition);

        if(lenA == 0. && lenB == 0.) {
          transformed = position;
        } else {
          vec2 dirA = normalize(position.xy - startPosition);
          vec2 dirB = normalize(position.xy - endPosition);

          if(lenA == 0.) {
            float angle = PI / 2.0;
            vec2 normal = vec2(-dirB.y, dirB.x);
            transformed = vec3(position.xy + normal * offset / sin(angle), position.z);
          } else if(lenB == 0.) {
            float angle = PI / 2.0;
            vec2 normal = vec2(dirA.y, -dirA.x);
            transformed = vec3(position.xy + normal * offset / sin(angle), position.z);
          } else {
            vec2 dir = normalize(dirB - dirA);
            vec2 normal = vec2(-dir.y, dir.x);
            float angle = mod(acos(dot(dirB, normal)), 3.14);
            if(angle < 0.2) angle = 0.2;
            if(angle > 2.94) angle = 2.94;
            transformed = vec3(position.xy + normal * offset / sin(angle), position.z);
          }
        }

        gl_Position = projectionMatrix * modelViewMatrix * vec4( transformed, 1.0 );

        #include <logdepthbuf_vertex>

      }
    `;

    this.fragmentShader = `
      #include <common>
      #include <logdepthbuf_pars_fragment>


      // 当前时间
      uniform float trailLength;
      uniform float trailTime;
      uniform float lineWidth;
      uniform vec3 diffuse;
      uniform float opacity;
      uniform sampler2D map;
      
      varying vec3 vColor;
      varying vec3 vPickColor;
      varying vec2 vUv;
      varying float vTime;

      void main() {
        vec4 diffuseColor = vec4( diffuse, opacity );
        
        #include <logdepthbuf_fragment>

        #ifdef USE_MAP
          vec2 uv = vUv;
          uv.x = mod(vUv.x * vLineLength, lineWidth) / lineWidth;
          vec4 sampledDiffuseColor = texture2D(map, uv);
          sampledDiffuseColor.rgb *= sampledDiffuseColor.a;
          diffuseColor.rgb += sampledDiffuseColor.rgb;
        #endif
        if(vTime > trailTime){
          diffuseColor.a = 0.0;
        }
        diffuseColor.a *= 1.0 - (trailTime - vTime) / trailLength;

        gl_FragColor = diffuseColor;

      }
    `;
    this.setValues(params);
  }
}

export class RoadGeometry extends THREE.BufferGeometry {
  constructor(array) {
    super();
    this.type = "RoadGeometry";
    this.isRoadGeometry = true;

    const length = array.length / 3;
    const attrPosition = new Array();
    const attrStartPosition = new Array();
    const attrEndPosition = new Array();
    const attrSide = new Array();
    const attrIndex = new Array();
    const attrUv = new Array();
    let roadLength = 0;
    for (let index = 0; index < length; index++) {
      let prevX = array[index * 3 - 3]
      let prevY = array[index * 3 - 2]
      let prevL = array[index * 3 - 1]
      let thatX = array[index * 3 + 0]
      let thatY = array[index * 3 + 1]
      let thatL = array[index * 3 + 2]
      let nextX = array[index * 3 + 3]
      let nextY = array[index * 3 + 4]
      let nextL = array[index * 3 + 5]

      if (index === 0) {
        prevX = thatX * 2 - nextX;
        prevY = thatY * 2 - nextY;
      }
      if (index >= length - 1) {
        nextX = thatX * 2 - prevX;
        nextY = thatY * 2 - prevY;
      }


      attrPosition[index * 6] = thatX;
      attrPosition[index * 6 + 1] = thatY;
      attrPosition[index * 6 + 2] = 0;
      attrPosition[index * 6 + 3] = thatX;
      attrPosition[index * 6 + 4] = thatY;
      attrPosition[index * 6 + 5] = 0;

      attrStartPosition[index * 4] = prevX;
      attrStartPosition[index * 4 + 1] = prevY;
      attrStartPosition[index * 4 + 2] = prevX;
      attrStartPosition[index * 4 + 3] = prevY;

      attrEndPosition[index * 4] = nextX;
      attrEndPosition[index * 4 + 1] = nextY;
      attrEndPosition[index * 4 + 2] = nextX;
      attrEndPosition[index * 4 + 3] = nextY;

      if (index > 0) {
        roadLength += Math.sqrt(Math.pow(thatX - prevX, 2) + Math.pow(thatY - prevY, 2));
      }

      attrUv[index * 4] = 0;
      attrUv[index * 4 + 1] = roadLength;
      attrUv[index * 4 + 2] = 1;
      attrUv[index * 4 + 3] = roadLength;

      attrSide[index * 2] = -1;
      attrSide[index * 2 + 1] = 1;

      if (index < length - 1) {
        attrIndex[index * 6] = index * 2 + 0
        attrIndex[index * 6 + 1] = index * 2 + 1
        attrIndex[index * 6 + 2] = index * 2 + 3
        attrIndex[index * 6 + 3] = index * 2 + 0
        attrIndex[index * 6 + 4] = index * 2 + 3
        attrIndex[index * 6 + 5] = index * 2 + 2
      };
    }
    this.setAttribute("position", new THREE.Float32BufferAttribute(attrPosition, 3));
    this.setAttribute("startPosition", new THREE.Float32BufferAttribute(attrStartPosition, 2));
    this.setAttribute("endPosition", new THREE.Float32BufferAttribute(attrEndPosition, 2));
    this.setAttribute("side", new THREE.Int8BufferAttribute(attrSide, 1));
    this.setAttribute("uv", new THREE.Float32BufferAttribute(attrUv.map((v, i) => i % 2 != 0 ? v : v / roadLength)), 2);
    this.setIndex(attrIndex);
    this.computeVertexNormals();
  }
}


export class RoadlMaterial extends THREE.Material {
  constructor(argu) {
    super();
    const { color = 0xff0000, opacity = 1, lineWidth = 50, lineOffset = 0, map = null, trailLength = 10, trailTime = 0, ...params } = argu || {};
    this.alphaTest = 0.1;
    this.transparent = true;
    this.depthWrite = false;
    this.defines = {
      USE_MAP: !!map,
    };
    this.uniforms = {
      diffuse: {
        value: new THREE.Color(color),
      },
      opacity: {
        value: opacity,
      },
      lineWidth: {
        value: lineWidth,
      },
      lineOffset: {
        value: lineOffset,
      },
      map: {
        value: map,
      },
      uvTransform: {
        value: new THREE.Matrix3(),
      },
      trailTime: {
        value: trailTime,
      },
    };
    this.vertexShader = `
      #include <common>
      #include <logdepthbuf_pars_vertex>

      attribute vec3 pickColor;
      attribute float side;
      attribute float length;
      attribute vec2 startPosition;
      attribute vec2 endPosition;
      
      varying vec3 vColor;
      varying vec2 vUv;

      uniform float lineWidth;
      uniform float lineOffset;
      uniform mat3 uvTransform;

      void main() {

        #ifdef USE_MAP
          vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
        #endif
        
        vec3 transformed = vec3(1.0);

        float offset = lineWidth / 2.0 * side + lineOffset;

        float lenA = length(position.xy - startPosition);
        float lenB = length(position.xy - endPosition);

        if(lenA == 0. && lenB == 0.) {
          transformed = position;
        } else {
          vec2 dirA = normalize(position.xy - startPosition);
          vec2 dirB = normalize(position.xy - endPosition);

          if(lenA == 0.) {
            float angle = PI / 2.0;
            vec2 normal = vec2(-dirB.y, dirB.x);
            transformed = vec3(position.xy + normal * offset / sin(angle), position.z);
          } else if(lenB == 0.) {
            float angle = PI / 2.0;
            vec2 normal = vec2(dirA.y, -dirA.x);
            transformed = vec3(position.xy + normal * offset / sin(angle), position.z);
          } else {
            vec2 dir = normalize(dirB - dirA);
            vec2 normal = vec2(-dir.y, dir.x);
            float angle = mod(acos(dot(dirB, normal)), 3.14);
            if(angle < 0.2) angle = 0.2;
            if(angle > 2.94) angle = 2.94;
            transformed = vec3(position.xy + normal * offset / sin(angle), position.z);
          }
        }

        gl_Position = projectionMatrix * modelViewMatrix * vec4( transformed, 1.0 );

        #include <logdepthbuf_vertex>

      }
    `;
    this.fragmentShader = `
      #include <common>
      #include <logdepthbuf_pars_fragment>


      // 当前时间
      uniform float trailLength;
      uniform float lineWidth;
      uniform vec3 diffuse;
      uniform float opacity;
      uniform sampler2D map;
      
      varying vec3 vColor;
      varying vec3 vPickColor;
      varying vec2 vUv;

      void main() {
        vec4 diffuseColor = vec4( diffuse, opacity );
        
        #include <logdepthbuf_fragment>

        #ifdef USE_MAP
          vec2 uv = vUv;
          uv.x = mod(vUv.x * vLineLength, lineWidth) / lineWidth;
          vec4 sampledDiffuseColor = texture2D(map, uv);
          sampledDiffuseColor.rgb *= sampledDiffuseColor.a;
          diffuseColor.rgb += sampledDiffuseColor.rgb;
        #endif

        gl_FragColor = diffuseColor;

      }
    `;
    this.setValues(params);
  }
}