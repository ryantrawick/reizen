import * as THREE from './three'
import * as PIXI from './pixi'
import 'joypad.js'
// import * as PF from 'pathfinding'
import * as SHADER from './shaders'
import { Input } from './input'
// import { MathUtils } from 'three'
// const createGeometry from 'three-bmfont-text')
// const loadFont from 'load-bmfont')

// This does nothing because I'm not using the event-based shit
/* window.joypad.set({
  axisMovementThreshold: 0.2
})

window.joypad.on('connect', e => {
  const gamepad = e

  const options = {
    startDelay: 500,
    duration: 1000,
    weakMagnitude: 1,
    strongMagnitude: 1
  }

  window.joypad.vibrate(gamepad, options)
}) */

function View () {
  this.camera = new THREE.PerspectiveCamera(70, 4 / 3, 0.01, 64)

  this.install = () => {
    this.camera.position.z = 4
  }

  this.start = () => {}
}

let progressBarMask

function UI () {
  this.renderer = null
  this.stage = null
  this.activeText = []
  this.loader = null

  // const charCounter = 0
  // const charIndex = 0
  // const textArray = 'Hello? Why am I upside down?'

  this.install = () => {
    PIXI.utils.skipHello()
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST
    PIXI.settings.RESOLUTION = 1
    this.renderer = new PIXI.Renderer({ width: 320, height: 240, antialias: false, backgroundAlpha: 0 })
    this.stage = new PIXI.Container()
    document.body.appendChild(this.renderer.view)
    this.loader = PIXI.Loader.shared
  }

  this.start = () => {
    const progressBar = new PIXI.Sprite(this.loader.resources.progress_bar_empty.texture)
    progressBar.position.x = 129 * 2
    progressBar.position.y = 8 * 2
    progressBar.height *= 2
    progressBar.width *= 2
    const simpleShader = new PIXI.Filter('', SHADER.PSXFragUI)
    progressBar.filters = [simpleShader]
    this.stage.addChild(progressBar)
    const progressBarFull = new PIXI.Sprite(this.loader.resources.progress_bar_full.texture)
    progressBarFull.position.x = 129 * 2
    progressBarFull.position.y = 8 * 2
    progressBarFull.height *= 2
    progressBarFull.width *= 2
    progressBarFull.filters = [simpleShader]
    progressBarMask = new PIXI.Graphics()
    progressBarMask.beginFill(0xFFFFFF)
    progressBarMask.drawRect(0, 0, 320, 240)
    progressBarMask.endFill()
    progressBarFull.mask = progressBarMask
    this.stage.addChild(progressBarFull)
  }

  this.render = () => {
    this.renderer.render(this.stage)
  }

  // Needs to return a handle or something
  this.addText = (x, y, text, color = 0xffffff, anchorX = 0, anchorY = 0) => {
    const newText = new PIXI.BitmapText(text, {
      fontName: 'kakwa',
      fontSize: 12,
      align: 'left',
      tint: color
    })
    newText.anchor.set(anchorX, anchorY)
    newText.position.x = x
    newText.position.y = y
    this.activeText.push(newText)
    this.stage.addChild(newText)
    return newText
  }

  this.ensureResources = (callback) => {
    this.loader
      .add('kakwa', 'assets/kakwa.fnt')
      .add('progress_bar_empty', 'assets/progress_bar_unlit.png')
      .add('progress_bar_full', 'assets/progress_bar_lit.png')
      .add('progress_bar_arrow', 'assets/progress_bar_arrow.png')
      .load(() => {
        callback()
      })
  }
}

const triangleList = []

