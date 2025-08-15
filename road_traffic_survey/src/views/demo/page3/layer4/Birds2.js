import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import { GPUComputationRenderer } from "three/addons/misc/GPUComputationRenderer.js";

const fragmentShaderPosition = `
  uniform float time;
  uniform float delta;

  void main()	{

    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 tmpPos = texture2D( texturePosition, uv );
    vec3 position = tmpPos.xyz;
    vec3 velocity = texture2D( textureVelocity, uv ).xyz;

    float phase = tmpPos.w;

    phase = mod( ( phase + delta +
      length( velocity.xz ) * delta * 3. +
      max( velocity.y, 0.0 ) * delta * 6. ), 62.83 );

    gl_FragColor = vec4( position + velocity * delta * 15. , phase );

  }
`;
const fragmentShaderVelocity = `
  uniform float time;
  uniform float testing;
  uniform float delta; // about 0.016
  uniform float separationDistance; // 20
  uniform float alignmentDistance; // 40
  uniform float cohesionDistance; //
  uniform float freedomFactor;
  uniform vec3 predator;

  const float width = resolution.x;
  const float height = resolution.y;

  const float PI = 3.141592653589793;
  const float PI_2 = PI * 2.0;
  // const float VISION = PI * 0.55;

  float zoneRadius = 40.0;
  float zoneRadiusSquared = 1600.0;

  float separationThresh = 0.45;
  float alignmentThresh = 0.65;

  const float UPPER_BOUNDS = BOUNDS;
  const float LOWER_BOUNDS = -UPPER_BOUNDS;

  const float SPEED_LIMIT = 9.0;

  float rand( vec2 co ){
    return fract( sin( dot( co.xy, vec2(12.9898,78.233) ) ) * 43758.5453 );
  }

  void main() {

    zoneRadius = separationDistance + alignmentDistance + cohesionDistance;
    separationThresh = separationDistance / zoneRadius;
    alignmentThresh = ( separationDistance + alignmentDistance ) / zoneRadius;
    zoneRadiusSquared = zoneRadius * zoneRadius;


    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec3 birdPosition, birdVelocity;

    vec3 selfPosition = texture2D( texturePosition, uv ).xyz;
    vec3 selfVelocity = texture2D( textureVelocity, uv ).xyz;

    float dist;
    vec3 dir; // direction
    float distSquared;

    float separationSquared = separationDistance * separationDistance;
    float cohesionSquared = cohesionDistance * cohesionDistance;

    float f;
    float percent;

    vec3 velocity = selfVelocity;

    float limit = SPEED_LIMIT;

    dir = predator * UPPER_BOUNDS - selfPosition;
    dir.z = 0.;
    // dir.z *= 0.6;
    dist = length( dir );
    distSquared = dist * dist;

    float preyRadius = 150.0;
    float preyRadiusSq = preyRadius * preyRadius;


    // move birds away from predator
    if ( dist < preyRadius ) {

      f = ( distSquared / preyRadiusSq - 1.0 ) * delta * 100.;
      velocity += normalize( dir ) * f;
      limit += 5.0;
    }


    // if (testing == 0.0) {}
    // if ( rand( uv + time ) < freedomFactor ) {}


    // Attract flocks to the center
    vec3 central = vec3( 0., 0., 0. );
    dir = selfPosition - central;
    dist = length( dir );

    dir.y *= 2.5;
    velocity -= normalize( dir ) * delta * 5.;

    for ( float y = 0.0; y < height; y++ ) {
      for ( float x = 0.0; x < width; x++ ) {

        vec2 ref = vec2( x + 0.5, y + 0.5 ) / resolution.xy;
        birdPosition = texture2D( texturePosition, ref ).xyz;

        dir = birdPosition - selfPosition;
        dist = length( dir );

        if ( dist < 0.0001 ) continue;

        distSquared = dist * dist;

        if ( distSquared > zoneRadiusSquared ) continue;

        percent = distSquared / zoneRadiusSquared;

        if ( percent < separationThresh ) { // low

          // Separation - Move apart for comfort
          f = ( separationThresh / percent - 1.0 ) * delta;
          velocity -= normalize( dir ) * f;

        } else if ( percent < alignmentThresh ) { // high

          // Alignment - fly the same direction
          float threshDelta = alignmentThresh - separationThresh;
          float adjustedPercent = ( percent - separationThresh ) / threshDelta;

          birdVelocity = texture2D( textureVelocity, ref ).xyz;

          f = ( 0.5 - cos( adjustedPercent * PI_2 ) * 0.5 + 0.5 ) * delta;
          velocity += normalize( birdVelocity ) * f;

        } else {

          // Attraction / Cohesion - move closer
          float threshDelta = 1.0 - alignmentThresh;
          float adjustedPercent;
          if( threshDelta == 0. ) adjustedPercent = 1.;
          else adjustedPercent = ( percent - alignmentThresh ) / threshDelta;

          f = ( 0.5 - ( cos( adjustedPercent * PI_2 ) * -0.5 + 0.5 ) ) * delta;

          velocity += normalize( dir ) * f;

        }

      }

    }

    // this make tends to fly around than down or up
    // if (velocity.y > 0.) velocity.y *= (1. - 0.2 * delta);

    // Speed Limits
    if ( length( velocity ) > limit ) {
      velocity = normalize( velocity ) * limit;
    }

    gl_FragColor = vec4( velocity, 1.0 );

  }

`;

