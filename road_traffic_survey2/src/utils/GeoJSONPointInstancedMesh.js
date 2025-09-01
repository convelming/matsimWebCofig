export class GeoJSONPointInstancedMesh extends THREE.InstancedMesh {
  constructor(pointArray, material) {
    const pointNum = Math.floor(pointArray.length / 3);
    const geometry = new THREE.PlaneGeometry(1, 1);
    super(geometry, material, pointNum);
    this.pointArray = pointArray;
    this.propertiesLabels = {};
    this.valueKey = "";
    this._update();
  }

  _update() {
    if (this._t) clearTimeout(this._t);
    this._t = setTimeout(() => {
      this._t_update();
      this._t = null;
    }, 100);
  }

  _t_update() {
    const pointNum = Math.floor(this.pointArray.length / 3);
    const properties = this.propertiesLabels[this.valueKey] || { values: [] };
    for (let i1 = 0, l1 = pointNum; i1 < l1; i1++) {
      const x = this.pointArray[i1 * 3];
      const y = this.pointArray[i1 * 3 + 1];
      const value = properties.values[this.pointArray[i1 * 3 + 2]];
      const pickColor = new THREE.Color(value);
      console.log(x, y, value);

      this.setMatrixAt(i1, new THREE.Matrix4().makeTranslation(x, y, value));
      this.setColorAt(i1, pickColor);
    }
    this.instanceColor.needsUpdate = true;
    this.instanceMatrix.needsUpdate = true;
  }

  setPropertiesLabels(propertiesLabels) {
    this.propertiesLabels = propertiesLabels;
    this._update();
  }
  setValueKey(valueKey) {
    this.valueKey = valueKey;
    this._update();
  }
}

export class GeoJSONPointMaterial2 extends THREE.Material {
  constructor(argu) {
    super();
    this.isGeoJSONLineMaterial = true;
    const { color = 0xff0000, opacity = 1, size = 50, map = null, colorBar = null, usePickColor = false, ...params } = argu || {};
    // this.alphaTest = 0.1;
    // this.transparent = true;
    // this.depthWrite = false;
    this.defines = {
      USE_COLOR_BAR: !!colorBar,
      USE_MAP: !!map,
      USE_PICK_COLOR: usePickColor,
    };
    this.uniforms = {
      diffuse: {
        value: new THREE.Color(color),
      },
      opacity: {
        value: opacity,
      },
      size: {
        value: size,
      },
      map: {
        value: map,
      },
      uvTransform: {
        value: new THREE.Matrix3(),
      },
      colorBar: {
        value: !!colorBar ? colorBar : null,
      },
      minValue: {
        value: !!colorBar ? colorBar.min : 0,
      },
      maxValue: {
        value: !!colorBar ? colorBar.max : 1,
      },
    };
    this.vertexShader = `
      #include <common>
      #include <logdepthbuf_pars_vertex>

      attribute vec3 pickColor;
      
      varying vec3 vColor;
      varying vec3 vPickColor;
      varying vec2 vUv;
      varying float vValue;

      uniform float size;
      uniform mat3 uvTransform;
      uniform float maxValue;
      uniform float minValue;

      void main() {
        vPickColor = pickColor;
        vUv = uv;
        
        vec3 transformed = vec3(position);

        transformed.x = position.x * size / 2.0;
        transformed.y = position.y * size / 2.0;

        vec4 mvPosition = instanceMatrix * vec4( transformed, 1.0 );

        vValue = mvPosition.z;
        float p = (vValue - minValue) / (maxValue - minValue) + 0.1;
        mvPosition.z = p;

        gl_Position = projectionMatrix * modelViewMatrix * mvPosition;

        #include <logdepthbuf_vertex>

      }
    `;
    this.fragmentShader = `
      #include <common>
      #include <logdepthbuf_pars_fragment>


      uniform vec3 diffuse;
      uniform float opacity;
      uniform sampler2D map;
      uniform sampler2D colorBar;
      uniform float maxValue;
      uniform float minValue;
      
      varying vec3 vColor;
      varying vec3 vPickColor;
      varying vec2 vUv;
      varying float vValue;

      void main() {
        vec4 diffuseColor = vec4( diffuse, opacity );
        
        #include <logdepthbuf_fragment>
        
        #ifdef USE_COLOR_BAR
          float p = 0.0;
          if(maxValue != minValue) {
            p = (vValue - minValue) / (maxValue - minValue);
          }
          if(p> 1.0) p = 1.0;
          if(p< 0.0) p = 0.0;
          vec4 barDiffuseColor = texture2D(colorBar, vec2(p , 0.5));
          diffuseColor = barDiffuseColor;
          diffuseColor.a *= opacity;
        #endif

        #ifdef USE_MAP
          vec4 sampledDiffuseColor = texture2D(map, vUv);
          diffuseColor *= sampledDiffuseColor;
        #endif

        #ifdef USE_PICK_COLOR
          diffuseColor = vec4(vPickColor, 1.0);
        #endif

        gl_FragColor = diffuseColor;
      }
    `;
    this.setValues(params);
  }

  setColorBar(colorBar, USE_COLOR_BAR = true) {
    if (colorBar) {
      this.defines.USE_COLOR_BAR = USE_COLOR_BAR && true;
      this.uniforms.colorBar.value = colorBar.texture;
      this.uniforms.minValue.value = colorBar.min;
      this.uniforms.maxValue.value = colorBar.max;
    } else {
      this.defines.USE_COLOR_BAR = USE_COLOR_BAR && false;
      this.uniforms.colorBar.value = null;
      this.uniforms.minValue.value = 0;
      this.uniforms.maxValue.value = 1;
    }
    this.needsUpdate = true;
  }
}
