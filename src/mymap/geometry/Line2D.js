import * as THREE from "three";

export class Line2DGeometry extends THREE.BufferGeometry {
  constructor(opt) {
    super();
    const attrPosition = new THREE.BufferAttribute(new Float32Array([-100, 0, 0, 0, 100, 0, 100, 0, 0]), 3);
    this.setAttribute("position", attrPosition);
  }
}

export class Line2DMaterial extends THREE.ShaderMaterial {
  constructor(params) {
    const { lineWidth, userPickColor, ..._params } = params || {};
    const uniforms = {
      lineWidth: {
        value: lineWidth || 5,
      },
      userPickColor: {
        value: !!userPickColor,
      },
    };
    super({
      // uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.common, THREE.UniformsLib.specularmap, THREE.UniformsLib.envmap, THREE.UniformsLib.aomap, THREE.UniformsLib.lightmap, THREE.UniformsLib.fog, uniforms]),
      uniforms: uniforms,
      vertexShader: `
        void main(){
          gl_Position = projectionMatrix*modelViewMatrix*vec4( position, 1.0 );
        }
      `,
      fragmentShader: `
        void main() {
          gl_FragColor = vec4(1.0);
        }
      `,
      ..._params,
    });
  }
}
