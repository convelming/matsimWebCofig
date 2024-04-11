import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";
import scene from "../scene";
import camera from "../camera";
import renderer from "../renderer";
import * as THREE from "three";

const effectComposer = new EffectComposer(renderer.renderer);
const renderPass = new RenderPass(scene, camera);
effectComposer.addPass(renderPass);
//创建UnrealBloomPass泛光通道
const unrealBloomPass = new UnrealBloomPass(
  //参数一：泛光覆盖场景大小，二维向量类型
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  //参数二：bloomStrength 泛光强度，值越大明亮的区域越亮，较暗区域变亮的范围越广
  2,
  //参数三：bloomRadius 泛光散发半径
  1,
  //参数四：bloomThreshold 泛光的光照强度阈值，如果照在物体上的光照强度大于该值就会产生泛光
  0.05
);

unrealBloomPass.renderToScreen = false;
const composer = new EffectComposer(renderer.renderer);
composer.renderToScreen = false;
composer.addPass(new RenderPass(scene, camera));
composer.addPass(unrealBloomPass);
// var params = {
//   exposure: 0,
//   bloomStrength: 0.2,
//   bloomThreshold: 0,
//   bloomRadius: 0,
//   };
// unrealBloomPass.threshold = params.bloomThreshold;
// unrealBloomPass.strength = params.bloomStrength;
// unrealBloomPass.radius = params.bloomRadius;

// 着色器
let shaderPass = new ShaderPass(
  new THREE.ShaderMaterial({
    uniforms: {
      baseTexture: { value: null },
      bloomTexture: { value: composer.renderTarget2.texture },
      tDiffuse: {
        value: null,
      },
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

shaderPass.renderToScreen = false;
shaderPass.needsSwap = true;
//将创建的通道添加到EffectComposer(效果组合器)对象中
effectComposer.addPass(shaderPass);
const effectColorSpaceConversion = new ShaderPass(GammaCorrectionShader);
effectComposer.addPass(effectColorSpaceConversion);

export default { composer, effectComposer };
