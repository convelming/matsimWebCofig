import { Layer, MAP_EVENT } from "@/mymap";
import * as THREE from "three";

import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader";

const ENTIRE_SCENE = 0,
  BLOOM_SCENE = 1;

export class LinkFlowLayer extends Layer {
  bloomStrength = 500;
  bloomThreshold = 0;
  bloomRadius = 0;
  materials = [];

  darkMaterial = new THREE.LineBasicMaterial({ color: "black" });

  constructor(opt) {
    super(opt);
    import("@/assets/data/linkflow.json").then((res) => {
      this.data = res;
      this.update();
    });
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      for (const mesh of this.scene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...mesh.userData.center);
        mesh.position.set(x, y, mesh.position.z);
      }
    }
    if (type == MAP_EVENT.UPDATE_RENDERER_SIZE) {
      this.bloomComposer.setSize(data.width, data.height);
      this.finalComposer.setSize(data.width, data.height);
    }
  }

  onAdd(map) {
    super.onAdd(map);

    const renderScene = new RenderPass(map.scene, map.camera);

    const bloomLayer = new THREE.Layers();
    bloomLayer.set(BLOOM_SCENE);

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(map.rootDoc.innerWidth, map.rootDoc.innerHeight), this.bloomStrength, this.bloomRadius, this.bloomThreshold);

    const bloomComposer = new EffectComposer(map.renderer);
    bloomComposer.renderToScreen = false;
    bloomComposer.addPass(renderScene);
    bloomComposer.addPass(bloomPass);

    const finalPass = new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: {
          baseTexture: { value: null },
          bloomTexture: { value: bloomComposer.renderTarget2.texture },
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
    finalPass.needsSwap = true;

    const finalComposer = new EffectComposer(map.renderer);
    finalComposer.addPass(renderScene);
    finalComposer.addPass(finalPass);

    this.renderScene = renderScene;
    this.bloomLayer = bloomLayer;
    this.bloomPass = bloomPass;
    this.bloomComposer = bloomComposer;
    this.finalPass = finalPass;
    this.finalComposer = finalComposer;

    this.update();
  }

  render() {
    super.render();
    this.scene.traverse((obj) => {
      if (obj.isMesh && this.bloomLayer.test(obj.layers) === false) {
        this.materials[obj.uuid] = obj.material;
        obj.material = this.darkMaterial;
      }
    });
    this.bloomComposer.render();
    this.scene.traverse((obj) => {
      if (this.materials[obj.uuid]) {
        obj.material = this.materials[obj.uuid];
        delete this.materials[obj.uuid];
      }
    });

    this.finalComposer.render();
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

      const points = coords.map((v) => new THREE.Vector3(v[0], v[1], v[2] / 3600));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const mesh = new THREE.Line(geometry, material);

      const legCenterV3 = cV3.clone().add(linkNormal.clone().multiplyScalar(offset));
      const legCenter = [legCenterV3.x, legCenterV3.y];
      const [x1, y1] = this.map.WebMercatorToCanvasXY(...legCenter);
      const [x, y] = this.map.WebMercatorToCanvasXY(...legCenter);
      mesh.position.set(x, y, 0);
      mesh.userData.center = legCenter;

      // const [x, y] = linkNormal.clone().multiplyScalar(offset);
      // mesh.position.set(x, y, 0);

      mesh.layers.enable(BLOOM_SCENE);

      this.scene.add(mesh);
    }
    console.timeEnd("update");
  }
}
