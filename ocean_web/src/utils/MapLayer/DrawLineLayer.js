import * as THREE from 'three'
import { Layer, MAP_EVENT } from '@/mymap/index.js'
import { guid } from '@/utils'

const loader = new THREE.TextureLoader()

const BASE_API = import.meta.env.VITE_APP_BASE_API

export const DRAW_LINE_STATE_KEY = {
  DISABLE: 0, // 禁止改变
  CHANGE_BEGIN: 1, // 待确定起始点
  CHANGE_END: 2, // 待确定结束点
}

export class DrawLineLayer extends Layer {
  isAdd = false
  drawLineIndex = 0
  drawLineList = []

  lineColor = 0x00ff00
  lineHighlightColor = 0xff0000

  image = null
  drawImage = null

  constructor(opt) {
    super(opt)
    this.url = opt.url
    this.width = opt.width
    this.height = opt.height

    if (this.url) {
      const material = new THREE.MeshBasicMaterial({
        depthWrite: false,
        side: THREE.DoubleSide,
        map: loader.load(BASE_API + this.url),
      })
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(
          [0, 0, 0, 0, -this.height, 0, this.width, -this.height, 0, this.width, 0, 0],
          3,
        ),
      )
      geometry.setAttribute('uv', new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 1, 1], 2))
      geometry.setIndex(new THREE.Uint16BufferAttribute([0, 1, 2, 0, 2, 3], 1))
      geometry.computeBoundingBox()
      geometry.computeVertexNormals()
      this.imageMesh = new THREE.Mesh(geometry, material)
      this.scene.add(this.imageMesh)
    }

    if (opt.drawLineList) {
      this.drawLineList = opt.drawLineList.map(
        (v) => new DrawLine(v.name, [v.beginx, v.beginy], [v.endx, v.endy], v.color),
      )
      console.log(this.drawLineList)
      for (const line of this.drawLineList) {
        this.scene.add(line._mesh)
      }
    }
  }

  onAdd(map) {
    if (this.map) this.removeFromParent()
    this.map = map
    this.setPickLayerColor(this.map.getPickLayerColor())
    const scale = 0.05
    const fov = this.map.camera.fov
    const z = this.height / 2 / Math.tan((fov * Math.PI) / 360)
    this.map.camera.add(this.scene)
    this.scene.position.set((-this.width / 2) * scale, (this.height / 2) * scale, -z * scale)
    this.scene.scale.set(scale, scale, 1)
  }

  on(type, data) {
    const line = this.drawLineList[this.drawLineIndex]
    if (type == MAP_EVENT.HANDLE_CLICK_LEFT && line) {
      const [width, height] = data.windowSize
      const [mx, my] = data.webMercatorXY
      const [wx, wy] = data.windowXY
      const x = (wx * this.width) / width
      const y = (wy * this.height) / height

      if (line.state == DRAW_LINE_STATE_KEY.CHANGE_BEGIN) {
        line.state = DRAW_LINE_STATE_KEY.CHANGE_END
        line.begin = [x, y]
        line.end = [x, y]
        line.updateGeometry()
      } else if (line.state == DRAW_LINE_STATE_KEY.CHANGE_END) {
        line.state = DRAW_LINE_STATE_KEY.CHANGE_BEGIN
        line.end = [x, y]
        line.updateGeometry()
      }
    }

    if (type == MAP_EVENT.HANDLE_MOUSE_MOVE && line) {
      const [width, height] = data.windowSize
      const [mx, my] = data.webMercatorXY
      const [wx, wy] = data.windowXY
      const x = (wx * this.width) / width
      const y = (wy * this.height) / height
      console.log(line.state)

      if (line.state == DRAW_LINE_STATE_KEY.CHANGE_END) {
        line.end = [x, y]
        line.updateGeometry()
      }
    }
  }

  addLine() {
    const line = new DrawLine()
    line.state = DRAW_LINE_STATE_KEY.CHANGE_BEGIN
    this.scene.add(line._mesh)

    this.drawLineIndex = this.drawLineList.length
    this.drawLineList.push(line)
    this.isAdd = true
    return line
  }

  editLine(index) {
    const line = this.drawLineList[index]
    if (line) {
      this.drawLineIndex = index
      this._editLineJson = line.toJSON()
      this.isAdd = false

      line.state = DRAW_LINE_STATE_KEY.CHANGE_BEGIN
      return line
    }
  }

  confirmLine() {
    const line = this.drawLineList[this.drawLineIndex]
    if (line) {
      line.state = DRAW_LINE_STATE_KEY.DISABLE
      this.drawLineIndex = -1
    }
  }

  cancelLine() {
    if (this.isAdd) {
      this.removeLine(this.drawLineIndex)
      this.drawLineIndex = -1
    } else {
      this.drawLineList[this.drawLineIndex].setFromJSON(this._editLineJson)
      this.confirmLine()
    }
  }

  removeLine(index) {
    const line = this.drawLineList[index]
    this.drawLineList.splice(index, 1)
    if (line) {
      this.scene.remove(line._mesh)
    }
    return line
  }

  setHighlight(index) {
    for (let i = 0; i < this.drawLineList.length; i++) {
      if (index == i) {
        this.drawLineList[i].material.setValue({ color: this.lineHighlightColor })
      } else {
        this.drawLineList[i].material.setValue({ color: this.lineColor })
      }
    }
  }

  dispose() {
    super.dispose()
    if (this.imageMesh) {
      this.imageMesh.material.map.dispose()
      this.imageMesh.geometry.dispose()
    }
    this.drawLineList.map((v) => {
      v.dispose()
    })
  }
}

class DrawLine {
  state = DRAW_LINE_STATE_KEY.CHANGE_BEGIN

  _begin = [0, 0]
  _end = [0, 0]
  _color = '#ff4500'

  set begin(begin) {
    if (this.state == DRAW_LINE_STATE_KEY.DISABLE) return
    this._begin = begin.map((v) => parseInt(v))
    this.updateGeometry()
  }
  get begin() {
    return this._begin
  }

  set end(end) {
    if (this.state == DRAW_LINE_STATE_KEY.DISABLE) return
    this._end = end.map((v) => parseInt(v))
    this.updateGeometry()
  }
  get end() {
    return this._end
  }

  set color(color) {
    this._color = color
    this._material.setValues({ color: this.color })
    this._material.needsUpdate = true
  }
  get color() {
    return this._color
  }

  constructor(name = '', begin = [0, 0], end = [0, 0], color = '#ff4500') {
    this._geometry = new THREE.BufferGeometry()
    this._material = new THREE.LineBasicMaterial({
      depthFunc: THREE.AlwaysDepth,
    })

    this._mesh = new THREE.Line(this._geometry, this._material)
    this._mesh.renderOrder = 999

    this.uuid = guid()
    this.name = name || this.uuid.substring(0, 8)
    this.color = color
    this.begin = begin
    this.end = end

    this.state = DRAW_LINE_STATE_KEY.DISABLE
  }

  updateGeometry() {
    this._geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(
        [this.begin[0], -this.begin[1], 0.1, this.end[0], -this.end[1], 0.1],
        3,
      ),
    )
    this._geometry.computeBoundingSphere()
    this._geometry.needsUpdate = true
  }

  setFromJSON(data) {
    this.uuid = data.uuid
    this.name = data.name
    this.begin = data.begin
    this.end = data.end
    this.color = data.color
  }

  dispose() {
    this._geometry.dispose()
  }

  toJSON() {
    return {
      uuid: this.uuid,
      name: this.name,
      begin: [...this.begin],
      end: [...this.end],
      color: this.color,
    }
  }
}
