import * as THREE from './three'
import * as PIXI from './pixi'
import 'joypad.js'
// import * as PF from 'pathfinding'
import * as SHADER from './shaders'
import { Input } from './input'
// import { BufferGeometry } from 'three'
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
  this.listener = new THREE.AudioListener()
  this.camera.add(this.listener)

  this.install = () => {
    this.camera.position.z = 4
  }

  this.start = () => {}
}

const roundMod = (num, multiple) => Math.round(num / multiple) * multiple
const lerp = (v0, v1, t) => v0 * (1 - t) + v1 * t
const easeOutQuint = (x) => 1 - Math.pow(1 - x, 5)
let gameBegun = false

function UI () {
  this.renderer = null
  this.stage = null
  this.activeText = []
  this.loader = null
  this.progressBarMask = null
  this.progressBarLossMask = null
  this.progressArrow = null
  this.progressText = null
  this.progressTextShadow = null
  this.girlHeadIcon = null
  this.live1 = null
  // this.live1Background = null
  this.live2 = null
  // this.live2Background = null
  this.overheatText = null
  this.overheatTextShadow = null
  this.startStage = null
  this.live1Solid = null
  this.live2Solid = null
  this.scoreText = null
  this.scoreTextShadow = null
  this.retryStage = null
  this.finalScoreText = null
  this.finalScoreTextShadow = null
  this.overheatSprite = null
  this.enterSprite = null
  this.xMark = null
  this.checkMark = null

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
    this.startStage = new PIXI.Container()
    this.retryStage = new PIXI.Container()
  }

  this.start = () => {
    const progressBar = new PIXI.Sprite(this.loader.resources.progress_bar_empty.texture)
    progressBar.position.x = 279 // 129 * 2
    progressBar.position.y = 133 // 8 * 2
    const simpleShader = new PIXI.Filter('', SHADER.PSXFragUI)
    progressBar.filters = [simpleShader]
    this.stage.addChild(progressBar)

    const progressBarLoss = new PIXI.Sprite(this.loader.resources.progress_bar_loss.texture)
    progressBarLoss.position.x = 279 // 129 * 2
    progressBarLoss.position.y = 133 // 8 * 2
    progressBarLoss.filters = [simpleShader]
    this.stage.addChild(progressBarLoss)

    const progressBarFull = new PIXI.Sprite(this.loader.resources.progress_bar_full.texture)
    progressBarFull.position.x = 279 // 129 * 2
    progressBarFull.position.y = 133 // 8 * 2
    progressBarFull.filters = [simpleShader]
    this.stage.addChild(progressBarFull)

    this.progressBarMask = new PIXI.Graphics()
    progressBarFull.mask = this.progressBarMask

    this.progressBarLossMask = new PIXI.Graphics()
    progressBarLoss.mask = this.progressBarLossMask

    this.progressArrow = new PIXI.Sprite(this.loader.resources.progress_bar_arrow.texture)
    // this.progressArrow.height *= 2
    // this.progressArrow.width *= 2
    this.progressArrow.anchor.x = 1.0
    this.progressArrow.anchor.y = -(1 / 6) // 6 / 13
    this.progressArrow.filters = [simpleShader]
    this.stage.addChild(this.progressArrow)

    this.progressTextShadow = this.addText(262 + 1, 4 + 1, '', 0x000000, 1, 1)
    this.progressText = this.addText(262, 4, '', 0xffffff, 1, 1)

    const distanceMeter = new PIXI.Sprite(this.loader.resources.distance_meter.texture)
    distanceMeter.position.x = 311 // 129 * 2
    distanceMeter.position.y = 17 // 8 * 2
    distanceMeter.filters = [simpleShader]
    this.stage.addChild(distanceMeter)

    this.girlHeadIcon = new PIXI.Sprite(this.loader.resources.girl_head_icon.texture)
    this.girlHeadIcon.filters = [simpleShader]
    this.girlHeadIcon.anchor.x = 5 / 16
    this.girlHeadIcon.anchor.y = 0.5
    this.stage.addChild(this.girlHeadIcon)

    const live1Background = new PIXI.Sprite(this.loader.resources.life_unlit.texture)
    live1Background.position.x = 284 - 1
    live1Background.position.y = 123
    live1Background.filters = [simpleShader]
    this.stage.addChild(live1Background)

    this.live1 = new PIXI.Sprite(this.loader.resources.life_lit.texture)
    this.live1.filters = [simpleShader]
    this.live1.position.x = 284 - 1
    this.live1.position.y = 123
    this.stage.addChild(this.live1)

    this.live1Solid = new PIXI.Sprite(this.loader.resources.life_solid.texture)
    this.live1Solid.position.x = 284 - 1 + 4
    this.live1Solid.position.y = 123 + 4
    this.live1Solid.anchor.set(0.5)
    this.live1Solid.tint = 0xff0000
    this.live1Solid.filters = [simpleShader]
    this.stage.addChild(this.live1Solid)

    const live2Background = new PIXI.Sprite(this.loader.resources.life_unlit.texture)
    live2Background.position.x = 296 - 1
    live2Background.position.y = 123
    live2Background.filters = [simpleShader]
    this.stage.addChild(live2Background)

    this.live2 = new PIXI.Sprite(this.loader.resources.life_lit.texture)
    this.live2.filters = [simpleShader]
    this.live2.position.x = 296 - 1
    this.live2.position.y = 123
    this.stage.addChild(this.live2)

    this.live2Solid = new PIXI.Sprite(this.loader.resources.life_solid.texture)
    this.live2Solid.position.x = 296 - 1 + 4
    this.live2Solid.position.y = 123 + 4
    this.live2Solid.anchor.set(0.5)
    this.live2Solid.tint = 0xff0000
    this.live2Solid.filters = [simpleShader]
    this.stage.addChild(this.live2Solid)

    this.overheatTextShadow = this.addTextGemma(320 / 2 + 1, 6 + 1, '16.23', 0x000000, 0.5, 0.5)
    this.overheatText = this.addTextGemma(320 / 2, 6, '16.23', 0xffffff, 0.5, 0.5)

    const startButton = new PIXI.Sprite(this.loader.resources.start.texture)
    startButton.position.x = 320 / 2
    startButton.position.y = 240 / 2
    startButton.anchor.set(0.5)
    startButton.interactive = true
    startButton.buttonMode = true
    startButton.on('pointerdown', (event) => {
      gameBegun = true
      document.getElementById('music').play()
    })
    this.startStage.addChild(startButton)

    this.scoreTextShadow = this.addTextGemma(3 + 1, 3 + 1, 'Score: 0', 0x000000, 0.0, 0.0)
    this.scoreText = this.addTextGemma(3, 3, 'Score: 0', 0xffffff, 0.0, 0.0)

    const retrySprite = new PIXI.Sprite(this.loader.resources.retry.texture)
    retrySprite.position.x = 320 / 2
    retrySprite.position.y = 240 / 2 + 32
    retrySprite.anchor.set(0.5)
    this.live2Solid.filters = [simpleShader]
    this.retryStage.addChild(retrySprite)

    this.finalScoreTextShadow = this.addTextGemmaRetry(320 / 2 + 1, 240 / 2 + 78 + 1, 'Final Score: 8000', 0x000000, 0.5, 0.5)
    this.finalScoreText = this.addTextGemmaRetry(320 / 2, 240 / 2 + 78, 'Final Score: 8000', 0xffffff, 0.5, 0.5)

	this.overheatSprite = new PIXI.Sprite(this.loader.resources.overheat.texture)
	this.overheatSprite.position.x = 320 / 2
	this.overheatSprite.position.y = 12
	this.overheatSprite.anchor.x = 0.5
	this.overheatSprite.filters = [simpleShader]
	this.overheatSprite.visible = false
	this.stage.addChild(this.overheatSprite)

	this.enterSprite = new PIXI.Sprite(this.loader.resources.enter.texture)
	this.enterSprite.position.x = 320 / 2
	this.enterSprite.position.y = 240 / 2 + 64
	this.enterSprite.anchor.x = 0.5
	this.enterSprite.filters = [simpleShader]
	this.enterSprite.visible = false
	this.stage.addChild(this.enterSprite)

	this.xMark = new PIXI.Sprite(this.loader.resources.x.texture)
	this.xMark.position.x = 310
	this.xMark.position.y = 8
	this.xMark.filters = [simpleShader]
	this.stage.addChild(this.xMark)

	this.checkMark = new PIXI.Sprite(this.loader.resources.check.texture)
	this.checkMark.position.x = 311
	this.checkMark.position.y = 8
	this.checkMark.filters = [simpleShader]
	this.checkMark.visible = false
	this.stage.addChild(this.checkMark)
  }

  this.render = () => {
    if (gameBegun !== true) {
      this.renderer.render(this.startStage)
      return
    }

    if (dead) {
      this.finalScoreTextShadow.text = `Final Score: ${score}`
      this.finalScoreText.text = `Final Score: ${score}`
      this.renderer.render(this.retryStage)
      return
    }

    this.progressBarLossMask.clear()
    this.progressBarLossMask.beginFill()
    this.progressBarLossMask.drawRect(279, 133 + (107 * Math.abs(shieldPercentPrevious - 1)), 29, 107)
    this.progressBarLossMask.endFill()

    this.progressBarMask.clear()
    this.progressBarMask.beginFill()
    this.progressBarMask.drawRect(279, 133 + (107 * Math.abs(shieldPercent - 1)), 29, 107)
    this.progressBarMask.endFill()

    this.progressArrow.position.x = lerp(294, 277, shieldPercent)
    this.progressArrow.position.y = lerp(238, 133, shieldPercent)

    this.progressText.position.x = this.progressArrow.position.x
    this.progressText.position.y = this.progressArrow.position.y
    this.progressText.text = `${Math.round(shieldPercent * 100)}&`
    this.progressTextShadow.position.x = this.progressArrow.position.x + 1
    this.progressTextShadow.position.y = this.progressArrow.position.y + 1
    this.progressTextShadow.text = `${Math.round(shieldPercent * 100)}&`

    this.girlHeadIcon.position.x = 311
    this.girlHeadIcon.position.y = lerp(17, 233, clamp(Math.abs(percentFromMiddle), 0, 1))

    if (lives === 2) {
      this.live1.visible = true
      this.live1Solid.visible = false

      this.live2.visible = true
      this.live2Solid.visible = false
    } else if (lives === 1) {
      this.live1.visible = false
      this.live1Solid.visible = true
      this.live1Solid.scale.set(lerp(1, 4, clamp(Math.abs(hurtTimerGlobal - 1) * 3, 0, 1)))
      this.live1Solid.alpha = lerp(1, 0, clamp(Math.abs(hurtTimerGlobal - 1) * 3, 0, 1))
      this.live1Solid.tint = rgbToHex(255, lerp(1, 0, clamp(Math.abs(hurtTimerGlobal - 1) * 3, 0, 1)) * 255, lerp(1, 0, clamp(Math.abs(hurtTimerGlobal - 1) * 3, 0, 1)) * 255)

      this.live2.visible = true
    } else {
      this.live1.visible = false
      this.live1Solid.alpha = 0

      this.live2.visible = false
      this.live2Solid.visible = true
      this.live2Solid.scale.set(lerp(1, 4, clamp(Math.abs(hurtTimerGlobal - 1) * 3, 0, 1)))
      this.live2Solid.alpha = lerp(1, 0, clamp(Math.abs(hurtTimerGlobal - 1) * 3, 0, 1))
      this.live2Solid.tint = rgbToHex(255, lerp(1, 0, clamp(Math.abs(hurtTimerGlobal - 1) * 3, 0, 1)) * 255, lerp(1, 0, clamp(Math.abs(hurtTimerGlobal - 1) * 3, 0, 1)) * 255)
    }

    if (overheatTime > 0) {
      this.overheatTextShadow.visible = true
      this.overheatText.visible = true
      this.overheatTextShadow.text = `${Math.abs(overheatTime - 8).toFixed(2)}`
      this.overheatText.text = `${Math.abs(overheatTime - 8).toFixed(2)}`
      this.overheatText.tint = rgbToHex(255, easeOutQuint(overheatTime % 1.0) * 255, easeOutQuint(overheatTime % 1.0) * 255)

      this.overheatSprite.visible = true
      this.enterSprite.visible = repeat(overheatTime + 0.5, 1) - 0.5 > 0

	  this.xMark.visible = false
	  this.checkMark.visible = true
    } else {
      this.overheatTextShadow.visible = false
      this.overheatText.visible = false

	  this.overheatSprite.visible = false
      this.enterSprite.visible = false

	  this.xMark.visible = true
	  this.checkMark.visible = false
    }

    this.scoreTextShadow.text = `Score: ${score}`
    this.scoreText.text = `Score: ${score}`

    this.renderer.render(this.stage)
  }

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

  this.addTextGemma = (x, y, text, color = 0xffffff, anchorX = 0, anchorY = 0) => {
    const newText = new PIXI.BitmapText(text, {
      fontName: 'gemma3',
      fontSize: 8,
      align: 'center',
      tint: color
    })
    newText.anchor.set(anchorX, anchorY)
    newText.position.x = x
    newText.position.y = y
    this.activeText.push(newText)
    this.stage.addChild(newText)
    return newText
  }

  this.addTextGemmaRetry = (x, y, text, color = 0xffffff, anchorX = 0, anchorY = 0) => {
    const newText = new PIXI.BitmapText(text, {
      fontName: 'gemma3',
      fontSize: 8,
      align: 'center',
      tint: color
    })
    newText.anchor.set(anchorX, anchorY)
    newText.position.x = x
    newText.position.y = y
    this.activeText.push(newText)
    this.retryStage.addChild(newText)
    return newText
  }

  this.ensureResources = (callback) => {
    // PIXI.LoaderResource.setExtensionXhrType('fnt', PIXI.LoaderResource.XHR_RESPONSE_TYPE.TEXT)
    this.loader
      .add('kakwa', 'assets/kakwa.fnt')
      .add('gemma3', 'assets/gemma3.fnt')
      .add('progress_bar_empty', 'assets/progress_bar_unlit.png')
      .add('progress_bar_full', 'assets/progress_bar_lit.png')
      .add('progress_bar_arrow', 'assets/progress_bar_arrow6.png')
      .add('progress_bar_loss', 'assets/progress_bar_lost.png')
      .add('distance_meter', 'assets/distance_meter.png')
      .add('girl_head_icon', 'assets/magical_girl_head_tracker.png')
      .add('life_lit', 'assets/life_lit.png')
      .add('life_unlit', 'assets/life_unlit.png')
      .add('life_solid', 'assets/life_solid.png')
      .add('start', 'assets/play.png')
      .add('retry', 'assets/retry_title.png')
	  .add('overheat', 'assets/overheat_title.png')
	  .add('enter', 'assets/enter_title.png')
	  .add('x', 'assets/x_mark.png')
	  .add('check', 'assets/check_mark.png')
      .load(() => {
        callback()
      })
  }
}

