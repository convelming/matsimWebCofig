import * as GeoTIFF from "geotiff";

class MyTiffImage {
  constructor(tifUrl = "") {
    this.noCanvas = new OffscreenCanvas(256, 256);
    this.disCanvas = new OffscreenCanvas(256, 256);
  }

  async loadTiff(tifUrl) {
    try {
      const tif = await GeoTIFF.fromUrl(tifUrl);
      const tifImage = await tif.getImage();
      console.log(tifImage);
      const nodata = tifImage.getGDALNoData() || 0;
      const tifImageData = await tifImage.readRasters({
        interleave: true,
        fillValue: 0,
      });

      const { width, height } = tifImageData;

      const geometry = new THREE.PlaneGeometry(width, height, width - 1, height - 1);
      const position = geometry.attributes.position;
      let dScale = 0;
      for (let i = 0; i < tifImageData.length; i++) {
        if (tifImageData[i] == nodata) {
          tifImageData[i] = 0;
        }
        dScale = Math.max(dScale, Math.abs(tifImageData[i]));
        position.array[3 * i + 2] = tifImageData[i];
      }
      geometry.computeVertexNormals();

      const normal = geometry.attributes.normal;
      const noArray = new Uint8Array(tifImageData.length * 4);
      const array = new Uint8Array(tifImageData.length * 4);

      for (let i = 0; i < tifImageData.length; i++) {
        noArray[i * 4] = Math.floor((normal.getX(i) + 1) * 0.5 * 255);
        noArray[i * 4 + 1] = Math.floor((normal.getY(i) + 1) * 0.5 * 255);
        noArray[i * 4 + 2] = Math.floor((normal.getZ(i) + 1) * 0.5 * 255);
        noArray[i * 4 + 3] = 255;

        const hex = ((tifImageData[i] - dScale) / (dScale * 2)) * 255;
        array[i * 4] = hex;
        array[i * 4 + 1] = hex;
        array[i * 4 + 2] = hex;
        array[i * 4 + 3] = 255;
      }
      const noCanvas = document.createElement("canvas");
      noCanvas.width = width;
      noCanvas.height = height;
      const noCtx = noCanvas.getContext("2d");
      noCtx.putImageData(new ImageData(new Uint8ClampedArray(noArray), width, height), 0, 0);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.putImageData(new ImageData(new Uint8ClampedArray(array), width, height), 0, 0);

      const origin = tifImage.getOrigin();
      const resolution = tifImage.getResolution();
      const [x1, y1] = WGS84ToMercator(origin[0], origin[1]);
      const [x2, y2] = WGS84ToMercator(origin[0] + resolution[0] * width, origin[1] + resolution[1] * height);
      this.bbox = [x1, y1, x2, y2];
      this.image = canvas;
      this.normal = noCanvas;
      this.width = width;
      this.height = height;
      this.dScale = dScale;
      this.inited = true;
    } catch (error) {
      this.inited = false;
    }
  }

  draw(drawData) {
    console.log(drawData);
    
    const { center, geoWidth, geoHeight, canvasWidth, canvasHeight, imageScale } = drawData;

    this.disCanvas.width = canvasWidth;
    this.disCanvas.height = canvasHeight;
    const ctxDis = this.disCanvas.getContext("2d");
    ctxDis.fillStyle = "#7f7f7f";
    ctxDis.fillRect(0, 0, this.disCanvas.width, this.disCanvas.height);

    this.noCanvas.width = canvasWidth;
    this.noCanvas.height = canvasHeight;
    const ctxNo = this.noCanvas.getContext("2d");
    ctxNo.fillStyle = "#7f7fff";
    ctxNo.fillRect(0, 0, this.noCanvas.width, this.noCanvas.height);

    if (this.inited) {
      console.log("updateTiff");
      
      const [cx, cy] = center;
      const rx = geoWidth / 2;
      const ry = geoHeight / 2;
      const sx = cx - rx;
      const sy = cy + ry;
      const ex = cx + rx;
      const ey = cy - ry;

      const { bbox, width, height, image, normal } = this;

      const tsx = bbox[0];
      const tsy = bbox[1];
      const tex = bbox[2];
      const tey = bbox[3];
      const x1 = tsx - sx;
      const y1 = sy - tsy;
      const scale = imageScale;

      ctxDis.drawImage(image, 0, 0, width, height, x1 * scale, y1 * scale, Math.abs(tsx - tex) * scale, Math.abs(tsy - tey) * scale);

      ctxNo.drawImage(normal, 0, 0, width, height, x1 * scale, y1 * scale, Math.abs(tsx - tex) * scale, Math.abs(tsy - tey) * scale);
    }
    return {
      noImage: this.noCanvas.transferToImageBitmap(),
      disImage: this.disCanvas.transferToImageBitmap(),
      dScale: this.dScale || 1,
      ...drawData,
    };
  }
}

let myTiffImage = new MyTiffImage();

onmessage = function (e) {
  switch (e.data.key) {
    case "init": {
      const { tifUrl } = e.data;
      myTiffImage.loadTiff(tifUrl);
      break;
    }
    case "draw": {
      if (!myTiffImage.inited) {
        const data = myTiffImage.draw(e.data.data);
        console.log(data);
        
        postMessage(
          {
            key: e.data.key,
            data: data,
            meg: "success",
          },
          [data.noImage, data.disImage]
        );
      }
      break;
    }
  }
};