function Board () {
  this.objects = []

  this.install = () => {}

  this.start = () => {
    // const timeText = game.ui.addText(320 / 2 + 1, 240 / 2 + 1, '')
    // const timerEntity = new Entity(game.scene)
    // timerEntity.addComponent(TimerComponent, timeText)
    // this.objects.push(timerEntity)
    // this.addSphere(0, 0, 0, 0.5)
    game.scene.add(new THREE.AxesHelper(2))
    const fallGameEntity = new Entity(game.scene)
    fallGameEntity.addComponent(FallGameComponent)
    this.objects.push(fallGameEntity)
    this.addSphere(0, 0, 0, 3)
    // this.addSphere(0, 1, 0, 2)
  }

  this.addSphere = (x = 0, y = 0, z = 0, radius = 1) => {
    const geometry = new THREE.IcosahedronGeometry(radius, 1) // (1, 1, 1)
    const vertices = geometry.getAttribute('position').array
    const newVertices = []
    let scale
    for (let i = 0; i < vertices.length; i += 3) {
      // const triangle = new THREE.Triangle(geometry.parameters.vertices[i], geometry.parameters.vertices[i + 1], geometry.parameters.vertices[i + 2])
      // let baryCenter = new THREE.Vector3()
      // triangle.getBarycoord(new THREE.Vector3(1/3, 1/3, 1/3), baryCenter)

      if (i % 9 === 0) {
        const random = Math.random()
        // console.log(`${random}, ${random < 0.8}`)
        if (random > 0.2) {
        // Skip
          i += 6
          continue
        }

        scale = (Math.random() * 8.0) // 3.0 this is the big scale for random push out
      }

      const currentVertex = new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2])
      const direction = new THREE.Vector3(0, 0, 0).sub(currentVertex)
      direction.normalize()
      // currentVertex.add(direction.multiplyScalar(Math.random() * 2))

      vertices[i] -= direction.x * scale
      vertices[i + 1] -= direction.y * scale
      vertices[i + 2] -= direction.z * scale

      // if (isNaN(vertices[i])) {
      // continue
      // }

      newVertices.push(vertices[i])
      newVertices.push(vertices[i + 1])
      newVertices.push(vertices[i + 2])

      // geometry.parameters.vertices[i]
    }
    const finalVertices = new Float32Array(newVertices.length)
    const finalUV = new Float32Array((newVertices.length / 3) * 2)
    newVertices.forEach((element, index) => {
      finalVertices[index] = element

      if (index % 9 === 0) {
        triangleList.push(new THREE.Triangle(
          new THREE.Vector3(newVertices[index], newVertices[index + 1], newVertices[index + 2]),
          new THREE.Vector3(newVertices[index + 3], newVertices[index + 4], newVertices[index + 5]),
          new THREE.Vector3(newVertices[index + 6], newVertices[index + 7], newVertices[index + 8])
        ))
      }
    })
    for (let i = 0; i < finalUV.length; i += 6) {
      finalUV[i] = 0.5 / 2 // X1
      finalUV[i + 1] = 0.0 + 0.5 // Y1

      finalUV[i + 2] = 0.0 // X2
      finalUV[i + 3] = 1.0 / 2 + 0.5 // Y2

      finalUV[i + 4] = 1.0 / 2 // X3
      finalUV[i + 5] = 1.0 / 2 + 0.5 // Y3
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(finalVertices, 3))
    geometry.setAttribute('uv', new THREE.BufferAttribute(finalUV, 2))
    // const colorArray = new Float32Array(3 * (4 * 6))
    // for (let i = 0; i < 3 * (4 * 6); i += 3) {
    //   colorArray[i] = 0.0
    //   colorArray[i + 1] = 1.0 * ((i / 3) / (4 * 6))
    //   colorArray[i + 2] = 1.0// 0.6 * ((i / 3) / (4 * 6))
    // }
    // geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3))

    // const texture = new THREE.TextureLoader().load('assets/panels.png');
    // texture.minFilter = THREE.NearestFilter
    // texture.magFilter = THREE.NearestFilter

    const material = new THREE.RawShaderMaterial({
      uniforms: {
        // map: { value: new THREE.TextureLoader().load('textures/sprites/circle.png') },
        map: {
          value:
            new THREE.TextureLoader().load('assets/panelssmall.png', (texture) => {
              texture.magFilter = THREE.NearestFilter
              texture.minFilter = THREE.NearestFilter
              return texture
            })
        },
        tintColor: { value: new THREE.Vector3(1.0, 1.0, 1.0) }
      },
      vertexShader: SHADER.PSXVert,
      fragmentShader: SHADER.PSXFrag,
      depthTest: true,
      depthWrite: true,
      side: THREE.DoubleSide
    })
    const sphere = new THREE.Mesh(geometry, material)
    sphere.position.set(x, y, z)
    const entity = new Entity(game.scene)
    // entity.addComponent(RotateComponent, 0.2)
    entity.addComponent(MeshComponent, sphere)
    // entity.addComponent(MoveComponent, 2)
    this.objects.push(entity)
  }

  /* this.addCube = (x = 0, y = 0, z = 0) => {
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const colorArray = new Float32Array(3 * (4 * 6))
    for (let i = 0; i < 3 * (4 * 6); i += 3) {
      colorArray[i] = 0.0
      colorArray[i + 1] = 1.0 * ((i / 3) / (4 * 6))
      colorArray[i + 2] = 1.0// 0.6 * ((i / 3) / (4 * 6))
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3))
    const material = new THREE.RawShaderMaterial({
      uniforms: {
        // map: { value: new THREE.TextureLoader().load('textures/sprites/circle.png') },
        tintColor: { value: new THREE.Vector3(1.0, 1.0, 1.0) }
      },
      vertexShader: SHADER.PSXVert,
      fragmentShader: SHADER.PSXFrag,
      depthTest: false,
      depthWrite: true
    })
    const cube = new THREE.Mesh(geometry, material)
    cube.position.set(x, y, z)
    const entity = new Entity(game.scene)
    entity.addComponent(RotateComponent, 2)
    entity.addComponent(MeshComponent, cube)
    entity.addComponent(MoveComponent, 2)
    game.board.objects.push(entity)
  }

  this.addLevel = () => {
    new THREE.OBJLoader().load('assets/field.obj', (object) => {
      new THREE.TextureLoader().load('assets/field.png', (texture) => {
        const entity = new Entity(game.scene)
        texture.magFilter = THREE.NearestFilter
        texture.minFilter = THREE.NearestFilter
        object.children[0].material = new THREE.RawShaderMaterial({
          uniforms: {
            map: { value: texture },
            tintColor: { value: new THREE.Vector3(1.0, 1.0, 1.0) }
          },
          vertexShader: SHADER.PSXVert,
          fragmentShader: SHADER.PSXFrag,
          depthTest: true,
          depthWrite: true
        })
        entity.addComponent(MeshComponent, object.children[0])
        entity.addComponent(MoveComponent, 2)
        game.board.objects.push(entity)
      })
    })
  } */
}

