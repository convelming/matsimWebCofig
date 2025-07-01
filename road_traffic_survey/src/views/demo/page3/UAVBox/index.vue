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
import TWEEN from "@tweenjs/tween.js";
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
    this._renderer.domElement.style.userSelect = "none";
    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._renderer.localClippingEnabled = true;
    threeBox.appendChild(this._renderer.domElement);

    console.log(threeBox.clientWidth);

    this._scene = new THREE.Scene();
    this._scene.background = new THREE.Color(this.background);

    // 创建相机
    this._camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
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

    this._boxs = [];
    this._tweens1 = [];
    this._tweens2 = [];
    for (let i1 = 0; i1 < 3; i1++) {
      // 层
      const l1 = [];
      for (let i2 = 0; i2 < 3; i2++) {
        // 行
        const l2 = [];
        for (let i3 = 0; i3 < 3; i3++) {
          // 列
          if (i1 === 1 && i2 === 1 && i3 === 1) {
            l2.push(null);
          } else {
            //创建一个长方体几何对象Geometry
            const size = this.boxSize * 0.9;
            const geometry = new THREE.BoxGeometry(size, size, size);
            //创建一个材质对象Material
            // const material = new THREE.MeshBasicMaterial({
            //   side: THREE.DoubleSide, //两面可见
            //   color: color, //0xff0000设置材质颜色为红色
            // });
            const material = new THREE.MeshPhongMaterial({
              color: 0xffe66d,
              transparent: true,
              opacity: 0.7,
              shininess: 90,
              side: THREE.DoubleSide,
            });
            const box = new THREE.Mesh(geometry, material);

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
            material.clipPlanes = clipPlanes.map((p) => new THREE.Plane().clone().translate(translateP));
            material.needUpdate = true;

            const tweenFunc = (nPos) => {
              boxGroup.position.set(nPos.x, nPos.y, nPos.z);
              const translateP = new THREE.Vector3(boxGroup.position.x, boxGroup.position.z, -boxGroup.position.y);
              material.clipPlanes = clipPlanes.map((p) => new THREE.Plane().clone().translate(translateP));
              material.needUpdate = true;
            };
            //创建Tween 补间动画效果
            const tween1 = new TWEEN.Tween({ x, y, z }).to({ x: tx, y: ty, z: tz }, 1000).onUpdate(tweenFunc);
            const tween2 = new TWEEN.Tween({ x: tx, y: ty, z: tz }).to({ x, y, z }, 1000).onUpdate(tweenFunc);
            this._tweens1.push(tween1);
            this._tweens2.push(tween2);
            l2.push(boxGroup);
            this._world.add(boxGroup);
          }
        }
        l1.push(l2);
      }
      this._boxs.push(l1);
    }

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
    });

    const animation = (time) => {
      this._renderer.render(this._scene, this._camera);
      TWEEN.update(time);
      window.requestAnimationFrame(animation);
    };
    animation();

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
  },
  methods: {
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
