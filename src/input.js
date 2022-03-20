function Input () {
  this.states = {}
  this.actions = {
    forward: { type: 'button' },
    back: { type: 'button' },
    left: { type: 'button' },
    right: { type: 'button' },
    select: { type: 'button' },
    cancel: { type: 'button' },
    restart: { type: 'button' }
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
    window.addEventListener('contextmenu', (event) => {
      event.stopPropagation()
      event.preventDefault()
      return false
    })
    // Is phone
    // if (this.isMobile()) {
    //   const selectButton = document.createElement('div')
    //   selectButton.style.position = 'fixed'
    //   selectButton.style.width = '20vh'
    //   selectButton.style.height = '20vh'
    //   selectButton.style.top = '70vh'
    //   selectButton.style.left = '65vw'
    //   selectButton.style.background = 'white'
    //   document.body.appendChild(selectButton)

    //   const cancelButton = document.createElement('div')
    //   cancelButton.style.position = 'fixed'
    //   cancelButton.style.width = '20vh'
    //   cancelButton.style.height = '20vh'
    //   cancelButton.style.top = '60vh'
    //   cancelButton.style.left = '80vw'
    //   cancelButton.style.background = 'white'
    //   cancelButton.addEventListener('touchstart', () => {
    //     this.states.cancel.down += 1
    //     this.states.cancel.held += 1
    //     // console.log(this.states.cancel.down)
    //   })
    //   document.body.appendChild(cancelButton)
    // }
  }

  this.isMobile = () => {
    let check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true })(navigator.userAgent || navigator.vendor || window.opera)
    return check
  }

  this.getButton = (name) => {
    return this.states[name].held > 0
  }

  this.getButtonDown = (name) => {
    return this.states[name].down > 0
  }

  this.getButtonUp = (name) => {
    return this.states[name].up > 0
  }

  this.keyboardStates = {}
  this.keyboardActionMapping = {
    forward: ['w', 'ArrowUp'],
    back: ['s', 'ArrowDown'],
    left: ['a', 'ArrowLeft'],
    right: ['d', 'ArrowRight'],
    select: ['z', 'e', 'Spacebar', ' ', 'Enter'],
    cancel: ['x', 'q', 'Backspace'],
    restart: ['r']
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
    forward: [12],
    back: [13],
    left: [14],
    right: [15],
    select: [9],
    cancel: [1],
    restart: [0]
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
    // Zero keys so that input won't build as time goes on
    Object.keys(this.states).forEach(key => {
      this.states[key] = 0
    })

    if (window.joypad.instances !== undefined && Object.keys(window.joypad.instances).length > 0) {
    // Update gamepad state
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

      // Send gamepad state to main state, also query input every frame because we don't have events like the keyboard
      Object.keys(this.gamepadActionMapping).forEach(action => {
        for (let i = 0; i < this.gamepadActionMapping[action].length; i++) {
          const button = this.gamepadActionMapping[action][i]
          if (window.joypad.instances[Object.keys(window.joypad.instances)[0]].buttons[button].pressed) {
            this.onButtonDown(button)
          } else {
            this.onButtonUp(button)
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

        this.states[action].down += pollDown > 0 ? 1 : 0
        this.states[action].held += pollHeld > 0 ? 1 : 0
        this.states[action].up += pollUp > 0 ? 1 : 0
      })
    }

    // Update keyboard state
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

    // Send keyboard state to main state
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

        // document.getElementById('music').play()

        pollDown += this.keyboardStates[key].down ? 1 : 0
        pollHeld += this.keyboardStates[key].held ? 1 : 0
        pollUp += this.keyboardStates[key].up ? 1 : 0
      }

      if (!this.states[action]) {
        this.states[action] = { down: false, held: false, up: false }
      }

      this.states[action].down += pollDown > 0 ? 1 : 0
      this.states[action].held += pollHeld > 0 ? 1 : 0
      this.states[action].up += pollUp > 0 ? 1 : 0
    })
  }
}
export { Input }
