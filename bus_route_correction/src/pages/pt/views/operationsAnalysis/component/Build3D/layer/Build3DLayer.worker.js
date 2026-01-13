import * as THREE from "three";
import { getTileFacilities } from "@/api/index";

onmessage = async function (e) {
  try {
    const { row, col } = e.data;
    const res = await getTileFacilities({ x: row, y: col });
    // buffers
    const indices = [];
    const vertices = [];
    const pickColors = [];
    const uvs = [];
    // helper functions
    function addShape(data) {
      let shape = null;
      for (const coords of data.coordinates) {
        if (!shape) {
          shape = new THREE.Shape(coords.map((v) => new THREE.Vector2(v[0], v[1])));
        } else {
          const holePath = new THREE.Path(points.map((v) => new THREE.Vector2(v[0], v[1])));
          shape.holes.push(holePath);
        }
      }
      if (!shape) return;

      const pickColor = new THREE.Color(0);

      const hbgd = 0;
      const jzgd = data.height;

      const ldgd = jzgd + hbgd;

      const points = shape.extractPoints(12);

      let shapeVertices = points.shape;
      const shapeHoles = points.holes;

      // 把所有路径变成顺时针
      if (THREE.ShapeUtils.isClockWise(shapeVertices) === false) {
        shapeVertices = shapeVertices.reverse();
      }

      for (let i = 0, l = shapeHoles.length; i < l; i++) {
        const shapeHole = shapeHoles[i];
        if (THREE.ShapeUtils.isClockWise(shapeHole) === true) {
          shapeHoles[i] = shapeHole.reverse();
        }
      }
      // 根据路径和空洞生成面
      const faces = THREE.ShapeUtils.triangulateShape(shapeVertices, shapeHoles);
      for (let i = 0, l = shapeHoles.length; i < l; i++) {
        const shapeHole = shapeHoles[i];
        shapeVertices = shapeVertices.concat(shapeHole);
      }

      // 添加底面
      {
        const indicesOffset = vertices.length / 3;
        // 添加点，法向量，uv，保存点对应的valueKey
        for (let i = 0, l = shapeVertices.length; i < l; i++) {
          const vertex = shapeVertices[i];
          vertices.push(vertex.x, vertex.y, hbgd);
          pickColors.push(pickColor.r, pickColor.g, pickColor.b);
          // normals.push(0, 0, 1);
          uvs.push(vertex.x, vertex.y); // world uvs
        }
        // 添加面
        for (let i = 0, l = faces.length; i < l; i++) {
          const face = faces[i];
          const a = face[0] + indicesOffset;
          const b = face[1] + indicesOffset;
          const c = face[2] + indicesOffset;
          indices.push(c, b, a);
        }
      }

      // 添加顶面
      {
        const indicesOffset = vertices.length / 3;
        // 添加点，法向量，uv，保存点对应的valueKey
        for (let i = 0, l = shapeVertices.length; i < l; i++) {
          const vertex = shapeVertices[i];
          vertices.push(vertex.x, vertex.y, ldgd);
          pickColors.push(pickColor.r, pickColor.g, pickColor.b);
          uvs.push(vertex.x, vertex.y); // world uvs
        }
        // 添加面
        for (let i = 0, l = faces.length; i < l; i++) {
          const face = faces[i];
          const a = face[0] + indicesOffset;
          const b = face[1] + indicesOffset;
          const c = face[2] + indicesOffset;
          indices.push(a, b, c);
        }
      }

      // 添加外墙壁
      {
        const indicesOffset = vertices.length / 3;
        const shapeList = [...points.shape, points.shape[0]];
        for (let i = 0, l = shapeList.length - 1; i < l; i++) {
          const vertex1 = shapeList[i];
          const vertex2 = shapeList[i + 1];

          vertices.push(vertex1.x, vertex1.y, hbgd);
          vertices.push(vertex1.x, vertex1.y, ldgd);
          vertices.push(vertex2.x, vertex2.y, hbgd);
          vertices.push(vertex2.x, vertex2.y, ldgd);

          pickColors.push(pickColor.r, pickColor.g, pickColor.b);
          pickColors.push(pickColor.r, pickColor.g, pickColor.b);
          pickColors.push(pickColor.r, pickColor.g, pickColor.b);
          pickColors.push(pickColor.r, pickColor.g, pickColor.b);

          // normals.push(0, 0, -1);
          // normals.push(0, 0, -1);
          // normals.push(0, 0, -1);
          // normals.push(0, 0, -1);
          uvs.push(vertex1.x, vertex1.y); // world uvs
          uvs.push(vertex1.x, vertex1.y); // world uvs
          uvs.push(vertex2.x, vertex2.y); // world uvs
          uvs.push(vertex2.x, vertex2.y); // world uvs

          const a = i * 4 + indicesOffset;
          const b = i * 4 + 1 + indicesOffset;
          const c = i * 4 + 2 + indicesOffset;
          const d = i * 4 + 3 + indicesOffset;

          indices.push(a, b, c);
          indices.push(c, b, d);
        }
      }

      // 添加孔洞墙壁
      for (const holes of points.holes) {
        const indicesOffset = vertices.length / 3;
        const holeList = [...holes, holes[0]];
        for (let i = 0, l = holeList.length - 1; i < l; i++) {
          const vertex1 = holeList[i];
          const vertex2 = holeList[i + 1];

          vertices.push(vertex1.x, vertex1.y, hbgd);
          vertices.push(vertex1.x, vertex1.y, ldgd);
          vertices.push(vertex2.x, vertex2.y, hbgd);
          vertices.push(vertex2.x, vertex2.y, ldgd);

          pickColors.push(pickColor.r, pickColor.g, pickColor.b);
          pickColors.push(pickColor.r, pickColor.g, pickColor.b);
          pickColors.push(pickColor.r, pickColor.g, pickColor.b);
          pickColors.push(pickColor.r, pickColor.g, pickColor.b);

          // normals.push(0, 0, -1);
          // normals.push(0, 0, -1);
          // normals.push(0, 0, -1);
          // normals.push(0, 0, -1);
          uvs.push(vertex1.x, vertex1.y); // world uvs
          uvs.push(vertex1.x, vertex1.y); // world uvs
          uvs.push(vertex2.x, vertex2.y); // world uvs
          uvs.push(vertex2.x, vertex2.y); // world uvs

          const a = i * 4 + indicesOffset;
          const b = i * 4 + 1 + indicesOffset;
          const c = i * 4 + 2 + indicesOffset;
          const d = i * 4 + 3 + indicesOffset;

          indices.push(a, b, c);
          indices.push(c, b, d);
        }
      }
    }
    if (res.data && res.data.length > 0) {
      for (let i = 0, l = res.data.length; i < l; i++) {
        addShape(res.data[i]);
      }
    }

    const postData = {
      key: "success",
      row: row,
      col: col,
      x: ((row + 0.5) * (EARTH_RADIUS * 2)) / Math.pow(2, BUILD_ZOOM) - EARTH_RADIUS,
      y: EARTH_RADIUS - ((col + 0.5) * (EARTH_RADIUS * 2)) / Math.pow(2, BUILD_ZOOM),
      indices: new Int16Array(indices),
      vertices: new Float32Array(vertices),
      pickColors: new Float32Array(pickColors),
      uvs: new Float32Array(uvs),
    };
    this.postMessage(
      postData,
      Object.values(postData)
        .filter((v) => !!v.buffer)
        .map((v) => v.buffer)
    );
  } catch (error) {
    this.postMessage({
      key: "error",
      error: error.message,
    });
  }
};
