import * as THREE from "three";

export class Line2DGeometry extends THREE.BufferGeometry {
  constructor(opt) {
    super();
    const attrPosition = new THREE.BufferAttribute(new Float32Array([-1000, 0, 0, 0, 1000, 0, 1000, 0, 0]), 3);
    this.setAttribute("position", attrPosition);
  }
}

export class Line2DMaterial extends THREE.Material {
  constructor({ color = 0xffffff, opacity = 1, usePickColor = false, map = null, ...params }) {
    super();
    this.defines = {
      USE_PICK_COLOR: !!usePickColor,
      USE_MAP: !!map,
    };
    this.uniforms = {
      diffuse: {
        value: new THREE.Color(color),
      },
      opacity: {
        value: opacity,
      },
      map: {
        value: map,
      },
      uvTransform: {
        value: new THREE.Matrix3(),
      },
    };
    this.vertexShader = `
      #include <common>
      #include <logdepthbuf_pars_vertex>

      
      attribute float[3] arr;
      attribute vec3 color;
      attribute vec3 pickColor;
      attribute float side;
      attribute vec2 startPosition;
      attribute vec2 endPosition;
      // attribute vec2 uv;
      
      varying float lineLength;
      varying vec3 vColor;
      varying vec3 vPickColor;
      varying vec2 vUv;

      uniform float lineWidth;
      uniform float lineOffset;
      uniform mat3 uvTransform;


      void main() {
        vColor = vec3(arr[0],arr[1],arr[2]);
        vPickColor = pickColor;

        vec3 transformed = position;

        float offset = lineWidth / 2.0  * side + lineOffset;

        float lenA = length(position.xy - startPosition);
        float lenB = length(position.xy - endPosition);

        #ifdef USE_MAP
          vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
          // if(vUv.y <= 0.5){
          //   vUv.y = mod(vUv.y * lenB, lineWidth) / lineWidth;
          // }else {
          //   vUv.y = mod(vUv.y * lenA, lineWidth) / lineWidth;
          // }
        #endif

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
            float angle = acos(dot(dirB, normal));
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

      uniform vec3 diffuse;
      uniform float opacity;
      uniform sampler2D map;
      
      varying float lineLength;
      varying vec3 vColor;
      varying vec3 vPickColor;
      varying vec2 vUv;


      void main() {
        vec4 diffuseColor = vec4( diffuse, opacity );
        
        #include <logdepthbuf_fragment>

        diffuseColor.rgb *= vColor;
        
        #ifdef USE_MAP
          vec4 sampledDiffuseColor = texture2D(map, vUv);
          sampledDiffuseColor.rgb *= sampledDiffuseColor.a;
          diffuseColor.rgb += sampledDiffuseColor.rgb;
        #endif

        #ifdef USE_PICK_COLOR
          diffuseColor = vec4( vPickColor, 1.0);
        #endif

        gl_FragColor = diffuseColor;
      }
    `;
    this.setValues(params);
  }

  textureOffset(func) {
    try {
      const [x1, y1] = this.uniforms.map.value.offset.toArray();
      const [x2, y2] = func(x1, y1);
      this.uniforms.map.value.offset.set(x2, y2);
      this.uniforms.map.value.updateMatrix();
      this.uniforms.uvTransform.value.copy(this.uniforms.map.value.matrix);
    } catch (error) {}
  }
}
