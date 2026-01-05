import * as THREE from 'three'
import { Layer, MAP_EVENT } from '@/mymap/index.js'

export class ImageListLayer extends Layer {
  name = 'ImageListLayer'
  center = [0, 0]

  // 高亮

  constructor(opt) {
    super(opt)
    this.size = opt.size || 20
    this.data = opt.data || null
    this.color = new THREE.Color(opt.color || 'orange')
    this.hColor = new THREE.Color(opt.hColor || '#67C23A')
    this.icon = opt.icon || new URL('@/assets/images/image.svg?url', import.meta.url).href

    this.texture = new THREE.TextureLoader().load(
      this.icon,
      console.log,
      console.log,
      console.error,
    )
    this.geometry = new THREE.BufferGeometry()

    this.material = new THREE.PointsMaterial({
      size: this.size,
      color: this.color,
      map: this.texture,
      vertexColors: false,
      transparent: true,
      sizeAttenuation: false,
    })
    this.mesh = new THREE.Points(this.geometry, this.material)
    this.mesh.position.set(0, 0, 0)
    this.scene.add(this.mesh)

    this.pickLayerMaterial = new THREE.PointsMaterial({
      size: this.size,
      color: this.pickLayerColor,
      // map: this.texture,
      vertexColors: false,
      transparent: true,
      sizeAttenuation: false,
    })
    this.pickLayerMesh = new THREE.Points(this.geometry, this.pickLayerMaterial)
    this.pickLayerMesh.position.set(0, 0, 0)
    this.pickLayerScene.add(this.pickLayerMesh)

    this.pickMaterial = new THREE.PointsMaterial({
      size: this.size,
      // map: this.texture,
      vertexColors: true,
      transparent: true,
      sizeAttenuation: false,
    })
    this.pickMesh = new THREE.Points(this.geometry, this.pickMaterial)
    this.pickMesh.position.set(0, 0, 0)
    this.pickMeshScene.add(this.pickMesh)

    this.hGeometry = new THREE.BufferGeometry()
    this.hGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3),
    )
    this.hMaterial = new THREE.PointsMaterial({
      size: this.size,
      map: this.texture,
      color: this.hColor,
      vertexColors: false,
      transparent: true,
      sizeAttenuation: false,
    })
    this.hMesh = new THREE.Points(this.hGeometry, this.hMaterial)
    this.hMesh.position.set(0, 0, 1)
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      const [x, y] = this.map.WebMercatorToCanvasXY(this.center[0], this.center[1])
      console.log(x, y, this.center)

      this.mesh.position.set(x, y, 0)
      this.pickLayerMesh.position.set(x, y, 0)
      this.pickMesh.position.set(x, y, 0)
      this.hMesh.position.set(x, y, 1)
    }
    if (type == MAP_EVENT.HANDLE_PICK_LEFT && data.layerId == this.id) {
      this.handleEventListener(type, this.data[data.pickColor - 1])
    }
  }

  onAdd(map) {
    super.onAdd(map)
    this.on(MAP_EVENT.UPDATE_CENTER)
  }

  setSize(size) {
    this.size = size

    if (this.material) {
      this.material.setValues({ size })
      this.material.needsUpdate = true
    }
    if (this.hMaterial) {
      this.hMaterial.setValues({ size })
      this.hMaterial.needsUpdate = true
    }
    if (this.pickLayerMaterial) {
      this.pickLayerMaterial.setValues({ size })
      this.pickLayerMaterial.needsUpdate = true
    }
    if (this.pickMaterial) {
      this.pickMaterial.setValues({ size })
      this.pickMaterial.needsUpdate = true
    }

    if (this.hMesh) this.hMesh.position.z = 1
    if (this.mesh) this.mesh.position.z = 0
    if (this.pickLayerMesh) this.pickLayerMesh.position.z = 0
    if (this.pickMesh) this.pickMesh.position.z = 0
  }

  setData(data) {
    this.data = data
    this.update()
  }
  setColor(color) {
    this.color = color
    this.material.setValues({ color: color })
    this.material.needsUpdate = true
  }
  setHColor(hColor) {
    this.hColor = hColor
    this.hMaterial.setValues({ color: hColor })
    this.hMaterial.needsUpdate = true
  }

  setHMesh(data) {
    if (!!data && !!this.data) {
      console.log(data)
      const x = data.x - this.center[0]
      const y = data.y - this.center[1]
      this.hGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array([x, y, 0]), 3),
      )
      this.hGeometry.needsUpdate = true
      this.scene.add(this.hMesh)
    } else {
      this.scene.remove(this.hMesh)
    }
  }

  update() {
    if (!this.data) return
    const count = this.data.length
    const positions = new THREE.BufferAttribute(new Float32Array(count * 3), 3)
    const pickColors = new THREE.BufferAttribute(new Float32Array(count * 3), 3)
    let center = []

    for (let i = 0; i < count; i++) {
      const v = this.data[i]
      if (i == 0) center = [v.x, v.y]
      positions.setXYZ(i, v.x - center[0], v.y - center[1], 0)
      const pickColor = new THREE.Color(i + 1)
      pickColors.setXYZ(i, pickColor.r, pickColor.g, pickColor.b)
    }

    this.geometry.setAttribute('position', positions)
    this.geometry.setAttribute('color', pickColors)
    this.geometry.needsUpdate = true
    this.geometry.computeBoundingSphere()

    this.center = center

    if (this.map) this.on(MAP_EVENT.UPDATE_CENTER)
  }
}