Entity.ids = 0

function Entity (parent) {
  this.id = Entity.ids++
  this.components = []
  this.transform = new THREE.Object3D()
  parent.add(this.transform)

  this.addComponent = (ComponentType, ...args) => {
    const component = new ComponentType(this, ...args)
    this.components.push(component)
    return component
  }
  this.update = (delta) => {
    for (const component of this.components) {
      component.update(delta)
    }
  }
}

function MoveComponent (entity, speed = 1) {
  this.entity = entity
  this.speed = speed
  this.direction = new THREE.Vector2()

  this.update = (delta) => {
    this.direction.set((game.input.getButton('left') ? -1 : 0) + (game.input.getButton('right') ? 1 : 0), (game.input.getButton('forward') ? -1 : 0) + (game.input.getButton('back') ? 1 : 0))
    this.direction.normalize()
    entity.transform.position.z += this.speed * delta * this.direction.y
    entity.transform.position.x += this.speed * delta * this.direction.x

    if (game.input.getButtonDown('select')) {
      entity.transform.position.y += 1
    } else if (game.input.getButtonDown('cancel')) {
      entity.transform.position.y -= 1
    }
  }
}

function RotateComponent (entity, speed = 1) {
  this.entity = entity
  this.speed = speed

  this.update = (delta) => {
    entity.transform.rotation.x += this.speed * delta
    entity.transform.rotation.y += this.speed / 2 * delta
    entity.transform.rotation.z += this.speed * 1 * delta
  }
}

function TimerComponent (entity, text) {
  this.entity = entity
  this.time = 0

  this.update = (delta) => {
    this.time += delta
    text.text = this.time
  }
}

function MeshComponent (entity, mesh) {
  this.entity = entity
  entity.transform.add(mesh)

  this.update = (delta) => {}
}

const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

