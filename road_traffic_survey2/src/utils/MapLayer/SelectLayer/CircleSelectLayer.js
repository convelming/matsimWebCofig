import * as THREE from 'three'
import { Layer, MAP_EVENT } from '@/mymap/index.js'
import { SELECT_STATE_KEY, SELECT_EVENT, isDoubleClick } from './utils.js'

/**
 * 根据圆心和圆上一点生成圆上的坐标点集
 * @param {Object} center - 圆心坐标 {x, y}
 * @param {Object} pointOnCircle - 圆上一点 {x, y}
 * @param {Number} numPoints - 插值点数量，默认100
 */
function generateCirclePoints(center, pointOnCircle, numPoints = 100) {
  // 1. 计算半径
  const r = Math.sqrt(
    Math.pow(pointOnCircle[0] - center[0], 2) + Math.pow(pointOnCircle[1] - center[1], 2),
  )

  const points = []
  for (let i = 0; i <= numPoints; i++) {
    const theta = (i / numPoints) * 2 * Math.PI
    const x = center[0] + r * Math.cos(theta)
    const y = center[1] + r * Math.sin(theta)
    points.push([x, y])
  }
  return points
}

export class CircleSelectLayer extends Layer {
  name = 'CircleSelectLayer'
  color = 0x409eff
  opacity = 0.5
  state = SELECT_STATE_KEY.NOT_STARTED
  center = [0, 0]
  startPoint = null
  endPoint = null

  get path() {
    if (this.startPoint == null || this.endPoint == null) {
      return []
    } else {
      return generateCirclePoints(this.startPoint, this.endPoint, 32)
    }
  }

  constructor(opt) {
    super(opt)
    this.color = opt.color || 0x409eff
    this.opacity = opt.opacity || 0.5
    this.material1 = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: this.opacity,
      color: new THREE.Color(this.color),
      depthFunc: THREE.AlwaysDepth,
      alphaTest: 0.2,
      // depthWrite: false
    })

    this.geometry1 = new THREE.BufferGeometry()
    this.mesh1 = new THREE.Mesh(this.geometry1, this.material1)

    this.material2 = new THREE.MeshBasicMaterial({
      transparent: true,
      color: new THREE.Color(this.color),
      depthFunc: THREE.AlwaysDepth,
      alphaTest: 0.2,
      // depthWrite: false
    })
    this.geometry2 = new THREE.BufferGeometry()
    this.mesh2 = new THREE.LineLoop(this.geometry2, this.material2)

    this.scene.add(this.mesh1)
    this.scene.add(this.mesh2)
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      const [x, y] = this.map.WebMercatorToCanvasXY(...this.center)
      this.mesh1.position.set(x, y, 0)
      this.mesh2.position.set(x, y, 0)
    }
    if (type == MAP_EVENT.HANDLE_CLICK_LEFT) {
      if (this.state == SELECT_STATE_KEY.CAN_START) {
        this.state = SELECT_STATE_KEY.IN_PROGREES
        const [x, y] = data.webMercatorXY
        this.center = [x, y]
        this.startPoint = [x, y]
        this.endPoint = [x, y]
        this.update()
        this.handleStateChange()
      } else if (this.state == SELECT_STATE_KEY.IN_PROGREES) {
        // isDoubleClick(this.id, 250, (res) => {
        //   if (res) {
        this.state = SELECT_STATE_KEY.ENDED
        const [x, y] = data.webMercatorXY
        this.endPoint = [x, y]
        this.update()
        this.handleStateChange()
        //   }
        // })
      }
    }
    if (type == MAP_EVENT.HANDLE_MOUSE_MOVE) {
      if (this.state == SELECT_STATE_KEY.IN_PROGREES) {
        const [x, y] = data.webMercatorXY
        this.endPoint = [x, y]
        this.update()
        this.handleStateChange()
      }
    }
  }

  handleStateChange() {
    this.handleEventListener(SELECT_EVENT.STATE_CHANGE, {
      state: this.state,
      path: this.path,
    })
  }

  stop() {
    this.state = SELECT_STATE_KEY.NOT_STARTED
    this.handleStateChange()
  }

  play() {
    this.state = SELECT_STATE_KEY.CAN_START
    this.handleStateChange()
  }

  reset() {
    this.state = SELECT_STATE_KEY.NOT_STARTED
    this.center = [0, 0]
    this.startPoint = null
    this.endPoint = null
    this.update()
    this.handleStateChange()
  }

  onAdd(map) {
    super.onAdd(map)
    this.on(MAP_EVENT.UPDATE_CENTER)
  }
  update() {
    const [cx, cy] = this.center
    if (this.path.length > 0) {
      const path = this.path.map(([x, y]) => new THREE.Vector2(x - cx, y - cy))
      const shape = new THREE.Shape(path)

      if (this.geometry1) this.geometry1.dispose()
      this.geometry1 = new THREE.ShapeGeometry(shape)
      this.mesh1.geometry = this.geometry1

      if (this.geometry2) this.geometry2.dispose()
      this.geometry2 = new THREE.BufferGeometry()
      this.geometry2.setFromPoints(path)
      this.mesh2.geometry = this.geometry2

      if (this.map) this.on(MAP_EVENT.UPDATE_CENTER)
    } else {
      if (this.geometry1) this.geometry1.dispose()
      this.geometry1 = new THREE.BufferGeometry()
      this.mesh1.geometry = this.geometry1

      if (this.geometry2) this.geometry2.dispose()
      this.geometry2 = new THREE.BufferGeometry()
      this.mesh2.geometry = this.geometry2
    }
    if (this.map) this.on(MAP_EVENT.UPDATE_CENTER)
  }
}
