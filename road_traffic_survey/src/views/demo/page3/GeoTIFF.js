import * as GeoTIFF from "geotiff";
import { Texture } from "three";
import proj4 from "proj4";

GeoTIFF.GeoTIFFImage.prototype.getImageData = async function () {
  while (this.isGetImageData) {
    await new Promise((resolve) => setTimeout(resolve, 1000 * 0.2));
  }
  if (!this.imageData) {
    this.isGetImageData = true;
    try {
      const data = await this.readRasters({
        interleave: true,
      });
      const array = new Uint8Array(data.length * 4);
      for (let i = 0, l = data.length; i < l; i++) {
        const hex = Math.floor(data[i]);
        const r = (hex >> 16) & 255;
        const g = (hex >> 8) & 255;
        const b = hex & 255;
        array[i * 4] = r;
        array[i * 4 + 1] = g;
        array[i * 4 + 2] = b;
        array[i * 4 + 3] = 255;
      }
      this.imageData = new ImageData(new Uint8ClampedArray(array), this.getWidth(), this.getHeight());
    } catch (error) {
      console.log(error);
      this.imageData = new ImageData(new Uint8ClampedArray([]), 0, 0);
    }
    this.isGetImageData = false;
  }
  return this.imageData;
};

GeoTIFF.GeoTIFFImage.prototype.getTexture = function (cw, cy, ltx = 0, lty = 0, rbx = 0, rby = 0) {
  const texture = new Texture();
  this.getImageData().then((imageData) => {
    texture.image = imageData;
    texture.needsUpdate = true;
  });
  return texture;
};

export default GeoTIFF;
