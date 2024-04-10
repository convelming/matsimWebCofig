import { Layer, MAP_EVENT } from "@/mymap";
import * as THREE from "three";
import { data } from "@/assets/data/linkflow.json";

import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader";

export class LinkFlowLayer extends Layer {
  constructor(opt) {
    super(opt);
    this.data = data;
    this.update();
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      for (const mesh of this.scene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...mesh.userData.center);
        mesh.position.set(x, y, mesh.position.z);
      }
    }
  }

  onAdd(map) {
    super.onAdd(map);
    this.update();
  }

  update() {
    this.clearScene();
    if (!this.map) return;
    if (!this.data) return;
    console.time("update");

    const { link, legs } = this.data;
    console.log(this.data);

    // const geoList = new Array(legs.length).fill(null);
    const { center, fromCoord, toCoord } = link;
    const fV3 = new THREE.Vector3(fromCoord.x, fromCoord.y, 0);
    const tV3 = new THREE.Vector3(toCoord.x, toCoord.y, 0);
    const cV3 = new THREE.Vector3(center.x, center.y, 0);
    const linkDirection = fV3.clone().sub(tV3).normalize();
    // link的法向量
    const linkNormal = new THREE.Vector3(linkDirection.y, linkDirection.x, 0);
    const material = new THREE.LineBasicMaterial({
      color: 0x0000ff,
    });

    for (let i = 0; i < legs.length; i++) {
      const { offset, coords } = legs[i];
      const points = coords.map((v) => new THREE.Vector3(v[0], v[1] + cV3.x - cV3.y, v[2] / 360));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const mesh = new THREE.Line(geometry, material);

      const legCenter = cV3.clone().add(linkNormal.clone().multiplyScalar(offset)).toArray();
      console.log(legCenter);
      // const [x, y] = this.map.WebMercatorToCanvasXY(...legCenter);
      // mesh.position.set(x, y, 0);
      // mesh.userData.center = legCenter;

      const [x, y] = linkNormal.clone().multiplyScalar(offset);
      mesh.position.set(x, y, 0);

      this.scene.add(mesh);
    }
    console.timeEnd("update");
  }
}

const ENTIRE_SCENE = 0,
  BLOOM_SCENE = 1;

export class LightGlow extends Layer {
  constructor(opt) {
    super(opt);
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_RENDERER_SIZE) {
      this.setSize(data.width, data.height);
    }
  }

  onAdd(map) {
    super.onAdd(map);
    this.renderScene = new RenderPass(map.scene, map.camera);

    this.bloomLayer = new THREE.Layers();
    this.bloomLayer.set(BLOOM_SCENE);

    this.bloomPass = new UnrealBloomPass(new THREE.Vector2(map.rootDoc.clientWidth, map.rootDoc.clientHeight), 1.5, 0.4, 0.85);

    this.bloomComposer = new EffectComposer(map.renderer);
    this.bloomComposer.renderToScreen = false;
    this.bloomComposer.addPass(this.renderScene);
    this.bloomComposer.addPass(this.bloomPass);

    this.finalPass = new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: {
          baseTexture: { value: null },
          bloomTexture: { value: this.bloomComposer.renderTarget2.texture },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
          }
        `,
        fragmentShader: `
          uniform sampler2D baseTexture;
          uniform sampler2D bloomTexture;
          varying vec2 vUv;
          void main() {
            gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );
          }
        `,
        defines: {},
      }),
      "baseTexture"
    );
    this.finalPass.needsSwap = true;

    this.finalComposer = new EffectComposer(map.renderer);
    this.finalComposer.addPass(this.renderScene);
    this.finalComposer.addPass(this.finalPass);
  }

  setSize(width, height) {
    this.bloomComposer.setSize(width, height);
    this.finalComposer.setSize(width, height);
  }

  render() {
    this.map.scene.traverse((obj) => {
      if (obj.isMesh && this.bloomLayer.test(obj.layers) === false) {
        materials[obj.uuid] = obj.material;
        obj.material = darkMaterial;
      }
    });
    this.bloomComposer.render();
    this.map.scene.traverse((obj) => {
      if (materials[obj.uuid]) {
        obj.material = materials[obj.uuid];
        delete materials[obj.uuid];
      }
    });
    this.finalComposer.render();
  }
}