function IsIntersecting (p, r, t) {
// A = A - P
// B = B - P
// C = C - P
// rr = r * r
// V = cross(B - A, C - A)
// d = dot(A, V)
// e = dot(V, V)
// sep1 = d * d > rr * e
// aa = dot(A, A)
// ab = dot(A, B)
// ac = dot(A, C)
// bb = dot(B, B)
// bc = dot(B, C)
// cc = dot(C, C)
// sep2 = (aa > rr) & (ab > aa) & (ac > aa)
// sep3 = (bb > rr) & (ab > bb) & (bc > bb)
// sep4 = (cc > rr) & (ac > cc) & (bc > cc)
// AB = B - A
// BC = C - B
// CA = A - C
// d1 = ab - aa
// d2 = bc - bb
// d3 = ac - cc
// e1 = dot(AB, AB)
// e2 = dot(BC, BC)
// e3 = dot(CA, CA)
// Q1 = A * e1 - d1 * AB
// Q2 = B * e2 - d2 * BC
// Q3 = C * e3 - d3 * CA
// QC = C * e1 - Q1
// QA = A * e2 - Q2
// QB = B * e3 - Q3
// sep5 = [dot(Q1, Q1) > rr * e1 * e1] & [dot(Q1, QC) > 0]
// sep6 = [dot(Q2, Q2) > rr * e2 * e2] & [dot(Q2, QA) > 0]
// sep7 = [dot(Q3, Q3) > rr * e3 * e3] & [dot(Q3, QB) > 0]
// separated = sep1 | sep2 | sep3 | sep4 | sep5 | sep6 | sep7
  const a = t.a.sub(p)
  const b = t.b.sub(p)
  const c = t.c.sub(p)
  const rr = r * r
  const v = b.clone().sub(a).cross(c.sub(a))
  const d = a.dot(v)
  const e = v.dot(v)
  // let sep1a = d.multiply(d)
  // let sep1b = e.multiply(rr)
  // let sep1 = sep1a.x > sep1b.x && sep1a.y > sep1b.y && sep1a.z > sep1b.z
  const sep1 = d * d > rr * e
  const aa = a.dot(a)
  const ab = a.dot(b)
  const ac = a.dot(c)
  const bb = b.dot(b)
  const bc = b.dot(c)
  const cc = c.dot(c)
  const sep2 = (aa > rr) && (ab > aa) && (ac > aa)
  const sep3 = (bb > rr) && (ab > bb) && (bc > bb)
  const sep4 = (cc > rr) && (ac > cc) && (bc > cc)
  const ab2 = b.sub(a)
  const bc2 = c.sub(b)
  const ca2 = a.sub(c)
  const d1 = ab - aa
  const d2 = bc - bb
  const d3 = ac - cc
  const e1 = ab2.dot(ab2)
  const e2 = bc2.dot(bc2)
  const e3 = ca2.dot(ca2)
  const q1 = a.multiplyScalar(e1).sub(ab2.multiplyScalar(d1))
  const q2 = b.multiplyScalar(e2).sub(bc2.multiplyScalar(d2))
  const q3 = a.multiplyScalar(e3).sub(ca2.multiplyScalar(d3))
  const qc = c.multiplyScalar(e1).sub(q1)
  const qa = a.multiplyScalar(e2).sub(q2)
  const qb = b.multiplyScalar(e3).sub(q3)
  const sep5 = q1.dot(q1) > rr * e1 * e1 & q1.dot(qc) > 0
  const sep6 = q2.dot(q2) > rr * e2 * e2 & q2.dot(qa) > 0
  const sep7 = q3.dot(q3) > rr * e3 * e3 & q3.dot(qb) > 0
  return sep1 && sep2 && sep3 && sep4 && sep5 && sep6 && sep7
}

function IntersectTriangle (ROrigin, RDir, A, B, C, len) {
  const E1 = new THREE.Vector3().subVectors(B, A)
  const E2 = new THREE.Vector3().subVectors(C, A)
  const N = new THREE.Vector3().crossVectors(E1, E2)
  const det = -RDir.dot(N)
  const invdet = 1.0 / det
  const AO = new THREE.Vector3().subVectors(ROrigin, A)
  const DAO = new THREE.Vector3().crossVectors(AO, RDir)
  const u = E2.dot(DAO) * invdet
  const v = -E1.dot(DAO) * invdet
  const t = AO.dot(N) * invdet
  if (det >= 0.000001 && t >= 0.0 && t <= len && u >= 0.0 && v >= 0.0 && (u + v) <= 1.0) {
    console.log(`${t} ${len}`)
  }
  return (det >= 0.000001 && t >= 0.0 && t <= len && u >= 0.0 && v >= 0.0 && (u + v) <= 1.0)
}

