import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";

import { TIFFLoader } from "three/examples/jsm/loaders/TIFFLoader.js";
//24.04°, 114.1619°
import * as GeoTIFF from "geotiff";
import { WGS84ToMercator } from "@/mymap/utils/LngLatUtils";

const loader = new TIFFLoader();

export class TTFLayer extends Layer {
  center = [0, 0];
  constructor(opt) {
    super(opt);

    // loader.load(process.env.VUE_APP_BASE_API + "/新丰县dem.tif", (texture) => {
    // loader.load(process.env.VUE_APP_BASE_API + "/crate_lzw.tif", (texture) => {
    //   console.log(texture);
    //   texture.colorSpace = THREE.SRGBColorSpace;
    //   const { width, height, data } = texture.image;
    //   texture.colorSpace = THREE.SRGBColorSpace;
    //   const material2 = new THREE.ShaderMaterial({
    //     transparent: true,
    //     uniforms: {
    //       terrainTexture: { value: texture },
    //       bumpTexture: { value: texture },
    //       bumpScale: { value: 100.0 },
    //     },
    //     vertexShader: `
    //       #include <common>
    //       #include <logdepthbuf_pars_vertex>
    //       uniform sampler2D bumpTexture;
    //       uniform float bumpScale;

    //       varying float vAmount;
    //       varying vec2 vUV;

    //       void main()
    //       {
    //           vUV = uv;

    //           vec4 bumpData = texture2D(bumpTexture, uv);

    //           vAmount = (bumpData.r + bumpData.g + bumpData.b) / 3.0 ;

    //           vec3 newPosition = position + normal * bumpScale * vAmount;

    //           gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    //           #include <logdepthbuf_vertex>
    //       }
    //     `,
    //     fragmentShader: `
    //       #include <common>
    //       #include <logdepthbuf_pars_fragment>
    //       uniform sampler2D terrainTexture;
    //       varying vec2 vUV;
    //       varying float vAmount;

    //       void main()
    //       {
    //           #include <logdepthbuf_fragment>
    //           gl_FragColor = texture2D(terrainTexture, vUV);
    //           // gl_FragColor = vec4(1.0);
    //       }

    //     `,
    //     // vertexShader: `
    //     //   void main() {
    //     //     gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    //     //   }
    //     // `,
    //     // fragmentShader: `
    //     //   void main(){
    //     //     gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    //     //   }
    //     // `,
    //   });
    //   const material = new THREE.MeshBasicMaterial({
    //     map: texture,
    //     // color: 0xffffff,
    //     // transparent: true,
    //   });
    //   this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height, 1000, 1000), material2);
    //   this.scene.add(this.mesh);
    // });
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      const [x, y] = this.map.WebMercatorToCanvasXY(this.center[0], this.center[1]);
      for (const mesh of this.scene.children) {
        mesh.position.set(x, y, 0);
      }
      for (const mesh of this.pickLayerScene.children) {
        mesh.position.set(x, y, 0);
      }
      for (const mesh of this.pickMeshScene.children) {
        mesh.position.set(x, y, 0);
      }
    }
  }

  async getTif() {
    const tif = await GeoTIFF.fromUrl(process.env.VUE_APP_BASE_API + "/新丰县dem.tif");
    console.log(tif);

    const tifImage = await tif.getImage();
    console.log(tifImage.getOrigin(), tifImage.getBoundingBox());
    const image = {
      width: tifImage.getWidth(),
      height: tifImage.getHeight(),
    };
    const data = await tifImage.readRasters({
      interleave: true,
    });
    const geometry = new THREE.PlaneGeometry(image.width, image.height, image.width - 1, image.height - 1);

    const posAttr = geometry.attributes.position;
    //遍历顺序：从左至右，从上至下
    for (let i = 0; i < posAttr.count; i++) {
      posAttr.array[3 * i + 2] = data[i];
    }

    geometry.computeVertexNormals();

    const material = new THREE.MeshLambertMaterial({
      color: "#999",
      transparent: true,
      opacity: 0.8,
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);
    new THREE.TextureLoader().load(process.env.VUE_APP_BASE_API + "微信图片_20250418163804.png", (texture) => {
      material.setValues({ map: texture });
      material.needsUpdate = true;
    });

    const bb = tifImage.getBoundingBox();
    const [x1, y1] = WGS84ToMercator(bb[0], bb[1]);
    const [x2, y2] = WGS84ToMercator(bb[2], bb[3]);
    this.center = [(x1 + x2) / 2, (y1 + y2) / 2];

    const scale = Math.abs(x1 - x2) / image.width
    this.mesh.scale.set(scale, scale, 1);

    const [x, y] = this.map.WebMercatorToCanvasXY(this.center[0], this.center[1]);
    this.mesh.position.set(x, y, 0);
    this.map.setCenter(this.center);
  }

  onAdd(map) {
    super.onAdd(map);
    this.getTif();
  }
}
