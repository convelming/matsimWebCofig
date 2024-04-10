import {
  BufferGeometry,
  Float32BufferAttribute,
  Shape,
  ShapeUtils,
  Vector2,
} from "three";

class BuildGeometry extends BufferGeometry {
  constructor(
    shape = new Shape([
      new Vector2(0, 0.5),
      new Vector2(-0.5, -0.5),
      new Vector2(0.5, -0.5),
    ]),
    { curveSegments = 12, height = 10 }
  ) {
    super();

    this.type = "BuildGeometry";

    // this.parameters = {
    //   shape: shape,
    //   curveSegments: curveSegments,
    //   height: height,
    // };

    const indices = [];
    const vertices = [];
    const normals = [];
    const uvs = [];

    const points = shape.extractPoints(curveSegments);

    // 把所有路径变成顺时针
    if (ShapeUtils.isClockWise(points.shape) === false) {
      points.shape = points.shape.reverse();
    }
    for (let i = 0, l = points.holes.length; i < l; i++) {
      const shapeHole = points.holes[i];
      if (ShapeUtils.isClockWise(shapeHole) === true) {
        points.holes[i] = shapeHole.reverse();
      }
    }

    // 根据路径和空洞生成面
    const faces = ShapeUtils.triangulateShape(points.shape, points.holes);

    const shapeVertices = [].concat(points.shape);
    for (let i = 0, l = points.holes.length; i < l; i++) {
      const shapeHole = points.holes[i];
      for (const vec2 of shapeHole) {
        shapeVertices[shapeVertices.length] = vec2;
      }
    }

    // 添加底面
    {
      for (let i = 0, l = shapeVertices.length; i < l; i++) {
        const vertex = shapeVertices[i];

        vertices.push(vertex.x, vertex.y, 0);
        // normals.push(0, 0, -1);
        uvs.push(vertex.x, vertex.y); // world uvs
      }

      for (let i = 0, l = faces.length; i < l; i++) {
        const face = faces[i];

        const a = face[0];
        const b = face[1];
        const c = face[2];

        indices.push(c, b, a);
      }
    }
    // 添加顶面
    {
      const indicesOffset = vertices.length / 3;
      for (let i = 0, l = shapeVertices.length; i < l; i++) {
        const vertex = shapeVertices[i];

        vertices.push(vertex.x, vertex.y, height);
        // normals.push(0, 0, 1);
        uvs.push(vertex.x, vertex.y); // world uvs
      }

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

        vertices.push(vertex1.x, vertex1.y, 0);
        vertices.push(vertex1.x, vertex1.y, height);
        vertices.push(vertex2.x, vertex2.y, 0);
        vertices.push(vertex2.x, vertex2.y, height);

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

        vertices.push(vertex1.x, vertex1.y, 0);
        vertices.push(vertex1.x, vertex1.y, height);
        vertices.push(vertex2.x, vertex2.y, 0);
        vertices.push(vertex2.x, vertex2.y, height);

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

    this.setIndex(indices);
    this.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    // this.setAttribute("normal", new Float32BufferAttribute(normals, 3));
    this.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
    this.computeVertexNormals();
  }

}

export { BuildGeometry };