function FallGameComponent (entity) {
  this.entity = entity
  // entity.transform.add(mesh)
  this.rotation = new THREE.Quaternion()
  this.rotationApplied = new THREE.Quaternion()
  this.rotateSpeed = 90.0 // Degrees
  this.distanceFromCenter = 30.0
  this.maxDistanceFromCenter = 30.0
  this.velocity = 0.0
  this.timeToKill = 4.0
  this.killTimer = 0.0
  this.acceleration = -24.0
  this.bounceVelocity = 24.0
  this.terminalVelocityDown = -55.0
  this.terminalVelocityUp = 55.0
  this.lastPosition = new THREE.Vector3()
  // this.cameraForward = new THREE.Vector3()
  // this.axis = new THREE.AxesHelper(3)
  // game.scene.add(this.axis)

  this.update = (delta) => {
    if (this.killTimer < this.timeToKill) {
      this.killTimer += delta
    }

    this.velocity = clamp(this.velocity, this.terminalVelocityDown, this.terminalVelocityUp)
    this.distanceFromCenter += this.velocity * delta + 0.5 * this.acceleration * delta * delta
    if (this.distanceFromCenter < 0.0) {
      this.distanceFromCenter = 0.0
    }
    this.velocity += this.acceleration * delta

    // TODO: Normalize here
    this.rotation.multiply(new THREE.Quaternion().setFromEuler(
      new THREE.Euler(
        ((((game.input.getButton('forward') ? -1.0 : 0.0) + (game.input.getButton('back') ? 1.0 : 0.0)) * this.rotateSpeed) * (Math.PI / 180.0)) * delta,
        ((((game.input.getButton('left') ? -1.0 : 0.0) + (game.input.getButton('right') ? 1.0 : 0.0)) * this.rotateSpeed) * (Math.PI / 180.0)) * delta,
        0
      )))

    /* const rotObjectMatrix = new THREE.Matrix4()
    rotObjectMatrix.makeRotationFromQuaternion(
      new THREE.Quaternion().setFromEuler(
        new THREE.Euler(
          ((game.input.getButton('forward') ? 1.0 : 0.0) + (game.input.getButton('back') ? -1.0 : 0.0)) * this.rotateSpeed * delta / 360.0,
          ((game.input.getButton('left') ? 1.0 : 0.0) + (game.input.getButton('right') ? -1.0 : 0.0)) * this.rotateSpeed * delta / 360.0,
          0.0
        ))
    )
    this.rotationApplied.setFromRotationMatrix(rotObjectMatrix) */

    // this.axis.rotation.setFromQuaternion(this.rotation)

    game.view.camera.rotation.setFromQuaternion(this.rotation)
    // game.view.camera.getWorldDirection(this.cameraForward)
    this.lastPosition.copy(game.view.camera.position)
    game.view.camera.position.set(0, 0, 0)
    game.view.camera.translateZ(this.distanceFromCenter)
    // console.log(new THREE.Vector3().subVectors(this.lastPosition, game.view.camera.position).normalize())

    // Check collisions
    if (this.velocity < 0.0) {
      for (let i = 0; i < triangleList.length; i++) {
        if (IntersectTriangle(this.lastPosition, new THREE.Vector3().subVectors(game.view.camera.position, this.lastPosition).normalize(), triangleList[i].a, triangleList[i].b, triangleList[i].c, new THREE.Vector3().subVectors(this.lastPosition, game.view.camera.position).length() * 2)) {
          this.velocity = this.bounceVelocity
          break
        }
      }
    }
    /* if (this.velocity < 0) {
      for (let i = 0; i < triangleList.length; i++) {
        if (IsIntersecting(game.view.camera.position, 0.2, triangleList[i])) {
          this.velocity = this.bounceVelocity
          break
        }
      }
    } */
    // game.view.camera.position.set(this.cameraForward * this.maxDistanceFromCenter)

    // game.view.camera.position.set(new THREE.Vector3().lerpVectors(new THREE.Vector3(0, 0, 0), -this.cameraForward * this.maxDistanceFromCenter, this.distanceFromCenter / this.maxDistanceFromCenter))
    // Camera.main.transform.rotation = rotation;
    // Camera.main.transform.position = Vector3.LerpUnclamped(Vector3.zero, -Camera.main.transform.forward * maxDistanceFromCenter, distanceFromCenter / maxDistanceFromCenter);

    /* if (Physics.Raycast(Camera.main.transform.position, Camera.main.transform.forward, out RaycastHit hit, 0.2f, LayerMask.GetMask("Bounce"))) {
velocity = bounceVelocity;
hit.collider.gameObject.SetActive(false);

if (hit.collider.gameObject.GetComponent<MeshRenderer>().sharedMaterial == bounceCage.GetComponent<BounceCage>().goodMaterial) {
timer += 0.5f;
}
else if (hit.collider.gameObject.GetComponent<MeshRenderer>().sharedMaterial == bounceCage.GetComponent<BounceCage>().hurtMaterial) {
timer -= 1f;
}
} */

    // We've arrived and the timer has finished
    if (this.distanceFromCenter <= 0.0) {
      this.velocity = this.bounceVelocity
      if (this.killTimer >= this.timeToKill) {
        console.log('Congratulations, you killed the ogre!')
        // enabled = false;
      } else {
        console.error('Oh no, you died! Try again!')
        // enabled = false;
      }
    }
  }
}

