import * as THREE from 'three'
import { Layer, MAP_EVENT } from '@/mymap/index.js'
import { SELECT_STATE_KEY, SELECT_EVENT, isDoubleClick } from './utils.js'

export class PolygonSelectLayer extends Layer {
  name = 'PolygonSelectLayer'
  color = 0x409eff
  opacity = 0.5
  state = SELECT_STATE_KEY.NOT_STARTED

  center = [0, 0]
  pointList = []
  movePoint = null

  get path() {
    return [...this.pointList, this.movePoint, this.pointList[0]].filter((v) => !!v)
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
    })

    this.geometry1 = new THREE.BufferGeometry()
    this.mesh1 = new THREE.Mesh(this.geometry1, this.material1)

    this.material2 = new THREE.MeshBasicMaterial({
      transparent: true,
      color: new THREE.Color(this.color),
      depthFunc: THREE.AlwaysDepth,
      alphaTest: 0.2,
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
        this.pointList = [[x, y]]
        this.movePoint = [x, y]
        this.update()
        this.handleStateChange()
      } else if (this.state == SELECT_STATE_KEY.IN_PROGREES) {
        isDoubleClick(this.id, 250, (res) => {
          if (res) {
            this.state = SELECT_STATE_KEY.ENDED
            const [x, y] = data.webMercatorXY
            this.pointList[this.pointList.length] = [x, y]
            this.movePoint = null
            this.update()
            this.handleStateChange()
          } else {
            const [x, y] = data.webMercatorXY
            this.pointList[this.pointList.length] = [x, y]
            this.update()
            this.handleStateChange()
          }
        })
      }
    }
    if (type == MAP_EVENT.HANDLE_MOUSE_MOVE) {
      if (this.state == SELECT_STATE_KEY.IN_PROGREES) {
        const [x, y] = data.webMercatorXY
        this.movePoint = [x, y]
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
    this.pointList = []
    this.center = [0, 0]
    this.movePoint = null
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
