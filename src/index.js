import * as THREE from './three'
import * as PIXI from './pixi'
import 'joypad.js'
import * as PF from 'pathfinding'
import * as SHADER from './shaders'
// import { MathUtils } from 'three'
// const createGeometry from 'three-bmfont-text')
// const loadFont from 'load-bmfont')

window.addEventListener('contextmenu', (e) => {
  e.preventDefault()
})

// This does nothing because I'm not using the event-based shit
window.joypad.set({
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
})

/* loader.add('Rodin', 'assets/Rodin.fnt').load(() => {
  // Once font has been loaded, call a function that uses it
  // createText()
  const text = new PIXI.BitmapText('Hello Bitmap Font', {
    font: 'FOT-RodinNTLG Pro B',
    align: 'left'
  })
  text.anchor.set(0.5)
  text.position.x = 320 / 2
  text.position.y = 240 / 2
  stage.addChild(text)
}) */

const renderer = new THREE.WebGL1Renderer({ antialias: false, stencil: false, depth: true })
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(320, 240, false)
renderer.setClearColor(new THREE.Color('cornflowerblue'))
document.body.appendChild(renderer.domElement)

// window.addEventListener('resize', () => {
// camera.aspect = window.innerWidth / window.innerHeight
// camera.updateProjectionMatrix()
// renderer.setSize(window.innerWidth, window.innerHeight, false)
// UIRenderer.resolution = window.devicePixelRatio
// }, false)

/* PIXI.BitmapFont.install('assets/Rodin.fnt', 'assets/Rodin.png')
PIXI.BitmapFont.from('Rodin', {
  fontFamily: 'Rodin',
  fontSize: 13
})

const title = new PIXI.BitmapText('This is the title', { fontName: 'Rodin' }) */

PIXI.utils.skipHello()
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST
PIXI.settings.RESOLUTION = window.devicePixelRatio
const UIRenderer = new PIXI.Renderer({ width: 320, height: 240, antialias: false, backgroundAlpha: 0 })
const stage = new PIXI.Container()
document.body.appendChild(UIRenderer.view)

function fitViewport () {
  const viewWidth = Math.min(Math.floor(window.innerWidth / 320), Math.floor(window.innerHeight / 240)) * 320
  const viewHeight = Math.min(Math.floor(window.innerWidth / 320), Math.floor(window.innerHeight / 240)) * 240
  renderer.domElement.style.maxWidth = viewWidth + 'px'
  renderer.domElement.style.maxHeight = viewHeight + 'px'
  UIRenderer.view.style.maxWidth = viewWidth + 'px'
  UIRenderer.view.style.maxHeight = viewHeight + 'px'
}

fitViewport()

window.addEventListener('resize', fitViewport, false)

/* loadFont('assets/Rodin.fnt', function (err, font) {
  if (err) { throw err }
  // create a geometry of packed bitmap glyphs,
  // word wrapped to 300px and right-aligned
  const geometry = createGeometry({
    width: 320,
    align: 'left',
    font: font
  })

  // change text and other options as desired
  // the options sepcified in constructor will
  // be used as defaults
  geometry.update('Lorem ipsum\nDolor sit amet.')

  // the resulting layout has metrics and bounds
  // console.log(geometry.layout.height)
  // console.log(geometry.layout.descender)

  // the texture atlas containing our glyphs
  const textureLoader = new THREE.TextureLoader()
  textureLoader.load('assets/Rodin.png', function (texture) {
    // we can use a simple ThreeJS material
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      color: 0xaaffff
    })

    // now do something with our mesh!
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
  })
}) */

const loader = PIXI.Loader.shared
let text
let textShadow

loader.add('kakwa', 'assets/kakwa.fnt').load(() => {
  textShadow = new PIXI.BitmapText('', {
    fontName: 'kakwa',
    fontSize: 12,
    align: 'left',
    tint: 0x000000
  })
  textShadow.anchor.set(0, 1)
  textShadow.position.x = 320 / 2 + 1
  textShadow.position.y = 240 / 2 + 1
  stage.addChild(textShadow)

  text = new PIXI.BitmapText('', {
    fontName: 'kakwa',
    fontSize: 12,
    align: 'left',
    tint: 0xffffff
  })
  text.anchor.set(0, 1)
  text.position.x = 320 / 2
  text.position.y = 240 / 2
  stage.addChild(text)
})

