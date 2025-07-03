<!-- UAVBox -->
<template>
  <div class="UAVBox">
    <div ref="threeBox" class="threeBox"></div>
    <div class="toolBar">
      <div class="card">
        <el-form size="small" label-position="left">
          <el-row :gutter="0">
            <el-col :span="12" :offset="0">
              <el-form-item label="">
                <el-button v-if="playClipActionKey == 'sh'" type="primary" @click="playClipAction('zk')">展开</el-button>
                <el-button v-if="playClipActionKey == 'zk'" type="primary" @click="playClipAction('sh')">收回</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import * as THREE from "three";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// import { Tween } from "three/addons/libs/tween.module.min.js";
import TWEEN, { add } from "@tweenjs/tween.js";
export default {
  name: "UAVBox",
  props: {},
  components: {},
  computed: {},
  watch: {},
  data() {
    return {
      playClipActionKey: "sh",
      background: 0x000,
      boxSize: 50,
    };
  },
  created() {},
  mounted() {
    console.log(TWEEN);
    this.initThree();
    this.addBoxs();
    this.addUAV();
    this.addf();
    this.addLine();
    this.addLine2();
  },
  methods: {
    initThree() {
      const threeBox = this.$refs.threeBox;
      // 创建渲染器
      this._renderer = new THREE.WebGLRenderer({
        // 设置抗锯齿
        antialias: true,
        // 设置对数深度缓冲区
        // logarithmicDepthBuffer: true,
        // precision: "highp"
        // preserveDrawingBuffer: true,
      });
      // this._renderer.sortObjects = false;
      this._renderer.domElement.style.userSelect = "none";
      this._renderer.setPixelRatio(window.devicePixelRatio);
      this._renderer.localClippingEnabled = true;
      threeBox.appendChild(this._renderer.domElement);
      console.log(threeBox.clientWidth);

      this._scene = new THREE.Scene();
      this._scene.background = new THREE.Color(this.background);

      // 创建相机
      this._camera = new THREE.PerspectiveCamera(60, 1, 0.01, 1000);
      // 设置相机位置
      this._camera.position.x = -300;

      // 设置相机控件轨道控制器OrbitControls
      this._cameraControls = new OrbitControls(this._camera, this._renderer.domElement);
      this._scene.add(this._camera);

      // 创建渲染地图分组
      this._world = new THREE.Group();
      // 对地图的坐标系进行纠正
      this._world.rotateX(-Math.PI / 2);
      this._world.scale.set(1, 1, 1);
      // 添加一个模拟3个坐标轴的对象
      this._world.add(new THREE.AxesHelper(1000));
      this._scene.add(this._world);

      // 添加环境光线
      const light = new THREE.AmbientLight(0xffffff, 0.8);
      this._world.add(light);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // 创建方向光
      directionalLight.position.set(1, 1, 0); // 设置方向光源位置
      this._world.add(directionalLight);

      const resize = () => {
        // 节流
        if (this._setSizeTimeout) return;
        this._setSizeTimeout = setTimeout(() => {
          const width = threeBox.clientWidth;
          const height = threeBox.clientHeight;
          this._camera.aspect = width / height;
          this._camera.updateProjectionMatrix();
          this._renderer.setSize(width, height);
          this._setSizeTimeout = null;
        }, 1000 / 120);
      };
      new ResizeObserver(resize.bind(this)).observe(threeBox);

      resize();

      // 创建时钟对象
      const clock = new THREE.Clock();
      const animation = (time) => {
        this.$emit("animation", { time, clock });
        this._renderer.render(this._scene, this._camera);
        TWEEN.update(time);
        window.requestAnimationFrame(animation);
      };
      animation();
    },
    addBoxs() {
      this._tweens1 = [];
      this._tweens2 = [];

      const size = this.boxSize * 0.9;
      const particleCount = 100000;
      const particleRange = 150;
      const particlesGeometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * particleRange; // 随机位置，构成 3D 空间中的一个粒子
      }

      particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

      const lineRange = this.boxSize * 8;
      const lineCurve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(lineRange / 2, 0, lineRange / 2), new THREE.Vector3(0, 0, -lineRange / 2), new THREE.Vector3(-lineRange / 2, 0, -lineRange / 2));
      const center = lineCurve.getPoint(0.5);
      const points = lineCurve.getPoints(10);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineGeoList = [];
      for (let i = 0; i < 1000; i++) {
        const geo = lineGeo.clone();
        geo.applyMatrix4(new THREE.Matrix4().makeTranslation((Math.random() - 0.5) * this.boxSize * 8 - center.x, (Math.random() - 0.5) * this.boxSize * 3 - center.y, 0 - center.z));
        lineGeoList.push(geo);
      }

      const tubeCurve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-lineRange / 2, 0, -lineRange / 2), new THREE.Vector3(0, 0, -lineRange / 2), new THREE.Vector3(lineRange / 2, 0, lineRange / 2));
      const tubeGeo = new THREE.TubeGeometry(lineCurve, 10, 0.3, 3, false);
      const tubeTexture = new THREE.TextureLoader().load(require("@/assets/image/lg_red.svg"));
      tubeTexture.wrapS = tubeTexture.wrapT = THREE.RepeatWrapping;
      tubeTexture.repeat.set(1, 1);
      // setInterval(() => {
      //   tubeTexture.offset.x += 0.01;
      // }, 1000 / 60);
      const tubeNum = 1000;
      const tubeTranslation = [];
      for (let i = 0; i < 1000; i++) {
        const matrix4 = new THREE.Matrix4().makeTranslation((Math.random() - 0.5) * this.boxSize * 8 - center.x, (Math.random() - 0.5) * this.boxSize * 3 - center.y, 0 - center.z);
        tubeTranslation.push(matrix4);
      }

      for (let i1 = 0; i1 < 3; i1++) {
        // 层
        for (let i2 = 0; i2 < 3; i2++) {
          // 行
          for (let i3 = 0; i3 < 3; i3++) {
            // 列
            if (i1 === 1 && i2 === 1 && i3 === 1) {
            } else {
              //创建一个长方体几何对象Geometry
              const geometry = new THREE.BoxGeometry(size, size, size);
              //创建一个材质对象Material
              // const material = new THREE.MeshBasicMaterial({
              //   side: THREE.DoubleSide, //两面可见
              //   color: color, //0xff0000设置材质颜色为红色
              // });
              const material = new THREE.MeshPhongMaterial({
                color: 0xffe66d,
                transparent: true,
                opacity: 0.3,
                shininess: 90,
                side: THREE.DoubleSide,
              });
              // material.clippingPlanes = clipPlanes.map((p) => p.clone().translate(translateP));
              // material.needUpdate = true;
              const box = new THREE.Mesh(geometry, material);
              box.renderOrder = 10;

              const boxGroup = new THREE.Group();
              boxGroup.add(box);
              const x = (i1 - 1) * this.boxSize;
              const y = (i2 - 1) * this.boxSize;
              const z = (i3 - 1) * this.boxSize;
              const tx = (i1 - 1) * this.boxSize * 1.5;
              const ty = (i2 - 1) * this.boxSize * 1.5;
              const tz = (i3 - 1) * this.boxSize * 1.5;
              boxGroup.position.set(x, y, z);

              const translateP = new THREE.Vector3(boxGroup.position.x, boxGroup.position.z, -boxGroup.position.y);
              const clipPlanes = [
                new THREE.Plane(new THREE.Vector3(-1, 0, 0), size / 2), // 前
                new THREE.Plane(new THREE.Vector3(1, 0, 0), size / 2), // 后
                new THREE.Plane(new THREE.Vector3(0, -1, 0), size / 2), // 上
                new THREE.Plane(new THREE.Vector3(0, 1, 0), size / 2), // 下
                new THREE.Plane(new THREE.Vector3(0, 0, 1), size / 2), // 左
                new THREE.Plane(new THREE.Vector3(0, 0, -1), size / 2), // 右
              ];

              // const particleMaterial = new THREE.PointsMaterial({
              //   // depthTest: false,
              //   color: 0xffffff,
              //   size: 0.5,
              //   transparent: true,
              //   opacity: 0.8,
              // });
              // particleMaterial.clippingPlanes = clipPlanes.map((p) => p.clone().translate(translateP));
              // particleMaterial.needUpdate = true;
              // // 创建粒子系统并添加到场景
              // const particleSystem = new THREE.Points(particlesGeometry, particleMaterial);
              // particleSystem.position.set(-x, -y, -z);
              // boxGroup.add(particleSystem);

              // const lineMaterial = new THREE.LineBasicMaterial({
              //   color: 0xffffff,
              //   transparent: true,
              //   opacity: 0.9,
              // });
              const lineMaterial = new THREE.LineDashedMaterial({
                transparent: true,
                opacity: 0.5,
                color: 0x00ffff,
                scale: Math.random() * 0.5 + 0.5,
                dashSize: Math.random() * 15 + 5,
                gapSize: Math.random() * 15 + 5,
              });
              lineMaterial.clippingPlanes = clipPlanes.map((p) => p.clone().translate(translateP));
              lineMaterial.needUpdate = true;
              for (const geo of lineGeoList) {
                const line = new THREE.Line(geo, lineMaterial);
                line.computeLineDistances();
                line.position.set(-x, -y, -z);
                boxGroup.add(line);
              }

              setInterval(() => {
                let dashSize = lineMaterial.dashSize;
                let gapSize = lineMaterial.gapSize;

                dashSize += Math.random() * Math.random() * 0.5;
                if (dashSize > 20) dashSize = Math.random() * 5 + 5;
                gapSize += Math.random() * Math.random() * 0.5;
                if (gapSize > 20) gapSize = Math.random() * 5 + 5;
                lineMaterial.setValues({ dashSize: dashSize, gapSize: gapSize });
                lineMaterial.needsUpdate = true;
              }, 1000 / 60);

              // const tubeMaterial = new THREE.MeshPhongMaterial({
              //   color: 0xffffff,
              //   transparent: true,
              //   opacity: 0.3,
              //   shininess: 90,
              //   side: THREE.DoubleSide,
              //   map: tubeTexture,
              // });
              // tubeMaterial.clippingPlanes = clipPlanes.map((p) => p.clone().translate(translateP));
              // tubeMaterial.needUpdate = true;
              // const tubeMesh = new THREE.InstancedMesh(tubeGeo, tubeMaterial, tubeNum);
              // for (let i = 0; i < tubeNum; i++) {
              //   tubeMesh.setMatrixAt(i, tubeTranslation[i]);
              // }
              // tubeMesh.position.set(-x, -y, -z);
              // tubeMesh.instanceMatrix.needsUpdate = true;
              // boxGroup.add(tubeMesh);

              const tweenFunc = (nPos) => {
                boxGroup.position.set(nPos.x, nPos.y, nPos.z);
                const translateP = new THREE.Vector3(boxGroup.position.x, boxGroup.position.z, -boxGroup.position.y);
                // material.clippingPlanes = clipPlanes.map((p) => new THREE.Plane().clone().translate(translateP));
                // material.needUpdate = true;

                // particleMaterial.clippingPlanes = clipPlanes.map((p) => p.clone().translate(translateP));
                // particleMaterial.needUpdate = true;
                // tubeMaterial.clippingPlanes = clipPlanes.map((p) => p.clone().translate(translateP));
                // tubeMaterial.needUpdate = true;
                lineMaterial.clippingPlanes = clipPlanes.map((p) => p.clone().translate(translateP));
                lineMaterial.needUpdate = true;
              };
              //创建Tween 补间动画效果
              const tween1 = new TWEEN.Tween({ x, y, z }).to({ x: tx, y: ty, z: tz }, 1000).onUpdate(tweenFunc);
              const tween2 = new TWEEN.Tween({ x: tx, y: ty, z: tz }).to({ x, y, z }, 1000).onUpdate(tweenFunc);
              this._tweens1.push(tween1);
              this._tweens2.push(tween2);
              this._world.add(boxGroup);
            }
          }
        }
      }
      const fx = new THREE.Vector3(1, 1, 1).normalize().toArray();
      setInterval(() => {
        // 粒子系统运动
        const positions = particlesGeometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          for (let j = 0; j < 3; j++) {
            positions[i + j] += (fx[j] / 60) * 10; // 随机位移
            if (positions[i + j] < -particleRange / 2) positions[i + j] = particleRange / 2; // 重置位置
            if (positions[i + j] > particleRange / 2) positions[i + j] = -particleRange / 2; // 重置位置
          }
          // for (let j = 0; j < 3; j++) {
          //   positions[i + j] += (Math.random() - 0.5) * 0.5; // 随机位移
          //   if (positions[i + j] < -particleRange / 2) positions[i + j] = particleRange / 2; // 重置位置
          // }
          // positions[i + 1] -= 0.1; // 逐渐下降
          // if (positions[i + 1] < -particleRange / 2) positions[i + 1] = particleRange / 2; // 重置位置
        }
        particlesGeometry.attributes.position.needsUpdate = true;
      }, 1000 / 60);
    },
    addUAV() {
      // new OBJLoader().load("http://127.0.0.1:5500/%E6%97%A0%E4%BA%BA%E6%9C%BA%20(1).obj", (object) => {
      //   console.log(object);
      //   this._world.add(object);
      // });
      new STLLoader().load(process.env.VUE_APP_BASE_API + "/models/无人机.stl", (geometry) => {
        const m4 = new THREE.Matrix4().makeScale(this.boxSize, this.boxSize, this.boxSize);
        m4.multiply(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
        geometry.applyMatrix4(m4);
        // const material = new THREE.MeshLambertMaterial({ color: 0xff0000 })
        const material = new THREE.MeshPhongMaterial({
          color: 0xff0000,
          transparent: true,
          opacity: 1,
          shininess: 90,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(geometry, material);
        // mesh.position.set(0, this.boxSize * 0.5, 0);
        // this.addClipingBox(material, mesh.position, this.boxSize * 0.5);
        this._world.add(mesh);

        // new TWEEN.Tween(mesh.rotation).to({ x: 0.1, y: 0, z: 0 }, 1000).to({ x: 0.1, y: 0.1, z: 0 }, 1000).to({ x: 0, y: 0.1, z: 0 }, 1000).to({ x: 0, y: 0.1, z: 0.1 }, 1000).to({ x: 0, y: 0, z: 0.1 }, 1000).to({ x: 0, y: 0, z: 0 }, 1000).start();
        const animationTime = 2.5;
        // 创建动画混合器
        const mixer = new THREE.AnimationMixer(mesh);
        // 创建关键帧轨道
        const Pvalues = [0, 0, 0, 3, 0, 0, 0, 3, 3, 0, 0, 3, 0, 0, 0];
        const Ptimes = Array.from({ length: Pvalues.length / 3 }).map((v, i) => (animationTime * i) / (Pvalues.length / 3 - 1));
        const PmoveKeyFrame = new THREE.VectorKeyframeTrack(".position", Ptimes, Pvalues);

        // 创建旋转关键帧
        const Qvalues = [0, 0, 0, 1, 0.1, 0, 0, 1, 0, 0, 0, 1, -0.1, 0, 0, 1, 0, 0, 0, 1];
        const Qtimes = Array.from({ length: Qvalues.length / 4 }).map((v, i) => (animationTime * i) / (Qvalues.length / 4 - 1));
        console.log(Qtimes);

        const QmoveKeyFrame = new THREE.QuaternionKeyframeTrack(".quaternion", Qtimes, Qvalues);
        const clip = new THREE.AnimationClip("Action", animationTime, [PmoveKeyFrame, QmoveKeyFrame]);
        // 创建动画动作并播放
        const clipAction = mixer.clipAction(clip);
        clipAction.play();

        this.$on("animation", ({ time, clock }) => {
          const delta = clock.getDelta();
          mixer.update(delta);
        });
      });
    },
    addf() {
      // const particleCount = 50000;
      // const particleRange = 150;
      // const particlesGeometry = new THREE.BufferGeometry();
      // const positions = new Float32Array(particleCount * 3);
      // for (let i = 0; i < particleCount * 3; i++) {
      //   positions[i] = (Math.random() - 0.5) * particleRange; // 随机位置，构成 3D 空间中的一个粒子
      // }
      // particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      // const particleMaterial = new THREE.PointsMaterial({
      //   color: 0xffffff,
      //   size: 0.5,
      //   transparent: true,
      //   opacity: 0.8,
      // });
      // // 创建粒子系统并添加到场景
      // this._particleSystem = new THREE.Points(particlesGeometry, particleMaterial);
      // this._world.add(this._particleSystem);
      // this.$on("animation", () => {
      //   const positions = particlesGeometry.attributes.position.array;
      //   for (let i = 0; i < positions.length; i += 3) {
      //     positions[i + 1] -= 0.02; // 逐渐下降
      //     if (positions[i + 1] < -particleRange / 2) positions[i + 1] = particleRange / 2; // 重置位置
      //   }
      //   particlesGeometry.attributes.position.needsUpdate = true;
      // });
      // 作者：晓智AI
      // 链接：https://juejin.cn/post/7431357759688409125
      // 来源：稀土掘金
      // 著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。
    },
    addLine() {
      // const particleRange = this.boxSize * 5;
      // const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(particleRange / 2, 0, particleRange / 2), new THREE.Vector3(0, 0, -particleRange / 2), new THREE.Vector3(-particleRange / 2, 0, -particleRange / 2));
      // const center = curve.getPoint(0.5);
      // console.log(center);
      // const points = curve.getPoints(10);
      // const geo = new THREE.BufferGeometry().setFromPoints(points);
      // geo.applyMatrix4(new THREE.Matrix4().makeTranslation(-center.x, -center.y, -center.z));
      // const meshList = [];
      // for (let i = 0; i < 1000; i++) {
      //   const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xffffff }));
      //   line.position.set((Math.random() - 0.5) * particleRange, (Math.random() - 0.5) * particleRange, 0);
      //   meshList.push(line);
      //   this._world.add(line);
      // }
      // setTimeout(() => {
      //   const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(particleRange, 0, particleRange), new THREE.Vector3(0, 0, -particleRange), new THREE.Vector3(-particleRange, 0, -particleRange));
      //   geo.setFromPoints(curve.getPoints(10));
      //   geo.needsUpdate = true;
      // }, 5000);
    },
    addLine2() {
      // const lineRange = this.boxSize * 8;
      // const lineCurve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(lineRange / 2, 0, lineRange / 2), new THREE.Vector3(0, 0, -lineRange / 2), new THREE.Vector3(-lineRange / 2, 0, -lineRange / 2));
      // const center = lineCurve.getPoint(0.5);
      // const points = lineCurve.getPoints(10);
      // const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      // const lineMaterial = new THREE.LineDashedMaterial({
      //   color: 0xffffff,
      //   linewidth: 1,
      //   scale: 1,
      //   dashSize: 10,
      //   gapSize: 10,
      // });
      // const line = new THREE.Line(lineGeo, lineMaterial);
      // line.computeLineDistances();
      // this._world.add(line);
      // setInterval(() => {
      //   lineMaterial.setValues({ dashSize: Math.random() * 10, gapSize: Math.random() * 10 });
      //   lineMaterial.needsUpdate = true;
      // }, 100);
    },
    playClipAction(key) {
      this.playClipActionKey = key;
      let list1 = [];
      let list2 = [];
      if (key == "zk") {
        list1 = this._tweens1;
        list2 = this._tweens2;
      } else if (key == "sh") {
        list1 = this._tweens2;
        list2 = this._tweens1;
      }
      let length = Math.min(list1.length, list2.length);
      for (let i = 0; i < length; i++) {
        const tween1 = list1[i];
        const tween2 = list2[i];
        tween2.stop();
        tween1.start(undefined, false);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.UAVBox {
  overflow: hidden;
  width: 100vw;
  height: 100vh;
  .threeBox {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
  .toolBar {
    width: 500px;
    position: absolute;
    right: 0;
    top: 68px;
    z-index: 1500;
    background-color: #275994;
    user-select: none;
    color: #fff;
    .card {
      background-image: url("../data/card.svg");
      background-size: 100% 100%;
      padding: 25px;
    }
    .el-form {
      height: 200px;
      overflow-y: scroll;
      overflow-x: hidden;

      .el-form-item {
        margin-bottom: 8px;
        color: #fff;
        // color: orange;
      }
      ::v-deep {
        .el-form-item__label {
          color: #fff !important;
          font-size: 14px;
        }
      }
      &::-webkit-scrollbar {
        display: none;
      }
    }

    .title {
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: bold;
      margin: 8px 0;
      background-image: url("../data/title.svg");
      background-size: 100% 100%;
    }
  }
}
</style>
