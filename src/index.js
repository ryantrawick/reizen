import * as THREE from './three'
import * as PIXI from './pixi'
import 'joypad.js'
import * as PF from 'pathfinding'
import * as SHADER from './shaders'
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
  this.camera = new THREE.PerspectiveCamera(70, 4 / 3, 0.01, 128)

  this.install = () => {
    this.camera.position.z = 4
  }

  this.start = () => {}
}

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
    PIXI.settings.RESOLUTION = window.devicePixelRatio
    this.renderer = new PIXI.Renderer({ width: 320, height: 240, antialias: false, backgroundAlpha: 0 })
    this.stage = new PIXI.Container()
    document.body.appendChild(this.renderer.view)
    this.loader = PIXI.Loader.shared
  }

  this.start = () => {}

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
  }

  this.ensureResources = (callback) => {
    this.loader.add('kakwa', 'assets/kakwa.fnt').load(() => {
      callback()
    })
  }
}

function Board () {
  this.objects = []

  this.install = () => {}

  this.start = () => {}

  this.addCube = (x = 0, y = 0, z = 0) => {
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
    this.objects.push(entity)
  }
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
    this.direction.set((game.input.states.left.held ? -1 : 0) + (game.input.states.right.held ? 1 : 0), (game.input.states.forward.held ? -1 : 0) + (game.input.states.back.held ? 1 : 0))
    this.direction.normalize()
    entity.transform.position.z += this.speed * delta * this.direction.y
    entity.transform.position.x += this.speed * delta * this.direction.x
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

function MeshComponent (entity, mesh) {
  this.entity = entity
  entity.transform.add(mesh)

  this.update = (delta) => {}
}

function Input () {
  this.states = {}
  this.actions = {
    forward: { type: 'button' },
    back: { type: 'button' },
    left: { type: 'button' },
    right: { type: 'button' },
    select: { type: 'button' },
    cancel: { type: 'button' }
  }

  this.install = () => {
    window.joypad.on('connect', e => {
      const gamepad = e
      const options = {
        startDelay: 500,
        duration: 1000,
        weakMagnitude: 1,
        strongMagnitude: 1
      }
      window.joypad.vibrate(gamepad, options)
    })
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
  }

  this.keyboardStates = {}
  this.keyboardActionMapping = {
    forward: ['w', 'ArrowUp'],
    back: ['s', 'ArrowDown'],
    left: ['a', 'ArrowLeft'],
    right: ['d', 'ArrowRight']
  }
  this.onKeyDown = (event) => {
    if (!this.keyboardStates[event.key]) {
      this.keyboardStates[event.key] = { down: false, held: false, up: false, checked: false }
    }
  }
  this.onKeyUp = (event) => {
    if (this.keyboardStates[event.key]) {
      this.keyboardStates[event.key].up = true
    }
  }

  this.gamepadStates = {}
  this.gamepadActionMapping = {
    forward: [12, { direction: 'negative', axis: 1 }, { direction: 'negative', axis: 3 }],
    back: [13, { direction: 'positive', axis: 1 }, { direction: 'positive', axis: 3 }],
    left: [14, { direction: 'negative', axis: 0 }, { direction: 'negative', axis: 2 }],
    right: [15, { direction: 'positive', axis: 0 }, { direction: 'positive', axis: 2 }]
  }
  this.onButtonDown = (name) => {
    if (!this.gamepadStates[name]) {
      this.gamepadStates[name] = { down: false, held: false, up: false, checked: false }
    }
  }
  this.onButtonUp = (name) => {
    if (this.gamepadStates[name]) {
      this.gamepadStates[name].up = true
    }
  }

  this.update = () => {
    // console.log(window.joypad.instances[Object.keys(window.joypad.instances)[0]].buttons[15])
    Object.keys(this.gamepadStates).forEach(button => {
      if (!this.gamepadStates[button].checked) {
        this.gamepadStates[button].down = true
        this.gamepadStates[button].held = true
        this.gamepadStates[button].checked = true
      } else {
        this.gamepadStates[button].down = false
      }

      if (!this.gamepadStates[button].held) {
        delete this.gamepadStates[button]
        return
      }

      if (this.gamepadStates[button].up) {
        this.gamepadStates[button].held = false
      }
    })

    Object.keys(this.gamepadActionMapping).forEach(action => {
      for (let i = 0; i < this.gamepadActionMapping[action].length; i++) {
        const button = this.gamepadActionMapping[action][i]

        if (typeof button === 'object') {
          const axisValue = window.joypad.instances[Object.keys(window.joypad.instances)[0]].axes[button.axis]

          if (button.direction === 'positive' && axisValue > 0.2) {
            this.onButtonDown(button.axis)
          } else if (button.direction === 'negative' && axisValue < -0.2) {
            this.onButtonDown(button.axis)
          } else {
            this.onButtonUp(button.axis)
          }
        } else {
          if (window.joypad.instances[Object.keys(window.joypad.instances)[0]].buttons[button].pressed) {
            this.onButtonDown(button)
          } else {
            this.onButtonUp(button)
          }
        }
      }

      if (!this.actions[action]) {
        console.error('InputState is missing the ' + action + ' action')
      }

      let pollDown = 0
      let pollHeld = 0
      let pollUp = 0

      for (let i = 0; i < this.gamepadActionMapping[action].length; i++) {
        let button = this.gamepadActionMapping[action][i]
        if (typeof button === 'object') {
          button = button.axis
        }

        if (!this.gamepadStates[button]) {
          continue
        }

        pollDown += this.gamepadStates[button].down ? 1 : 0
        pollHeld += this.gamepadStates[button].held ? 1 : 0
        pollUp += this.gamepadStates[button].up ? 1 : 0
      }

      if (!this.states[action]) {
        this.states[action] = { down: false, held: false, up: false }
      }

      this.states[action].down = pollDown > 0
      this.states[action].held = pollHeld > 0
      this.states[action].up = pollUp > 0
    })

    Object.keys(this.keyboardStates).forEach(key => {
      if (!this.keyboardStates[key].checked) {
        this.keyboardStates[key].down = true
        this.keyboardStates[key].held = true
        this.keyboardStates[key].checked = true
      } else {
        this.keyboardStates[key].down = false
      }

      if (!this.keyboardStates[key].held) {
        delete this.keyboardStates[key]
        return
      }

      if (this.keyboardStates[key].up) {
        this.keyboardStates[key].held = false
      }
    })

    Object.keys(this.keyboardActionMapping).forEach(action => {
      if (!this.actions[action]) {
        console.error('InputState is missing the ' + action + ' action')
      }

      let pollDown = 0
      let pollHeld = 0
      let pollUp = 0

      for (let i = 0; i < this.keyboardActionMapping[action].length; i++) {
        const key = this.keyboardActionMapping[action][i]

        if (!this.keyboardStates[key]) {
          continue
        }

        pollDown += this.keyboardStates[key].down ? 1 : 0
        pollHeld += this.keyboardStates[key].held ? 1 : 0
        pollUp += this.keyboardStates[key].up ? 1 : 0
      }

      if (!this.states[action]) {
        this.states[action] = { down: false, held: false, up: false }
      }

      // this.states[action].down = pollDown > 0
      // this.states[action].held = pollHeld > 0
      // this.states[action].up = pollUp > 0
    })
  }

  /* this.getAxis = (name) => {
const value = 0.0
let controllerValue = 0.0
if (name === Controls.HORIZONTAL) {
value =

      let stickValue = 0.0
      let padValue = 0.0
      if (window.joypad.instances !== undefined && Object.keys(window.joypad.instances).length > 0) {
        if (Math.abs(window.joypad.instances[Object.keys(window.joypad.instances)[0]].axes[3]) > 0.3) {
          stickValue = window.joypad.instances[Object.keys(window.joypad.instances)[0]].axes[3]
        }
        padValue = window.joypad.instances[Object.keys(window.joypad.instances)[0]].button_13
        controllerValue = Math.max(stickValue, padValue)
      }
    } else if (name === Controls.VERTICAL) {

    }
    return Math.max(value, controllerValue)
  } */
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
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(320, 240, false)
    this.renderer.setClearColor(new THREE.Color('black'))
    document.body.appendChild(this.renderer.domElement)
    this.ui.install()
    this.view.install()
    this.board.install()
    this.input.install()
    this.fitViewport()
    window.addEventListener('resize', this.fitViewport, false)
    window.addEventListener('contextmenu', (event) => {
      event.stopPropagation()
      event.preventDefault()
      return false
    })
  }

  this.start = () => {
    this.state = State.START
    // TODO: Do one render here of loading text
    this.ensureResources(() => {
      this.ui.start()
      this.view.start()
      this.board.start()
      this.ui.addText(320 / 2 + 1, 240 / 2 + 1, 'Hello!', 0x000000)
      this.ui.addText(320 / 2, 240 / 2, 'Hello!')
      this.board.addCube()
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

    // Update
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
