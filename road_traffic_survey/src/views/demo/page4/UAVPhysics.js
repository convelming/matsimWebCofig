import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as CANNON from "cannon-es";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import { Flow } from "three/addons/modifiers/CurveModifier.js";

export default function (threeBox) {
  // 创建渲染器
  const renderer = new THREE.WebGLRenderer({
    // 设置抗锯齿
    antialias: true,
    // 设置对数深度缓冲区
    // logarithmicDepthBuffer: true,
    // precision: "highp"
    // preserveDrawingBuffer: true,
    alpha: true,
  });
  renderer.setClearAlpha(0);
  // renderer.sortObjects = false;
  renderer.domElement.style.userSelect = "none";
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.localClippingEnabled = true;
  threeBox.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa0a0a0);
  scene.fog = new THREE.Fog(0xa0a0a0, 450, 500);

  // 创建相机
  const camera = new THREE.PerspectiveCamera(60, 1, 0.01, 1000);
  // 设置相机位置
  camera.position.y = 50;
  camera.position.z = 200;
  camera.lookAt(0, 50, 0);

  // 设置相机控件轨道控制器OrbitControls
  const cameraControls = new OrbitControls(camera, renderer.domElement);
  scene.add(camera);

  // 添加环境光线
  const light = new THREE.AmbientLight(0xffffff, 1);
  scene.add(light);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // 创建方向光
  directionalLight.position.set(1, 1, 0); // 设置方向光源位置
  scene.add(directionalLight);

  function getUAVMesh() {
    return new Promise((resolve, reject) =>
      new GLTFLoader().load(
        process.env.VUE_APP_BASE_API + "/models/无人机.glb",
        (gltf) => {
          let lxjs = [];
          const material = new THREE.MeshPhongMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 1,
            shininess: 90,
            side: THREE.DoubleSide,
          });
          gltf.scene.rotation.x = -Math.PI / 2;
          gltf.scene.rotation.z = -Math.PI / 2;
          gltf.scene.scale.set(0.1, 0.1, 0.1);
          gltf.scene.traverse((child) => {
            if (child.isMesh) {
              child.material = material;
            }
            if (child.isMesh && String(child.name || "").includes("螺旋桨")) {
              lxjs.push(child);
            }
          });

          setInterval(() => {
            for (const mesh of lxjs) {
              mesh.rotation.z += (Math.PI * 2) / 60;
              if (mesh.rotation.z >= 2 * Math.PI) mesh.rotation.z = 0;
            }
          }, 1000 / 60);

          const box = new THREE.Box3().expandByObject(gltf.scene);
          const scale = new THREE.Vector3();
          box.getSize(scale);
          const physics = new CANNON.Body({
            mass: 3, //碰撞体质量
            shape: new CANNON.Box(new CANNON.Vec3(scale.x / 2, scale.y / 2, scale.z / 2)),
            material: new CANNON.Material({
              restitution: 0.7,
              friction: 0.7,
            }),
          });
          resolve({
            mesh: gltf.scene,
            physics: physics,
            lxjs: lxjs,
            material: material,
          });
        },
        null,
        (err) => {
          console.log(err);
        }
      )
    );
  }

  function getWorld() {
    const world = new THREE.Group();
    // 创建物理世界
    const physics_scene = new CANNON.World();
    // 设置物理世界重力加速度
    physics_scene.gravity.set(0, -9.8, 0);

    // 物理地面
    const groundMaterial = new CANNON.Material({
      restitution: 0.2,
      friction: 0.7,
    });
    const groundBody = new CANNON.Body({
      mass: 0, // 质量为0，始终保持静止，不会受到力碰撞或加速度影响
      shape: new CANNON.Plane(),
      material: groundMaterial,
    });
    // 改变平面默认的方向，法线默认沿着z轴，旋转到平面向上朝着y方向
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); //旋转规律类似threejs 平面
    physics_scene.addBody(groundBody);

    // 网格地面
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const repeat = 160;
    const floorT = new THREE.TextureLoader().load(require("./FloorsCheckerboard_S_Diffuse.jpg"));
    floorT.colorSpace = THREE.SRGBColorSpace;
    floorT.repeat.set(repeat, repeat);
    floorT.wrapS = floorT.wrapT = THREE.RepeatWrapping;
    floorT.anisotropy = maxAnisotropy;

    const floorN = new THREE.TextureLoader().load(require("./FloorsCheckerboard_S_Normal.jpg"));
    floorN.repeat.set(repeat, repeat);
    floorN.wrapS = floorN.wrapT = THREE.RepeatWrapping;
    floorN.anisotropy = maxAnisotropy;

    const floorMat = new THREE.MeshStandardMaterial({
      map: floorT,
      normalMap: floorN,
      normalScale: new THREE.Vector2(0.5, 0.5),
      color: 0x404040,
      roughness: 0.85,
      shadowSide: THREE.DoubleSide,
    });
    const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000, 2000, 2000), floorMat);

    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    world.add(floorMesh);
    return { world, physics_scene };
  }

  // 创建一个高200长宽10的建筑物
  // const jzq_mesh = new THREE.Mesh(new THREE.BoxGeometry(13, 100, 13), new THREE.MeshBasicMaterial({ color: "#ccc" }));
  // const jzq_mesh_physics = new CANNON.Body({
  //   mass: 0, //碰撞体质量
  //   shape: new CANNON.Box(new CANNON.Vec3(6.5, 50, 6.5)),
  //   material: new CANNON.Material({
  //     restitution: 0.7,
  //   }),
  // });

  let setSizeTimeout;
  function resize() {
    // 节流
    if (setSizeTimeout) return;
    setSizeTimeout = setTimeout(() => {
      const width = threeBox.clientWidth;
      const height = threeBox.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      setSizeTimeout = null;
    }, 1000 / 120);
  }
  new ResizeObserver(resize).observe(threeBox);

  let animationCallBack = null;
  const animation = (time) => {
    if (animationCallBack) animationCallBack();
    renderer.render(scene, camera);
    window.requestAnimationFrame(animation);
  };
  animation();

  async function play1() {
    // 创建基础场景
    const { world, physics_scene } = getWorld();

    // 创建无人机
    const { mesh: uav_mesh, physics: uav_mesh_physics } = await getUAVMesh();
    world.add(uav_mesh);
    physics_scene.addBody(uav_mesh_physics);

    // 创建建筑物
    const jz_mesh = new THREE.Mesh(new THREE.BoxGeometry(10, 100, 10), new THREE.MeshBasicMaterial({ color: "#ccc" }));
    const jz_mesh_physics = new CANNON.Body({
      mass: 0, //碰撞体质量
      shape: new CANNON.Box(new CANNON.Vec3(5, 50, 5)),
      material: new CANNON.Material({
        restitution: 0.2,
      }),
    });
    world.add(jz_mesh);
    physics_scene.addBody(jz_mesh_physics);

    // 虚线
    const point1 = [
      [-50, 50, 0],
      [50, 50, 0],
    ].map((item) => new THREE.Vector3(...item));
    const curve1 = new THREE.CatmullRomCurve3(point1);
    const line1 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve1.getPoints(50)), new THREE.LineDashedMaterial({ color: "#fff", scale: 1, dashSize: 3, gapSize: 1 }));
    line1.position.set(0, 0, 0.2);
    line1.computeLineDistances();
    world.add(line1);

    let flag = false;
    function handleCollide(e) {
      flag = true;
    }
    uav_mesh_physics.addEventListener("collide", handleCollide);

    return {
      reset: () => {
        camera.position.set(0, 50, 200);
        camera.lookAt(0, 50, 0);

        flag = false;
        uav_mesh_physics.position.set(-50, 50, 0);
        uav_mesh.position.copy(uav_mesh_physics.position);
        jz_mesh_physics.position.set(50, 50, 0);
        jz_mesh.position.copy(jz_mesh_physics.position);
        scene.add(world);
      },
      close: () => {
        scene.remove(world);
        animationCallBack = null;
      },
      play: () => {
        uav_mesh_physics.velocity.set(40, 0, 0);
        animationCallBack = () => {
          physics_scene.step(1 / 60);
          jz_mesh.position.copy(jz_mesh_physics.position);
          uav_mesh.position.copy(uav_mesh_physics.position);
          if (!flag) uav_mesh_physics.applyForce(new CANNON.Vec3(0, uav_mesh_physics.mass * 9.8, 0));
        };
      },
    };
  }

  async function play2() {
    // 创建基础场景
    const { world, physics_scene } = getWorld();

    // 创建无人机
    const { mesh: uav_mesh, physics: uav_mesh_physics } = await getUAVMesh();
    world.add(uav_mesh);

    // 创建建筑物
    const jz_mesh = new THREE.Mesh(new THREE.BoxGeometry(10, 100, 10), new THREE.MeshBasicMaterial({ color: "#ccc" }));
    jz_mesh.position.set(0, 50, 0);
    world.add(jz_mesh);
    const jzq_mesh = new THREE.Mesh(new THREE.BoxGeometry(15, 102, 15), new THREE.MeshBasicMaterial({ color: "#cc0", transparent: true, opacity: 0.5 }));
    jzq_mesh.position.set(0, 51, 0);
    world.add(jzq_mesh);

    // 虚线
    const point1 = [
      [-50, 50, 0],
      [50, 50, 0],
    ].map((item) => new THREE.Vector3(...item));
    const curve1 = new THREE.CatmullRomCurve3(point1);
    const line1 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve1.getPoints(50)), new THREE.LineDashedMaterial({ color: "#fff", scale: 1, dashSize: 3, gapSize: 1 }));
    line1.position.set(0, 0, 0.2);
    line1.computeLineDistances();
    world.add(line1);

    // 实线
    const point2 = [
      [-50, 50, 0],
      [-15, 50, 0],
      [-10, 50, 0],
      [-10, 50, 3],
      [-10, 50, 6],
      [-10, 50, 10],
      [10, 50, 10],
      [10, 50, 6],
      [10, 50, 3],
      [10, 50, 0],
      [15, 50, 0],
      [50, 50, 0],
    ].map((item) => new THREE.Vector3(...item));
    const curve2 = new THREE.CatmullRomCurve3(point2);
    const line2 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve2.getPoints(50)), new THREE.LineBasicMaterial({ color: "#f00" }));

    world.add(line2);

    let time = 0;
    const totalTime = 10;

    const callback = () => {
      time += 1 / 60;
      if (time <= totalTime) {
        const pos1 = curve2.getPointAt(time / totalTime);
        // const pos2 = curve1.getPointAt((time + 1 / 60) / totalTime);
        // 计算方向
        uav_mesh.position.copy(pos1);
        // const direction = pos1.clone().sub(pos2).normalize();
      }
    };

    return {
      reset: () => {
        camera.position.set(0, 100, 50);
        camera.lookAt(0, 50, 0);

        time = 0;
        callback();
        scene.add(world);
      },
      close: () => {
        scene.remove(world);
        animationCallBack = null;
      },
      play: () => {
        animationCallBack = callback;
      },
    };
  }

  async function play3() {
    // 创建基础场景
    const { world, physics_scene } = getWorld();

    // 创建无人机
    const { mesh: uav_mesh1, physics: uav_mesh1_physics, material: material1 } = await getUAVMesh();
    world.add(uav_mesh1);
    physics_scene.addBody(uav_mesh1_physics);

    // 创建无人机
    const { mesh: uav_mesh2, physics: uav_mesh2_physics, material: material2 } = await getUAVMesh();
    material2.setValues({ color: new THREE.Color(0xffffff) });
    world.add(uav_mesh2);
    physics_scene.addBody(uav_mesh2_physics);

    // 虚线
    const point1 = [
      [-50, 50, 0],
      [50, 50, 0],
    ].map((item) => new THREE.Vector3(...item));
    const curve1 = new THREE.CatmullRomCurve3(point1);
    const line1 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve1.getPoints(50)), new THREE.LineDashedMaterial({ color: "#fff", scale: 1, dashSize: 3, gapSize: 1 }));
    line1.position.set(0, 0, 0.2);
    line1.computeLineDistances();
    world.add(line1);

    let flag = false;
    function handleCollide(e) {
      flag = true;
    }
    uav_mesh1_physics.addEventListener("collide", handleCollide);

    return {
      reset: () => {
        camera.position.set(0, 100, 50);
        camera.lookAt(0, 50, 0);

        flag = false;
        uav_mesh1_physics.position.set(-50, 50, 0);
        uav_mesh1.position.copy(uav_mesh1_physics.position);
        uav_mesh2_physics.position.set(50, 50, 0);
        uav_mesh2.position.copy(uav_mesh2_physics.position);
        scene.add(world);
      },
      close: () => {
        scene.remove(world);
        animationCallBack = null;
      },
      play: () => {
        uav_mesh1_physics.velocity.set(40, 0, 0);
        uav_mesh2_physics.velocity.set(-40, 0, 0);
        animationCallBack = () => {
          physics_scene.step(1 / 60);
          uav_mesh1.position.copy(uav_mesh1_physics.position);
          uav_mesh2.position.copy(uav_mesh2_physics.position);
          if (!flag) uav_mesh1_physics.applyForce(new CANNON.Vec3(0, uav_mesh1_physics.mass * 9.8, 0));
          if (!flag) uav_mesh2_physics.applyForce(new CANNON.Vec3(0, uav_mesh2_physics.mass * 9.8, 0));
        };
      },
    };
  }

  async function play4() {
    // 创建基础场景
    const { world, physics_scene } = getWorld();

    // 创建无人机
    const { mesh: uav_mesh1, physics: uav_mesh1_physics, material: material1 } = await getUAVMesh();
    world.add(uav_mesh1);
    physics_scene.addBody(uav_mesh1_physics);

    // 创建无人机
    const { mesh: uav_mesh2, physics: uav_mesh2_physics, material: material2 } = await getUAVMesh();
    material2.setValues({ color: new THREE.Color(0xffffff) });
    world.add(uav_mesh2);
    physics_scene.addBody(uav_mesh2_physics);

    // 虚线
    const point1 = [
      [50, 50, 0],
      [-50, 50, 0],
    ].map((item) => new THREE.Vector3(...item));
    const curve1 = new THREE.CatmullRomCurve3(point1);
    const line1 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve1.getPoints(50)), new THREE.LineDashedMaterial({ color: "#fff", scale: 1, dashSize: 3, gapSize: 1 }));
    line1.position.set(0, 0, 0.2);
    line1.computeLineDistances();
    world.add(line1);

    // 实线
    const point2 = [
      [-50, 50, 0],
      [-15, 50, 0],
      [-10, 50, 0],
      [-10, 50, 3],
      [-10, 50, 6],
      [-10, 50, 10],
      [10, 50, 10],
      [10, 50, 6],
      [10, 50, 3],
      [10, 50, 0],
      [15, 50, 0],
      [50, 50, 0],
    ].map((item) => new THREE.Vector3(...item));
    const curve2 = new THREE.CatmullRomCurve3(point2);
    const line2 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve2.getPoints(50)), new THREE.LineBasicMaterial({ color: "#f00" }));

    world.add(line2);

    let time = 0;
    const totalTime = 10;

    const callback = () => {
      time += 1 / 60;
      if (time <= totalTime) {
        const pos1 = curve2.getPointAt(time / totalTime);
        // 计算方向
        uav_mesh1.position.copy(curve2.getPointAt(time / totalTime));
        uav_mesh2.position.copy(curve1.getPointAt(time / totalTime));
      }
    };

    return {
      reset: () => {
        camera.position.set(0, 100, 50);
        camera.lookAt(0, 50, 0);

        time = 0;
        callback();
        scene.add(world);
      },
      close: () => {
        scene.remove(world);
        animationCallBack = null;
      },
      play: () => {
        animationCallBack = callback;
      },
    };
  }

  async function play5() {
    // 创建基础场景
    const { world, physics_scene } = getWorld();

    // 创建无人机
    const { mesh: uav_mesh1, physics: uav_mesh1_physics, material: material1 } = await getUAVMesh();
    world.add(uav_mesh1);
    physics_scene.addBody(uav_mesh1_physics);

    // 创建无人机
    const { mesh: uav_mesh2, physics: uav_mesh2_physics, material: material2 } = await getUAVMesh();
    material2.setValues({ color: new THREE.Color(0xffffff) });
    world.add(uav_mesh2);
    physics_scene.addBody(uav_mesh2_physics);

    // 虚线
    const point1 = [
      [-50, 50, 0],
      [50, 50, 0],
    ].map((item) => new THREE.Vector3(...item));
    const curve1 = new THREE.CatmullRomCurve3(point1);
    const line1 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve1.getPoints(50)), new THREE.LineDashedMaterial({ color: "#f00", scale: 1, dashSize: 3, gapSize: 1 }));
    line1.position.set(0, 0, 0.2);
    line1.computeLineDistances();
    world.add(line1);

    // 虚线
    const point2 = [
      [0, 50, -50],
      [0, 50, 50],
    ].map((item) => new THREE.Vector3(...item));
    const curve2 = new THREE.CatmullRomCurve3(point2);
    const line2 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve2.getPoints(50)), new THREE.LineDashedMaterial({ color: "#fff", scale: 1, dashSize: 3, gapSize: 1 }));
    line2.position.set(0, 0, 0.2);
    line2.computeLineDistances();
    world.add(line2);

    let flag = false;
    function handleCollide(e) {
      flag = true;
    }
    uav_mesh1_physics.addEventListener("collide", handleCollide);

    return {
      reset: () => {
        camera.position.set(0, 100, 50);
        camera.lookAt(0, 50, 0);

        flag = false;
        uav_mesh1_physics.position.set(-50, 50, 0);
        uav_mesh1.position.copy(uav_mesh1_physics.position);
        uav_mesh2_physics.position.set(0, 50, 50);
        uav_mesh2.position.copy(uav_mesh2_physics.position);
        scene.add(world);
      },
      close: () => {
        scene.remove(world);
        animationCallBack = null;
      },
      play: () => {
        uav_mesh1_physics.velocity.set(40, 0, 0);
        uav_mesh2_physics.velocity.set(0, 0, -40);
        animationCallBack = () => {
          physics_scene.step(1 / 60);
          uav_mesh1.position.copy(uav_mesh1_physics.position);
          uav_mesh2.position.copy(uav_mesh2_physics.position);
          if (!flag) uav_mesh1_physics.applyForce(new CANNON.Vec3(0, uav_mesh1_physics.mass * 9.8, 0));
          if (!flag) uav_mesh2_physics.applyForce(new CANNON.Vec3(0, uav_mesh2_physics.mass * 9.8, 0));
        };
      },
    };
  }

  async function play6() {
    // 创建基础场景
    const { world, physics_scene } = getWorld();

    // 创建无人机
    const { mesh: uav_mesh1, physics: uav_mesh1_physics, material: material1 } = await getUAVMesh();
    world.add(uav_mesh1);
    physics_scene.addBody(uav_mesh1_physics);

    // 创建无人机
    const { mesh: uav_mesh2, physics: uav_mesh2_physics, material: material2 } = await getUAVMesh();
    material2.setValues({ color: new THREE.Color(0xffffff) });
    uav_mesh2.rotation.z += Math.PI / 2;
    world.add(uav_mesh2);
    physics_scene.addBody(uav_mesh2_physics);

    // 虚线
    const point1 = [
      [-50, 50, 0],
      [50, 50, 0],
    ].map((item) => new THREE.Vector3(...item));
    const curve1 = new THREE.CatmullRomCurve3(point1);
    const line1 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve1.getPoints(50)), new THREE.LineDashedMaterial({ color: "#f00", scale: 1, dashSize: 3, gapSize: 1 }));
    line1.position.set(0, 0, 0.2);
    line1.computeLineDistances();
    world.add(line1);

    // 虚线
    const point2 = [
      [0, 50, -50],
      [0, 50, 50],
    ].map((item) => new THREE.Vector3(...item));
    const curve2 = new THREE.CatmullRomCurve3(point2);
    const line2 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve2.getPoints(50)), new THREE.LineDashedMaterial({ color: "#fff", scale: 1, dashSize: 3, gapSize: 1 }));
    line2.position.set(0, 0, 0.2);
    line2.computeLineDistances();
    world.add(line2);

    let flag = false;
    function handleCollide(e) {
      flag = true;
    }
    uav_mesh1_physics.addEventListener("collide", handleCollide);

    return {
      reset: () => {
        camera.position.set(0, 100, 50);
        camera.lookAt(0, 50, 0);

        flag = false;
        uav_mesh1_physics.position.set(-50, 50, 0);
        uav_mesh1.position.copy(uav_mesh1_physics.position);
        uav_mesh2_physics.position.set(0, 50, 50);
        uav_mesh2.position.copy(uav_mesh2_physics.position);
        scene.add(world);
      },
      close: () => {
        scene.remove(world);
        animationCallBack = null;
      },
      play: () => {
        uav_mesh1_physics.velocity.set(40, 0, 0);
        uav_mesh2_physics.velocity.set(0, 0, -40);
        animationCallBack = () => {
          physics_scene.step(1 / 60);
          uav_mesh1.position.copy(uav_mesh1_physics.position);
          uav_mesh2.position.copy(uav_mesh2_physics.position);
          if (!flag) uav_mesh1_physics.applyForce(new CANNON.Vec3(0, uav_mesh1_physics.mass * 9.8, 0));
          if (!flag) uav_mesh2_physics.applyForce(new CANNON.Vec3(0, uav_mesh2_physics.mass * 9.8, 0));
          if (uav_mesh1.position.x >= 10) {
            uav_mesh2_physics.velocity.set(0, 0, -40);
          } else if (uav_mesh1.position.x >= -10) {
            uav_mesh2_physics.velocity.set(0, 0, 0);
          }
          if (uav_mesh1.position.x >= 50) {
            uav_mesh1_physics.velocity.set(0, 0, 0);
          }
          if (uav_mesh2.position.z <= -50) {
            uav_mesh2_physics.velocity.set(0, 0, 0);
          }
        };
      },
    };
  }

  return {
    play1,
    play2,
    play3,
    play4,
    play5,
    play6,
  };
}