let charCounter = 0
let charIndex = 0
const textArray = 'Hello? Why am I upside down?'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(70, 4 / 3, 0.01, 1024)
camera.position.z = 4
const clock = new THREE.Clock()
const geometry = new THREE.BoxGeometry(1, 1, 1)
const colorArray = new Float32Array(3 * (4 * 6))
for (let i = 0; i < 3 * (4 * 6); i += 3) {
  colorArray[i] = 0.0
  colorArray[i + 1] = 1.0 * ((i / 3) / (4 * 6))
  colorArray[i + 2] = 1.0// 0.6 * ((i / 3) / (4 * 6))
}
geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3))
// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
/* const ditherTextureData = new Uint8Array([0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5, 0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5, 0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5])
for (let i = 0; i < ditherTextureData.length; i++) {
  ditherTextureData[i] = Math.floor(THREE.inverseLerp(0, 15, ditherTextureData[i]) * 255)
} */
const material = new THREE.RawShaderMaterial({
  uniforms: {
    // map: { value: new THREE.TextureLoader().load('textures/sprites/circle.png') },
    tintColor: { value: new THREE.Vector3(1.0, 1.0, 1.0) }
    // psxDitherTable: { value: new THREE.DataTexture(ditherTextureData, 4, 4, THREE.RedFormat) }
  },
  vertexShader: SHADER.PSXVert,
  fragmentShader: SHADER.PSXFrag,
  depthTest: false,
  depthWrite: true
})
const cube = new THREE.Mesh(geometry, material)
scene.add(cube)

function update () {
  // window.requestAnimationFrame(animate)

  // mesh.rotation.x += 1 * clock.getDelta()
  // mesh.rotation.y += 2 * clock.getDelta()
  // controls.update()
  const delta = clock.getDelta()
  const elapsedTime = clock.getElapsedTime()

  charCounter += delta / 0.03

  if (Math.min(charCounter, 1) === 1 && text !== undefined && charIndex < textArray.length) {
    text.text += textArray[charIndex]
    textShadow.text += textArray[charIndex]
    if (textArray[charIndex] === '?' || textArray[charIndex] === '.') {
      charCounter = -12
    } else {
      charCounter = 0
    }
    charIndex++
  }

  if (window.joypad.instances !== undefined && Object.keys(window.joypad.instances).length > 0) {
    if (Math.abs(window.joypad.instances[Object.keys(window.joypad.instances)[0]].axes[3]) > 0.3) {
      cube.position.z += window.joypad.instances[Object.keys(window.joypad.instances)[0]].axes[3] * delta
      console.log(window.joypad.instances[Object.keys(window.joypad.instances)[0]].axes[3])
    }
  }

  // -----const normalizedDirectionInput = rawDirectionInput.normalize()
  // Could refactor this to adjust variable and not playerMesh twice so that skipping with high speeds isn't possible
  // playerMesh.translateOnAxis(new THREE.Vector3(normalizedDirectionInput.x, 0, normalizedDirectionInput.y), 4 * clock.getDelta())
  // const terrainHeight = getTerrainHeight(playerMesh.position.x, playerMesh.position.z)
  // playerMesh.position.set(THREE.MathUtils.clamp(playerMesh.position.x, 0 + 0.1, 128 - 0.1), terrainHeight, THREE.MathUtils.clamp(playerMesh.position.z, 0 + 0.1, 128 - 0.1))

  // ----- const playerPosition = new THREE.Vector3().copy(playerMesh.position)
  // -----playerPosition.add(new THREE.Vector3(normalizedDirectionInput.x, 0, normalizedDirectionInput.y).multiplyScalar(3.5 * delta)) // CSGO: 6.875 Places: 3.5
  // playerPosition.clamp(new THREE.Vector3(0.1, 0, 0.1), new THREE.Vector3(mapSize - 0.1, mapMaxHeight, mapSize - 0.1))
  // playerPosition.y = getTerrainHeight(playerPosition.x, playerPosition.z)
  // ------playerMesh.position.copy(playerPosition)
  // -------camera.position.copy(playerPosition.addScaledVector(new THREE.Vector3(0, 1, 0), 2)) // CS:GO: 2.25

  // console.log(lookRotation)

  cube.rotation.x -= 3 * delta
  cube.rotation.y -= 1 * delta
  cube.rotation.z -= 2 * delta

  renderer.render(scene, camera)
  UIRenderer.render(stage)
}

renderer.setAnimationLoop(update)