class KnotCurve extends THREE.Curve {
  constructor(radius = 1, p = 2, q = 3) {
    super();
    this.radius = radius;
    this.p = p;
    this.q = q;
  }

  getPoint(t, optionalTarget = new THREE.Vector3()) {
    const { p, q, radius } = this;
    const u = t * p * Math.PI * 2;

    const cu = Math.cos(u);
    const su = Math.sin(u);
    const quOverP = (q / p) * u;
    const cs = Math.cos(quOverP);

    optionalTarget.x = radius * (2 + cs) * 0.5 * cu;
    optionalTarget.y = radius * (2 + cs) * su * 0.5;
    optionalTarget.z = radius * Math.sin(quOverP) * 0.5;
    return optionalTarget;
  }
}

export class Birds extends THREE.Group {
  constructor(renderer, options) {
    super();
    const { width = 30, bounds = 100, color = 0x00ffff, size = 2, opacity = 1, map = new THREE.TextureLoader().load(require("@/assets/image/point.svg")) } = options || {};
    const geometry = new THREE.BufferGeometry();
    geometry.boundingBox = new THREE.Box3(new THREE.Vector3(-bounds, -bounds, -bounds), new THREE.Vector3(bounds, bounds, bounds));
    const material = new THREE.PointsMaterial({
      color: color,
      size: size,
      opacity: opacity,
      transparent: true,
      map: map,
      depthFunc: THREE.AlwaysDepth,
      depthTest: false,
      depthWrite: false,
    });
    this.mesh = new THREE.Points(geometry, material);
    this.add(this.mesh);

    this.width = width;
    this.bounds = bounds;
    this.bounds_half = bounds / 2;

    const vertices = [];
    const references = [];
    for (let i = 0, l = width * width; i < l; i++) {
      const x = (i % width) / width;
      const y = ~~(i / width) / width;
      vertices.push(0, 0, 0);
      references.push(x, y);
    }
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute("reference", new THREE.Float32BufferAttribute(references, 2));
    geometry.computeBoundingBox();
    // geometry.boundingBox = new THREE.Box3(new THREE.Vector3(-this.bounds, -this.bounds, -this.bounds), new THREE.Vector3(this.bounds, this.bounds, this.bounds));

    material.onBeforeCompile = (shader) => {
      shader.uniforms.texturePosition = { value: null };
      shader.uniforms.textureVelocity = { value: null };
      shader.uniforms.time = { value: 1.0 };

      let token = "#include <common>";

      let insert = /* glsl */ `
        attribute vec4 reference;
        uniform sampler2D texturePosition;
        uniform sampler2D textureVelocity;
        uniform float time;
      `;

      shader.vertexShader = shader.vertexShader.replace(token, insert + token);

      token = "#include <begin_vertex>";

      insert = /* glsl */ `
        vec4 tmpPos = texture2D( texturePosition, reference.xy );

        vec3 pos = tmpPos.xyz;
        vec3 velocity = normalize(texture2D( textureVelocity, reference.xy ).xyz);
        vec3 newPosition = position;

        newPosition = mat3( modelMatrix ) * ( newPosition );

        velocity.z *= -1.;
        float xz = length( velocity.xz );
        float xyz = 1.;
        float x = sqrt( 1. - velocity.y * velocity.y );

        float cosry = velocity.x / xz;
        float sinry = velocity.z / xz;

        float cosrz = x / xyz;
        float sinrz = velocity.y / xyz;

        mat3 maty =  mat3( cosry, 0, -sinry, 0    , 1, 0     , sinry, 0, cosry );
        mat3 matz =  mat3( cosrz , sinrz, 0, -sinrz, cosrz, 0, 0     , 0    , 1 );

        newPosition =  maty * matz * newPosition;
        newPosition += pos;

        vec3 transformed = vec3( newPosition );
      `;

      shader.vertexShader = shader.vertexShader.replace(token, insert);

      this.materialShader = shader;
    };

    this.predatorCurveT = 0;
    this.predatorCurve = new KnotCurve(bounds , 4, 1);
    this.predator = this.predatorCurve.getPoint(this.predatorCurveT);
    // this.predatorMesh = this.getBoxMesh(bounds, 0xff0000);

    // this.add(this.predatorMesh);

    // this.line = this.getCurveLine(bounds * 3);
    // this.add(this.line);

    this.initComputeRenderer(renderer);
  }

  getCurveLine(radius = 1) {
    const curve = new KnotCurve(radius, 4, 1);
    const ponits = curve.getPoints(100);
    const geometry = new THREE.BufferGeometry().setFromPoints(ponits);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    return new THREE.Line(geometry, material);
  }