function Game () {
  this.renderer = null
  this.ui = new UI()
  this.view = new View()
  this.board = new Board()
  this.input = new Input()
  this.clock = new THREE.Clock()
  this.scene = new THREE.Scene()
  this.state = State.INSTALL

  this.install = () => {
    this.renderer = new THREE.WebGL1Renderer({ antialias: false, stencil: false, depth: true })
    this.renderer.setPixelRatio(1)
    this.renderer.setSize(320, 240, false)
    this.renderer.setClearColor(new THREE.Color('black'))
    document.body.appendChild(this.renderer.domElement)
    this.ui.install()
    this.view.install()
    this.board.install()
    this.input.install()
    this.fitViewport()
    window.addEventListener('resize', this.fitViewport, false)
  }

  this.start = () => {
    this.state = State.START
    // TODO: Do one render here of loading text
    this.ensureResources(() => {
      this.ui.start()
      this.view.start()
      this.board.start()
      // this.ui.addText(320 / 2 + 1, 240 / 2 + 1, 'Hello!', 0x000000)
      // this.ui.addText(320 / 2, 240 / 2, 'Hello!')
      // this.board.addSphere(0.0, 0.0, 0.0, 0.5)
      this.renderer.setAnimationLoop(this.update)
    })
  }

  this.update = () => {
    this.state = State.UPDATE
    const delta = this.clock.getDelta()
    // const elapsedTime = clock.getElapsedTime()

    /* charCounter += delta / 0.03

    if (Math.min(charCounter, 1) === 1 && text !== undefined && charIndex < textArray.length) {
      text.text += textArray[charIndex]
      textShadow.text += textArray[charIndex]
      if (textArray[charIndex] === '?' || textArray[charIndex] === '.') {
        charCounter = -12
      } else {
        charCounter = 0
      }
      charIndex++
    } */

    // Input
    this.input.update()

    // Game logic
    for (let i = 0; i < this.board.objects.length; i++) {
      this.board.objects[i].update(delta)
    }

    // Render
    this.renderer.render(this.scene, this.view.camera)
    this.ui.render()
  }

  this.ensureResources = (callback) => {
    this.ui.ensureResources(() => {
      callback()
    })
  }

  this.fitViewport = () => {
    const viewWidth = Math.min(Math.floor(window.innerWidth / 320), Math.floor(window.innerHeight / 240)) * 320
    const viewHeight = Math.min(Math.floor(window.innerWidth / 320), Math.floor(window.innerHeight / 240)) * 240
    this.renderer.domElement.style.maxWidth = viewWidth + 'px'
    this.renderer.domElement.style.maxHeight = viewHeight + 'px'
    this.ui.renderer.view.style.maxWidth = viewWidth + 'px'
    this.ui.renderer.view.style.maxHeight = viewHeight + 'px'
  }
}

const State = {
  INSTALL: 'install',
  START: 'start',
  UPDATE: 'update'
}

const game = new Game()
game.install()
window.addEventListener('load', () => {
  game.start()
})