// function componentToHex (c) {
//   const hex = c.toString(16)
//   return hex.length === 1 ? '0' + hex : hex
// }

// function rgbToHex (r, g, b) {
//   return parseInt(`0x${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`, 16)
// }

function rgbToHex (r, g, b) {
  return parseInt('0x' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1))
}

let triangleList = []
const TriangleType = {
  NORMAL: 'normal',
  GOOD: 'good',
  BAD: 'bad'
}

// const pointList = []

function Board () {
  this.objects = []
  this.panelTexture = null
  this.angelGeometry1 = null
  this.magicGirlTexture = null
  this.magicGirlHurtTexture = null
  this.angelWingGeometry3 = null
  this.panelMaterial = null
  this.angelColor = new THREE.Vector3(1, 1, 1)
  this.gradientGeometry = null
  this.particleMaterial = null
  this.girlMaterial = null

  this.musicSound = null
  this.soundBank = {}

  this.install = () => {}

  this.ensureResources = (callback) => {
    new THREE.TextureLoader().load('assets/panelssmall.png', (texture) => {
      texture.magFilter = THREE.NearestFilter
      texture.minFilter = THREE.NearestFilter
      this.panelTexture = texture
      new THREE.PLYLoader().load('assets/angel_eye_1.ply', (object) => {
        this.angelGeometry1 = object
        new THREE.TextureLoader().load('assets/magical_girl_1.png', (texture2) => {
          texture2.magFilter = THREE.NearestFilter
          texture2.minFilter = THREE.NearestFilter
          this.magicGirlTexture = texture2
          new THREE.PLYLoader().load('assets/angel_wing_3.ply', (object2) => {
            this.angelWingGeometry3 = object2
            new THREE.PLYLoader().load('assets/12_inner_gradient.ply', (object3) => { // _inner
              this.gradientGeometry = object3
              new THREE.AudioLoader().load('assets/angel_hit1.mp3', (buffer) => {
                this.soundBank.angel_hit = new THREE.Audio(game.view.listener)
                this.soundBank.angel_hit.setBuffer(buffer)
                new THREE.AudioLoader().load('assets/hurt1.mp3', (buffer2) => {
                  this.soundBank.hurt = {
                    sounds: [],
                    play: () => {
                      this.soundBank.hurt.sounds[Math.floor(Math.random() * this.soundBank.hurt.sounds.length)].play()
                    }
                  }
                  const hurtOne = new THREE.Audio(game.view.listener)
                  hurtOne.setBuffer(buffer2)
                  this.soundBank.hurt.sounds.push(hurtOne)
                  new THREE.AudioLoader().load('assets/hurt2.mp3', (buffer3) => {
                    const hurtTwo = new THREE.Audio(game.view.listener)
                    hurtTwo.setBuffer(buffer3)
                    this.soundBank.hurt.sounds.push(hurtTwo)
                    new THREE.AudioLoader().load('assets/hurt3.mp3', (buffer4) => {
                      const hurtThree = new THREE.Audio(game.view.listener)
                      hurtThree.setBuffer(buffer4)
                      this.soundBank.hurt.sounds.push(hurtThree)
                      new THREE.AudioLoader().load('assets/break_panel1.mp3', (buffer5) => {
                        this.soundBank.break = {
                          sounds: [],
                          play: () => {
                            this.soundBank.break.sounds[Math.floor(Math.random() * this.soundBank.break.sounds.length)].play()
                          }
                        }
                        const breakOne = new THREE.Audio(game.view.listener)
                        breakOne.setBuffer(buffer5)
                        this.soundBank.break.sounds.push(breakOne)
                        new THREE.AudioLoader().load('assets/break_panel2.mp3', (buffer6) => {
                          const breakTwo = new THREE.Audio(game.view.listener)
                          breakTwo.setBuffer(buffer6)
                          this.soundBank.break.sounds.push(breakTwo)
                          new THREE.AudioLoader().load('assets/break_panel3.mp3', (buffer7) => {
                            const breakThree = new THREE.Audio(game.view.listener)
                            breakThree.setBuffer(buffer7)
                            this.soundBank.break.sounds.push(breakThree)
                            new THREE.TextureLoader().load('assets/magical_girl_1_hurt.png', (texture3) => {
                              texture3.magFilter = THREE.NearestFilter
                              texture3.minFilter = THREE.NearestFilter
                              this.magicGirlHurtTexture = texture3
								new THREE.AudioLoader().load('assets/bullet_fire.mp3', (buffer8) => {
									this.soundBank.angel_spew = new THREE.Audio(game.view.listener)
									this.soundBank.angel_spew.setBuffer(buffer8)
									new THREE.AudioLoader().load('assets/overheat_alert.mp3', (buffer9) => {
										this.soundBank.alert = new THREE.Audio(game.view.listener)
										this.soundBank.alert.setBuffer(buffer9)
										callback()
									})
								})
                            })
                          })
                        })
                      })
                    })
                  })
                })
              })
            })
            /* new THREE.TextureLoader().load('assets/bayer_16_tile_2.png', (texture3) => {
              texture3.magFilter = THREE.NearestFilter
              texture3.minFilter = THREE.NearestFilter
              this.bayerTexture = texture3
            }) */
          })
        })
      })
    })
  }

  this.start = () => {
    // const timeText = game.ui.addText(320 / 2 + 1, 240 / 2 + 1, '')
    // const timerEntity = new Entity(game.scene)
    // timerEntity.addComponent(TimerComponent, timeText)
    // this.objects.push(timerEntity)
    // this.addSphere(0, 0, 0, 0.5)
    //game.scene.add(new THREE.AxesHelper(2))

    const fallGameEntity = new Entity(game.scene)
    fallGameEntity.addComponent(FallGameComponent)
    this.objects.push(fallGameEntity)

    this.setupStage(0, 0, 0, 4)
    this.addAngel()
    this.addGirl()

    this.particleMaterial = new THREE.RawShaderMaterial({
      uniforms: {
        color: { value: new THREE.Vector3(1.0, 1.0, 1.0) }//, //, // 0.0, 1.0, 0.8
        // bayer: { map: game.board.bayerTexture }
        // scale: { value: this.particleGlobalScale }
      },
      vertexShader: SHADER.BulletParticleVert,
      fragmentShader: SHADER.BulletParticleFrag,
      depthTest: false, // TODO: Think about this
      depthWrite: false,
      // blending: THREE.AdditiveBlending,
      transparent: true
    })
    const particleMaterialEntity = new Entity(game.scene)
    particleMaterialEntity.addComponent(MeshComponent, new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1), this.particleMaterial))
    particleMaterialEntity.transform.position.set(30, 30, 30)
    game.board.objects.push(particleMaterialEntity)

    const gradientEntity = new Entity(game.scene)
    const gradientMaterial = new THREE.RawShaderMaterial({
      uniforms: {
        tintColor: { value: new THREE.Vector3(0.8, 0.8, 0.8) }
      },
      vertexShader: SHADER.PSXVert,
      fragmentShader: SHADER.PSXFragNoTextureNoDither,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
    const gradientMesh = new THREE.Mesh(this.gradientGeometry, gradientMaterial)
    gradientMesh.scale.multiply(new THREE.Vector3(1, 3, 4))
    gradientMesh.scale.multiplyScalar(12) // 7.8 // 12
    gradientMesh.rotateY(-90 * (Math.PI / 180))
    gradientMesh.translateX(-8)
    gradientEntity.addComponent(MeshComponent, gradientMesh)
    gradientEntity.addComponent(EnableOnChargeComponent, gradientMaterial)
    gradientEntity.transform.parent = game.view.camera
    this.objects.push(gradientEntity)

    this.musicSound = new THREE.Audio(game.view.listener)
    // this.musicSound.setVolume(0.7)
    this.musicSound.setMediaElementSource(document.getElementById('music')) // TODO: MOVE THIS SOMEWHERE? Don't use input.js for it

    // this.addSphere(0, 1, 0, 2)
  }

  this.setupStage = (x = 0, y = 0, z = 0, radius = 1) => {
    let count = 0
    triangleList.forEach((element, index) => {
      triangleList[index].mesh.geometry.dispose()
      game.scene.remove(triangleList[index].mesh)
      count++
    })
    if (count > 0) {
      game.renderer.renderLists.dispose()
    }
    triangleList = []

    if (this.panelMaterial == null) {
      this.panelMaterial = new THREE.RawShaderMaterial({
        uniforms: {
          map: { value: this.panelTexture },
          tintColor: { value: new THREE.Vector3(1.0, 1.0, 1.0) }
        },
        vertexShader: SHADER.PSXVert,
        fragmentShader: SHADER.PSXFrag,
        depthTest: true,
        depthWrite: true,
        side: THREE.DoubleSide
      })
    }

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

        scale = (Math.random() * 7.0) // 3.0 this is the big scale for random push out
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
    // const finalVertices = new Float32Array(newVertices.length)
    // const finalUV = new Float32Array((newVertices.length / 3) * 2)
    newVertices.forEach((element, index) => {
      // finalVertices[index] = element

      if (index % 9 === 0) {
        const triangleType = (Math.random() > 0.5 ? TriangleType.NORMAL : (Math.random() > 0.5 ? TriangleType.GOOD : TriangleType.BAD))

        const triangleGeometry = new THREE.BufferGeometry()

        const triangleVertices = new Float32Array(9)

        triangleVertices[0] = newVertices[index]
        triangleVertices[1] = newVertices[index + 1]
        triangleVertices[2] = newVertices[index + 2]

        triangleVertices[3] = newVertices[index + 3]
        triangleVertices[4] = newVertices[index + 4]
        triangleVertices[5] = newVertices[index + 5]

        triangleVertices[6] = newVertices[index + 6]
        triangleVertices[7] = newVertices[index + 7]
        triangleVertices[8] = newVertices[index + 8]

        triangleGeometry.setAttribute('position', new THREE.BufferAttribute(triangleVertices, 3))

        const triangleUV = new Float32Array(6)

        triangleUV[0] = 0.5 / 2 + (triangleType === TriangleType.GOOD ? 0.5 : 0.0) // X1
        triangleUV[1] = 0.0 + (triangleType === TriangleType.NORMAL || triangleType === TriangleType.GOOD ? 0.5 : 0.0) // Y1

        triangleUV[2] = 0.0 + (triangleType === TriangleType.GOOD ? 0.5 : 0.0) // X2
        triangleUV[3] = 1.0 / 2 + (triangleType === TriangleType.NORMAL || triangleType === TriangleType.GOOD ? 0.5 : 0.0) // Y2

        triangleUV[4] = 1.0 / 2 + (triangleType === TriangleType.GOOD ? 0.5 : 0.0) // X3
        triangleUV[5] = 1.0 / 2 + (triangleType === TriangleType.NORMAL || triangleType === TriangleType.GOOD ? 0.5 : 0.0) // Y3

        triangleGeometry.setAttribute('uv', new THREE.BufferAttribute(triangleUV, 2))

        const newMesh = new THREE.Mesh(triangleGeometry, this.panelMaterial)
        game.scene.add(newMesh)

        triangleList.push(
          {
            triangle: new THREE.Triangle(
              new THREE.Vector3(newVertices[index], newVertices[index + 1], newVertices[index + 2]),
              new THREE.Vector3(newVertices[index + 3], newVertices[index + 4], newVertices[index + 5]),
              new THREE.Vector3(newVertices[index + 6], newVertices[index + 7], newVertices[index + 8])
            ),
            mesh: newMesh,
            type: triangleType,
            rotateAxis: (triangleType === TriangleType.GOOD ? new THREE.Vector3(1, 0, 0) : (triangleType === TriangleType.NORMAL ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, 0, 1))),
            rotateSpeed: Math.random()
          })
      }
    })

    geometry.dispose()
    /* for (let i = 0; i < finalUV.length; i += 6) {
      finalUV[i] = 0.5 / 2 // X1
      finalUV[i + 1] = 0.0 + 0.5 // Y1

      finalUV[i + 2] = 0.0 // X2
      finalUV[i + 3] = 1.0 / 2 + 0.5 // Y2

      finalUV[i + 4] = 1.0 / 2 // X3
      finalUV[i + 5] = 1.0 / 2 + 0.5 // Y3
    } */

    // geometry.setAttribute('position', new THREE.BufferAttribute(finalVertices, 3))
    // geometry.setAttribute('uv', new THREE.BufferAttribute(finalUV, 2))

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

    /* const sphere = new THREE.Mesh(geometry, material)
    sphere.position.set(x, y, z)
    const entity = new Entity(game.scene)
    entity.addComponent(MeshComponent, sphere)
    this.objects.push(entity) */
  }

  this.addAngel = () => {
    const entity = new Entity(game.scene)

    const vertexMaterial = new THREE.RawShaderMaterial({
      uniforms: {
        tintColor: { value: this.angelColor }
      },
      vertexShader: SHADER.PSXVert,
      fragmentShader: SHADER.PSXFragNoTexture,
      depthTest: true,
      depthWrite: true,
      blending: THREE.AdditiveBlending
    })

    const eyeMesh = new THREE.Mesh(this.angelGeometry1, vertexMaterial)
    eyeMesh.scale.multiplyScalar(3)
    entity.addComponent(MeshComponent, eyeMesh)

    const wing1 = new THREE.Mesh(this.angelWingGeometry3, vertexMaterial)
    wing1.scale.multiplyScalar(3)
    wing1.rotateY(180 * (Math.PI / 180))
    wing1.rotateZ(-30 * (Math.PI / 180))
    entity.addComponent(MeshComponent, wing1)

    const wing2 = new THREE.Mesh(this.angelWingGeometry3, vertexMaterial)
    wing2.scale.multiplyScalar(3)
    wing2.rotateZ(-30 * (Math.PI / 180))
    entity.addComponent(MeshComponent, wing2)

    entity.addComponent(LookAtCameraComponent)
    entity.addComponent(NewRoundSquishComponent, 0.6, 1.6)

    game.board.objects.push(entity)
  }

  this.addGirl = () => {
    const entity = new Entity(game.scene)
    this.girlMaterial = new THREE.RawShaderMaterial({
      uniforms: {
        map: { value: this.magicGirlTexture },
        tintColor: { value: new THREE.Vector3(1.0, 1.0, 1.0) }
      },
      vertexShader: SHADER.PSXVert,
      fragmentShader: SHADER.PSXFrag,
      depthTest: false,
      depthWrite: false,
      transparent: true
    })
    const girlGeometry = new THREE.PlaneGeometry(1, 1, 1, 1)
    const girlMesh = new THREE.Mesh(girlGeometry, this.girlMaterial)
    entity.addComponent(MeshComponent, girlMesh)
    entity.addComponent(MagicGirlComponent)
    game.board.objects.push(entity)
  }

  this.addParticle = () => {
    const bulletParticleEntity = new Entity(game.scene)
    bulletParticleEntity.addComponent(BulletParticleComponent, this.particleMaterial)
    this.objects.push(bulletParticleEntity)
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
  // this.requestDeletion = false // TODO: Get index here too, so board removal is easy, dispose function too

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
  this.destroy = () => {
    let index = 0
    for (let i = 0; i < game.board.objects.length; i++) {
      if (game.board.objects[i] === this) {
        console.log('Removing entity')
        index = i
        break
      }
    }

    for (const component of this.components) {
      if (typeof component.destroy === 'function') {
        component.destroy()
      }
    }

    game.board.objects.splice(index, 1)

    for (let i = this.transform.children.length - 1; i >= 0; i--) {
      const obj = this.transform.children[i]
      this.transform.remove(obj)
    }
    parent.remove(this.transform)
  }
  this.sendMessage = (name) => {
    for (const component of this.components) {
      if (typeof component[name] === 'function') {
        component[name]()
      }
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

const easeInOutQuint = (x) => x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2
const pingPong = (t, l) => l - Math.abs(repeat(t, l * 2) - l)
const repeat = (t, l) => clamp(t - Math.floor(t / l) * l, 0.0, l)

function EnableOnChargeComponent (entity, material) {
  this.entity = entity
  this.fullPosition = new THREE.Vector3().copy(this.entity.transform.position)
  this.emptyVector = new THREE.Vector3(0, 0, 8)

  this.update = (delta) => {
    if (shieldPercent >= 1) {
      // entity.transform.visible = true
      // this.entity.transform.position.lerpVectors(this.emptyVector, this.fullPosition, easeOutQuint(clamp(overheatTime, 0, 1)))
      this.entity.transform.position.copy(this.fullPosition)
      // material.uniforms.tintColor.value.x = lerp(1, 0.28, easeInOutQuint((Math.sin(game.elapsedTime * 5) + 1) / 2))
      // material.uniforms.tintColor.value.y = lerp(1, 0.28, easeInOutQuint((Math.sin(game.elapsedTime * 5) + 1) / 2))
      // material.uniforms.tintColor.value.z = lerp(1, 0.28, easeInOutQuint((Math.sin(game.elapsedTime * 5) + 1) / 2))
      const percent = Math.floor((overheatTime / 8) * 8.0) / 8.0
      const percentAlpha = easeInOutQuint(overheatTime % 1.0) // easeInOutQuint(overheatTime % 1.0)
      material.uniforms.tintColor.value.x = lerp(1, 0.28, percentAlpha)
      material.uniforms.tintColor.value.y = lerp(lerp(1, 0.28, percentAlpha), 0, percent)
      material.uniforms.tintColor.value.z = lerp(lerp(1, 0.28, percentAlpha), 0, percent)
    } else {
      this.entity.transform.position.copy(this.emptyVector)
      // entity.transform.visible = false
    }
  }
}

function MagicGirlComponent (entity) {
  this.entity = entity
  // this.targetPosition = new THREE.Vector3()

  this.update = (delta) => {
    // this.targetPosition.copy(game.view.camera.position)
    this.entity.transform.position.copy(game.view.camera.position)
    this.entity.transform.rotation.copy(game.view.camera.rotation)
    // this.entity.transform.translateZ(lerp(-2.4, -1.3, easeOutBack((globalVelocity + 5) / 24), 6)) // -1.2)
    // this.entity.transform.translateZ(-1.2 * 2)
    this.entity.transform.translateZ(lerp(-2, 0, globalVelocity / 55))// (globalVelocity >= 0 ? lerp(-1.4, -5, globalVelocity / 55) : lerp(-1.4, -3, Math.abs(globalVelocity) / 55)) // lerp(-2, 0, globalVelocity / 55)

    if (dead === false) {
      this.entity.transform.translateX(((game.input.getButton('left') ? -1 : 0) + (game.input.getButton('right') ? 1 : 0)) * 0.1)
      this.entity.transform.translateY(((game.input.getButton('forward') ? -1 : 0) + (game.input.getButton('back') ? 1 : 0)) * 0.1 * -1)
    }

    // this.entity.transform.lookAt(game.view.camera.position)
    // game.view.camera.fov = lerp(70, 40, globalVelocity / 55)

    // game.view.camera.updateProjectionMatrix()
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

let angelCountUpTime = 0

function NewRoundSquishComponent (entity, scale = 0.7, time = 1) {
  this.entity = entity
  // this.countUpTime = 0

  this.update = (delta) => {
    if (angelCountUpTime > 1) {
      return
    }

    angelCountUpTime += delta * time

    this.entity.transform.scale.y = lerp(scale, 1, easeOutBack(angelCountUpTime, 3))
    this.entity.transform.scale.x = lerp(scale * 1.8, 1, easeOutBack(angelCountUpTime, 3))
  }

  this.newRound = () => {
    angelCountUpTime = 0
  }
}

function LookAtCameraComponent (entity, speed = 100) {
  this.entity = entity
  // this.lastPosition = new THREE.Vector3().copy(game.view.camera.position)
  // this.target = new THREE.Vector3().copy(game.view.camera.position)
  // this.easedRotation = new THREE.Quaternion().copy(globalRotation)

  this.update = (delta) => {
    // this.target.x += (this.lastPosition.x - this.target.x) * speed * delta
    // this.target.y += (this.lastPosition.y - this.target.y) * speed * delta
    // this.target.z += (this.lastPosition.z - this.target.z) * speed * delta
    // this.easedRotation.rotateTowards(globalRotation, speed * (Math.PI * 180) * delta)

    this.entity.transform.quaternion.rotateTowards(globalRotation, (speed * (Math.PI / 180)) * delta)
    // TODO: Angel wing flap
    // LERP(game.elapsedTime sin etc.)
    // TODO:
    // Score coutner on triangle pies kill destroy
    // UI clear and death
    // Dying uh, state, fall in, done done
    // Bool
    // >x ~~~Global blood fade, maybe not needed?~~~ xxxx
    // Low pass music
    // Squish sound
    // Blinking bar
    //
    // this.entity.transform.lookAt(this.target)

    // this.lastPosition.copy(game.view.camera.position)
  }

  this.newRound = () => {
    this.entity.transform.quaternion.copy(globalRotation)
  }
}

const pointLists = {}

function BulletParticleComponent (entity, particleMaterial) {
  this.entity = entity
  this.lifetime = 0
  this.maxLifetime = 5 // Whatever lifetime gets the last bullet to 20 units, push way out beyond 20 for the single shots so they can't
  this.particleRadius = 0.2
  this.particleCount = 25
  // this.particleGlobalScale = 16
  this.emitRate = 0 // 0.5
  this.directions = []

  //   for (let i = 0; i < this.particleCount; i++) {
  //     pointList.push({
  //       position: new THREE.Vector3(),
  //       radius: this.particleRadius
  //     })
  //   }

  const positions = new Float32Array(this.particleCount * 3)
  const particleGeometry = new THREE.BufferGeometry()
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  this.particles = new THREE.Points(particleGeometry, particleMaterial)

  particleGeometry.dispose()

  entity.transform.add(this.particles)

  angelCountUpTime = 0.1

  this.pointList = pointLists[this.entity.id] = []

  // If emit type is sphere, do this:
  let row = 0
  const rootOfCount = Math.sqrt(this.particleCount)
  for (let i = 0; i < positions.length; i += 3) {
    const cell = (i / 3) % (rootOfCount)
    if (cell === 0) {
      row += 1
    }

    const x = cell - ((rootOfCount - 1) / 2)
    const y = row - ((rootOfCount + 1) / 2)
    const z = 2.8

    this.directions.push(new THREE.Vector3(x, y, z).divideScalar(Math.sqrt(x * x + y * y + z * z)).applyQuaternion(globalRotation).normalize())

    this.pointList.push(new THREE.Vector3())
  }

  this.update = (delta) => {
    this.lifetime += delta

    /* if (this.directions.length < this.particleCount) {
      return
    } */

    const positions = this.particles.geometry.attributes.position.array
    // const percentFinished = this.maxLifetime / this.lifetime

    for (let i = 0; i < positions.length; i += 3) {
      if (this.pointList[i / 3].x < -1000) {
        positions[i] = this.pointList[i / 3].x
        positions[i + 1] = this.pointList[i / 3].y
        positions[i + 2] = this.pointList[i / 3].z
        continue
      }

      if (this.lifetime > (this.emitRate * (i / 3))) {
        // positions[i] += delta * 6
        positions[i] += this.directions[i / 3].x * 4 * delta // 6
        positions[i + 1] += this.directions[i / 3].y * 4 * delta
        positions[i + 2] += this.directions[i / 3].z * 4 * delta

        this.pointList[i / 3].x = positions[i]
        this.pointList[i / 3].y = positions[i + 1]
        this.pointList[i / 3].z = positions[i + 2]
      }
    }

    if (this.lifetime > this.maxLifetime) {
      // this.lifetime = 0
      this.entity.destroy()
      return
      /* for (let i = 0; i < positions.length; i += 3) {
        positions[i] = 0
        positions[i + 1] = 0
        positions[i + 2] = 0
      } */
    }

    this.particles.geometry.attributes.position.needsUpdate = true

    // Sort by depth
    const vector = new THREE.Vector3()

    const matrix = new THREE.Matrix4()
    matrix.multiplyMatrices(game.view.camera.projectionMatrix, game.view.camera.matrixWorldInverse)
    matrix.multiply(this.particles.matrixWorld)

    const geometry = this.particles.geometry

    let index = geometry.getIndex()

    if (index === null) {
      const array = new Uint16Array(positions.length / 3)
      for (let i = 0; i < array.length; i++) {
        array[i] = i
      }

      index = new THREE.BufferAttribute(array, 1)
      geometry.setIndex(index)
    }

    const sortArray = []

    for (let i = 0; i < index.array.length; i++) {
      vector.fromArray(positions, i * 3)
      vector.applyMatrix4(matrix)

      sortArray.push([vector.z, i])
    }

    function numericalSort (a, b) {
      return b[0] - a[0]
    }

    sortArray.sort(numericalSort)

    const indices = index.array

    for (let i = 0; i < index.array.length; i++) {
      indices[i] = sortArray[i][1]
    }

    this.particles.geometry.index.needsUpdate = true
    /* entity.transform.rotation.x += this.speed * delta
    entity.transform.rotation.y += this.speed / 2 * delta
    entity.transform.rotation.z += this.speed * 1 * delta */
  }

  this.destroy = () => {
    this.particles.geometry.dispose()
    delete pointLists[this.entity.id]
  }

  this.newRound = () => {
    this.entity.destroy()
  }
}

const clamp = (num, min, max) => Math.min(Math.max(num, min), max)
const E1 = new THREE.Vector3() // I don't think these do anything in the context of js and memory, but I'm going to keep them anyways I think
const E2 = new THREE.Vector3()
const N = new THREE.Vector3()

const AO = new THREE.Vector3()
const DAO = new THREE.Vector3()

function IntersectTriangle (ROrigin, RDir, A, B, C, len) {
  E1.subVectors(B, A)
  E2.subVectors(C, A)
  N.crossVectors(E1, E2)
  const det = -RDir.dot(N)
  const invdet = 1.0 / det
  AO.subVectors(ROrigin, A)
  DAO.crossVectors(AO, RDir)
  const u = E2.dot(DAO) * invdet
  const v = -E1.dot(DAO) * invdet
  const t = AO.dot(N) * invdet
  /* if (det >= 0.000001 && t >= 0.0 && t <= len && u >= 0.0 && v >= 0.0 && (u + v) <= 1.0) {
    console.log(`${t} ${len}`)
  } */
  return (det >= 0.000001 && t >= 0.0 && t <= len && u >= 0.0 && v >= 0.0 && (u + v) <= 1.0)
}

function IntersectSphere (POrigin, SOrigin, R) {
  return POrigin.distanceTo(SOrigin) < R
}

let shieldPercent = 0.0
let shieldPercentPrevious = 0.0
let lives = 2
let overheatTime = 0

const easeOutBack = (t, s = 1) => 1 + (2.70158 * s) * Math.pow(clamp(t, 0, 1) - 1, 3) + (1.70158 * s) * Math.pow(clamp(t, 0, 1) - 1, 2)
const easeOutBackNoClamp = (t, s = 1) => 1 + (2.70158 * s) * Math.pow(t - 1, 3) + (1.70158 * s) * Math.pow(t - 1, 2)
const globalRotation = new THREE.Quaternion()
let globalVelocity = 0
let percentFromMiddle = 0
let hurtTimerGlobal = 0
let score = 0
let dead = false

function FallGameComponent (entity) {
  this.entity = entity
  // entity.transform.add(mesh)
  this.rotation = new THREE.Quaternion()
  this.newRotation = new THREE.Quaternion()
  this.newRotationEuler = new THREE.Euler()
  this.rotateSpeed = 90.0 + 45.0 // Degrees
  this.distanceFromCenter = 30.0
  this.maxDistanceFromCenter = 30.0
  this.velocity = 0.0
  this.timeToKill = 8.0
  this.killTimer = 0.0
  this.acceleration = -24.0
  this.bounceVelocity = 24.0
  this.terminalVelocityDown = -55.0
  this.terminalVelocityUp = 55.0
  this.lastPosition = new THREE.Vector3()
  this.distanceVector = new THREE.Vector3()
  this.directionVector = new THREE.Vector3()
  this.stageScale = 0.0
  this.finishedScaling = false
  this.maxHeatTime = 8
  this.particleTimer = 0
  this.particleSpawnTime = 3
  this.hurtTimer = 0
  this.playedOverheat = false
  // this.lives = 2
  // this.cameraForward = new THREE.Vector3()
  // this.axis = new THREE.AxesHelper(3)
  // game.scene.add(this.axis)

  this.update = (delta) => {
    if (this.killTimer < this.timeToKill && dead === false) {
      this.killTimer += delta
    }
    shieldPercent = clamp(this.killTimer, 0.0, this.timeToKill) / this.timeToKill

    if (this.killTimer >= this.timeToKill) {
      overheatTime += delta

if (this.playedOverheat === false) {
	if (game.board.soundBank.alert !== null && game.board.soundBank.alert.isPlaying) {
				game.board.soundBank.alert.stop()
			}
			game.board.soundBank.alert.play()
}

	  this.playedOverheat = true

      if (overheatTime > this.maxHeatTime) { // TODO: Explode here
        shieldPercentPrevious = clamp(this.killTimer, 0.0, this.timeToKill) / this.timeToKill
        this.killTimer = clamp(this.killTimer - 3.0, 0.0, this.timeToKill)
        this.velocity = this.bounceVelocity * 1.1
        overheatTime = 0
        if (lives <= 0) {
          this.die()
        } else {
          lives -= 1
          game.board.soundBank.hurt.play()
          game.board.girlMaterial.uniforms.map.value = game.board.magicGirlHurtTexture
          this.hurtTimer = 1
        }
      }
    } else {
      overheatTime = 0
	  this.playedOverheat = false
    }

    this.particleTimer += delta

    if (this.hurtTimer >= 0) {
      this.hurtTimer -= delta
      hurtTimerGlobal = this.hurtTimer
      game.board.girlMaterial.uniforms.tintColor.value.y = easeOutBack(lerp(1.0, 0.0, repeat(this.hurtTimer * 2, 1)))
      game.board.girlMaterial.uniforms.tintColor.value.z = easeOutBack(lerp(1.0, 0.0, repeat(this.hurtTimer * 2, 1)))
      if (this.hurtTimer <= 0) {
        game.board.girlMaterial.uniforms.map.value = game.board.magicGirlTexture
        game.board.girlMaterial.uniforms.tintColor.value.y = 1
        game.board.girlMaterial.uniforms.tintColor.value.z = 1
      }
    }

    this.velocity = clamp(this.velocity, this.terminalVelocityDown, this.terminalVelocityUp)
    this.distanceFromCenter += this.velocity * delta + 0.5 * this.acceleration * delta * delta
    if (this.distanceFromCenter < 0.0) {
      this.distanceFromCenter = 0.0
    }
    this.velocity += this.acceleration * delta
    globalVelocity = this.velocity
    percentFromMiddle = this.distanceFromCenter / this.maxDistanceFromCenter

    this.stageScale += delta * 2

    // TODO: Normalize here xxx~~~
    if (dead === false) {
      this.rotation.multiply(this.newRotation.setFromEuler(
        this.newRotationEuler.set(
          ((((game.input.getButton('forward') ? -1.0 : 0.0) + (game.input.getButton('back') ? 1.0 : 0.0)) * this.rotateSpeed) * (Math.PI / 180.0)) * delta,
          ((((game.input.getButton('left') ? -1.0 : 0.0) + (game.input.getButton('right') ? 1.0 : 0.0)) * this.rotateSpeed) * (Math.PI / 180.0)) * delta,
          0
        )))
    }

    globalRotation.copy(this.rotation)

    if (game.input.getButtonDown('restart') && dead) {
      dead = false
      this.newStage()
      score = 0
	  lives = 2
    }

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

    for (let i = 0; i < triangleList.length; i++) {
      if (triangleList[i].enabled !== undefined) {
        continue
      }

      if (this.stageScale <= 1) {
        triangleList[i].mesh.scale.set(easeOutBack(this.stageScale, 3), easeOutBack(this.stageScale, 3), easeOutBack(this.stageScale, 3))
      } else if (this.finishedScaling === false) {
        triangleList[i].mesh.scale.set(1, 1, 1)
      }
      triangleList[i].mesh.rotation.setFromVector3(triangleList[i].mesh.rotation.toVector3().add(triangleList[i].rotateAxis.clone().multiplyScalar(triangleList[i].rotateSpeed * delta)))

      const currentTriangleConvertedA = triangleList[i].mesh.localToWorld(triangleList[i].triangle.a.clone())
      const currentTriangleConvertedB = triangleList[i].mesh.localToWorld(triangleList[i].triangle.b.clone())
      const currentTriangleConvertedC = triangleList[i].mesh.localToWorld(triangleList[i].triangle.c.clone())

      if (this.velocity < 0.0) {
        if (IntersectTriangle(this.lastPosition, this.directionVector.subVectors(game.view.camera.position, this.lastPosition).normalize(), currentTriangleConvertedA, currentTriangleConvertedB, currentTriangleConvertedC, Math.max(this.distanceVector.subVectors(this.lastPosition, game.view.camera.position).length() * 3, 1.4))) {
          this.velocity = this.bounceVelocity
          if (triangleList[i].type === TriangleType.BAD) {
            shieldPercentPrevious = clamp(this.killTimer, 0.0, this.timeToKill) / this.timeToKill
            // this.killTimer = clamp(this.killTimer - 1.0, 0.0, this.timeToKill)
            this.killTimer = clamp(this.killTimer - 2.5, 0.0, this.timeToKill)
            this.velocity = this.bounceVelocity// * 0.87
            this.addScore(5)
          } else if (triangleList[i].type === TriangleType.GOOD) {
            if (dead === false) {
              this.killTimer = clamp(this.killTimer + 0.5, 0.0, this.timeToKill)
            }
            this.velocity = this.bounceVelocity// * 1.3
            this.addScore(25)
          } else {
            this.addScore(10)
          }

          triangleList[i].mesh.geometry.dispose()
          game.scene.remove(triangleList[i].mesh)
          game.renderer.renderLists.dispose()
          triangleList[i].enabled = false
          game.board.soundBank.break.play()

          if (this.particleTimer >= this.particleSpawnTime) {
            this.particleTimer = 0
            this.particleSpawnTime = lerp(3, 6, Math.random())
            game.board.addParticle()
			if (game.board.soundBank.angel_spew !== null && game.board.soundBank.angel_spew.isPlaying) {
				game.board.soundBank.angel_spew.stop()
			}
			game.board.soundBank.angel_spew.play()
          }
          break
        }
      }
    }

    game.view.camera.getWorldDirection(this.directionVector)
    this.directionVector.multiplyScalar(Math.max(this.distanceVector.subVectors(this.lastPosition, game.view.camera.position).length() * 3, 1.4))
    this.directionVector = game.view.camera.position.clone().add(this.directionVector)

    if (this.velocity < 0.0 && this.distanceFromCenter > 1) {
      for (const property in pointLists) {
        for (let i = 0; i < pointLists[property].length; i++) {
          if (IntersectSphere(this.directionVector, pointLists[property][i], 0.7)) {
            this.velocity = this.bounceVelocity * 0.8
            pointLists[property][i].x = -2000
            pointLists[property][i].y = -2000
            pointLists[property][i].z = -2000
            shieldPercentPrevious = clamp(this.killTimer, 0.0, this.timeToKill) / this.timeToKill
            this.killTimer = clamp(this.killTimer - 1.0, 0.0, this.timeToKill)
            if (lives <= 0) {
              // this.newStage()
              this.die()
            } else {
              lives -= 1
            }
            if (dead === false) {
              game.board.soundBank.hurt.play()
              game.board.girlMaterial.uniforms.map.value = game.board.magicGirlHurtTexture
              this.hurtTimer = 1
            }
            break
          }
        }
      }
    }

    if (this.stageScale > 1 && this.finishedScaling === false) {
      this.finishedScaling = true
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
      if (this.killTimer >= this.timeToKill) {
        console.log('Congratulations, you killed the ogre!') // Next stage here
        game.board.soundBank.angel_hit.play()
        this.addScore(100)
        this.newStage()
      } else if (lives > 0) {
        this.velocity = this.bounceVelocity
        lives -= 1
        shieldPercentPrevious = clamp(this.killTimer, 0.0, this.timeToKill) / this.timeToKill
        this.killTimer = clamp(this.killTimer - 2.5, 0.0, this.timeToKill)
        game.board.soundBank.hurt.play()
        game.board.girlMaterial.uniforms.map.value = game.board.magicGirlHurtTexture
        this.hurtTimer = 1
      } else {
        console.error('Oh no, you died! Try again!') // TODO: Only reset lives here, maybe 1UP in world, or on certain scores
        this.velocity = this.bounceVelocity
        this.die()
        // this.newStage()
      }
      // TODO: If you are above the top stage, else die and back to menu/retry screen
    //   this.velocity = 0.0
    //   this.killTimer = 0.0
    //   shieldPercentPrevious = 0.0
    //   this.distanceFromCenter = this.maxDistanceFromCenter
    //   game.board.setupStage(0, 0, 0, 4)
    //   for (let i = 0; i < game.board.objects.length; i++) {
    //     game.board.objects[i].sendMessage('newRound')
    //   }
    //   this.stageScale = 0.0
      //   this.lives = 2
    }
  }

  this.die = () => {
    if (dead === false) {
      game.board.soundBank.hurt.play()
      game.board.girlMaterial.uniforms.map.value = game.board.magicGirlHurtTexture
      this.hurtTimer = this.hurtTimer + 800
      hurtTimerGlobal = this.hurtTimer
      dead = true
    }
  }

  this.addScore = (scoreAmount) => {
    if (dead === false) {
      score += scoreAmount
    }
  }

  this.newStage = () => {
    this.velocity = 0.0
    this.killTimer = 0.0
    shieldPercentPrevious = 0.0
    this.distanceFromCenter = this.maxDistanceFromCenter
    game.board.setupStage(0, 0, 0, 4)
    for (let i = 0; i < game.board.objects.length; i++) {
      game.board.objects[i].sendMessage('newRound')
    }
    this.stageScale = 0.0
    // lives = 2
    this.particleTimer = 0
    this.particleSpawnTime = lerp(3, 6, Math.random())
    this.hurtTimer = 0
  }
}

const debug = false
const log = (text) => (debug ? console.log(text) : null)

function Game () {
  this.renderer = null
  this.ui = new UI()
  this.view = new View()
  this.board = new Board()
  this.input = new Input()
  this.clock = new THREE.Clock()
  this.scene = new THREE.Scene()
  this.state = State.INSTALL
  this.elapsedTime = 0

  this.install = () => {
    this.renderer = new THREE.WebGL1Renderer({ antialias: false, stencil: false, depth: true })
    this.renderer.setPixelRatio(1)
    this.renderer.setSize(320, 240, false)
    this.renderer.setClearColor(new THREE.Color('black'))
    this.renderer.domElement.style['pointer-events'] = 'none'
    document.body.appendChild(this.renderer.domElement)
    this.ui.install()
    this.view.install()
    this.board.install()
    this.input.install()
    this.fitViewport()
    window.addEventListener('resize', this.fitViewport, false)
    log('installed everything')
  }

  this.start = () => {
    this.state = State.START
    // TODO: Do one render here of loading text
    this.ensureResources(() => {
      this.ui.start()
      this.view.start()
      this.board.start()
      this.renderer.setAnimationLoop(this.update)
      log('started everything and set animation loop')
      // this.ui.addText(320 / 2 + 1, 240 / 2 + 1, 'Hello!', 0x000000)
      // this.ui.addText(320 / 2, 240 / 2, 'Hello!')
      // this.board.addSphere(0.0, 0.0, 0.0, 0.5)
    })
  }

  this.update = () => {
    if (gameBegun === false) {
      this.ui.render()
      return
    }

    this.state = State.UPDATE
    const delta = this.clock.getDelta()
    this.elapsedTime += delta
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
      log('ensured ui')
      this.board.ensureResources(() => {
        log('ensured board textures')
        callback()
      })
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