  // 创建一个立方体
  getBoxMesh(size = 100, color = 0xff0000) {
    //创建一个长方体几何对象Geometry
    const geometry = new THREE.BoxGeometry(size, size, size);
    //创建一个材质对象Material
    const material = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide, //两面可见
      color: color, //0xff0000设置材质颜色为红色
    });
    // 两个参数分别为几何体geometry、材质material
    const mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
    //设置网格模型在三维空间中的位置坐标，默认是坐标原点
    // mesh.position.set(0, 10, 0);
    return mesh;
  }

  initComputeRenderer(renderer) {
    if (this.gpuCompute) {
      this.gpuCompute = null;
      this.gpuCompute.dispose();
    }
    if (!renderer) return;
    this.renderer = renderer;
    this.gpuCompute = new GPUComputationRenderer(this.width, this.width, renderer);

    const dtPosition = this.gpuCompute.createTexture();
    const dtVelocity = this.gpuCompute.createTexture();
    this._fillPositionTexture(dtPosition);
    this._fillVelocityTexture(dtVelocity);

    this.velocityVariable = this.gpuCompute.addVariable("textureVelocity", fragmentShaderVelocity, dtVelocity);
    this.positionVariable = this.gpuCompute.addVariable("texturePosition", fragmentShaderPosition, dtPosition);

    this.gpuCompute.setVariableDependencies(this.velocityVariable, [this.positionVariable, this.velocityVariable]);
    this.gpuCompute.setVariableDependencies(this.positionVariable, [this.positionVariable, this.velocityVariable]);

    this.positionUniforms = this.positionVariable.material.uniforms;
    this.velocityUniforms = this.velocityVariable.material.uniforms;

    this.positionUniforms["time"] = { value: 0.0 }; //
    this.positionUniforms["delta"] = { value: 0.0 }; //
    this.velocityUniforms["time"] = { value: 1.0 }; //
    this.velocityUniforms["delta"] = { value: 0.0 }; //
    this.velocityUniforms["separationDistance"] = { value: 10 }; // 分离距离
    this.velocityUniforms["alignmentDistance"] = { value: 10 }; // 对齐距离
    this.velocityUniforms["cohesionDistance"] = { value: 20 }; // 聚居距离
    this.velocityUniforms["freedomFactor"] = { value: 0.9 }; // 自由因素
    this.velocityUniforms["predator"] = { value: this.predator }; // 捕食者
    this.velocityVariable.material.defines.BOUNDS = this.bounds.toFixed(2);

    this.velocityVariable.wrapS = THREE.RepeatWrapping;
    this.velocityVariable.wrapT = THREE.RepeatWrapping;
    this.positionVariable.wrapS = THREE.RepeatWrapping;
    this.positionVariable.wrapT = THREE.RepeatWrapping;

    const error = this.gpuCompute.init();

    if (error !== null) {
      console.error(error);
    }
  }

  _fillPositionTexture(texture) {
    const theArray = texture.image.data;

    for (let k = 0, kl = theArray.length; k < kl; k += 4) {
      const x = Math.random() * this.bounds - this.bounds_half;
      const y = Math.random() * this.bounds - this.bounds_half;
      const z = Math.random() * this.bounds - this.bounds_half;

      theArray[k + 0] = x;
      theArray[k + 1] = y;
      theArray[k + 2] = z;
      theArray[k + 3] = 1;
    }
  }

  _fillVelocityTexture(texture) {
    const theArray = texture.image.data;

    for (let k = 0, kl = theArray.length; k < kl; k += 4) {
      const x = Math.random() - 0.5;
      const y = Math.random() - 0.5;
      const z = Math.random() - 0.5;

      theArray[k + 0] = x * 10;
      theArray[k + 1] = y * 10;
      theArray[k + 2] = z * 10;
      theArray[k + 3] = 1;
    }
  }

  // last = performance.now();
  last = 0;
  speed = 50;
  render() {
    // const now = performance.now();
    // let delta = (now - this.last) / 1000;
    const now = this.last + this.speed;
    let delta = (now - this.last) / 1000;

    if (delta > 1) delta = 1; // safety cap on large deltas
    this.last = now;

    this.predatorCurveT += 0.001;
    const pos = this.predatorCurve.getPoint(this.predatorCurveT);
    this.predator.copy(pos);
    // this.predatorMesh.position.copy(pos);

    this.positionUniforms["time"].value = now;
    this.positionUniforms["delta"].value = delta;
    this.velocityUniforms["time"].value = now;
    this.velocityUniforms["delta"].value = delta;
    this.velocityUniforms["predator"] = { value: this.predator }; // 捕食者

    this.gpuCompute.compute();

    if (this.materialShader) this.materialShader.uniforms["texturePosition"] = { value: this.gpuCompute.getCurrentRenderTarget(this.positionVariable).texture };
    if (this.materialShader) this.materialShader.uniforms["textureVelocity"] = { value: this.gpuCompute.getCurrentRenderTarget(this.velocityVariable).texture };
  }
}
