import { Layer, MAP_EVENT } from "@/mymap";
import * as THREE from "three";

import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";

const ENTIRE_SCENE = 0,
  BLOOM_SCENE = 1;

export class BloomLayer extends Layer {
  constructor(opt) {
    super(opt);

    this.blackMeshMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
    });
    this.blackLineMaterial = new THREE.LineBasicMaterial({
      color: 0x000000,
    });
    this.blackPointsMaterial = new THREE.PointsMaterial({
      color: 0x000000,
    });
    this.blackSpriteMaterial = new THREE.SpriteMaterial({
      color: 0x000000,
    });

    const geometry = new THREE.BoxGeometry(200, 200, 200);
    const material = new THREE.MeshBasicMaterial({ color: "#ff0000" });
    this.cube = new THREE.Mesh(geometry, material);
    this.cube.position.set(0, 0, 150);
    this.cube2 = new THREE.Mesh(geometry, material);
    this.cube2.position.set(500, 0, 150);

    this.scene.add(this.cube);
    this.scene.add(this.cube2);
  }

  on(type, data) {
    if (type === MAP_EVENT.UPDATE_RENDERER_SIZE) {
      console.log(data);
      const { width, height } = data;
      this.bloomComposer.setSize(width, height);
    }
  }

  onAdd(map) {
    super.onAdd(map);

    const { renderScene, camera, rootDoc, renderer, composer, scene } = map;

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(rootDoc.clientWidth, rootDoc.clientHeight), 1, 0, 0);
    this.bloomComposer = new EffectComposer(renderer);
    this.bloomComposer.renderToScreen = false;
    this.bloomComposer.addPass(renderScene);
    this.bloomComposer.addPass(bloomPass);

    const finalPass = new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: {
          baseTexture: { value: null },
          bloomTexture: { value: this.bloomComposer.renderTarget2.texture },
        },
        vertexShader: `
          #include <common>
          #include <logdepthbuf_pars_vertex>
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            
            #include <logdepthbuf_vertex>
          }
        `,
        fragmentShader: `
          #include <common>
          #include <logdepthbuf_pars_fragment>
          uniform sampler2D baseTexture;
          uniform sampler2D bloomTexture;
          varying vec2 vUv;
          void main() {
            gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );
            #include <logdepthbuf_fragment>
          }
        `,
        defines: {},
      }),
      "baseTexture"
    );
    finalPass.needsSwap = true;

    composer.addPass(finalPass);
  }

  beforeRender() {
    scene.traverse(darkenNonBloomed);
    this.bloomComposer.render();
    scene.traverse(restoreMaterial);
  }

  darkenNonBloomed(obj) {
    if (obj.isMesh && bloomLayer.test(obj.layers) === false) {
      materials[obj.uuid] = obj.material;
      obj.material = darkMaterial;
    }
  }

  restoreMaterial(obj) {
    if (materials[obj.uuid]) {
      obj.material = materials[obj.uuid];
      delete materials[obj.uuid];
    }
  }
  afterRender() {}
}
