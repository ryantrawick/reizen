import * as utils from '@pixi/utils'

// Renderer plugins
import { Renderer, BatchRenderer } from '@pixi/core'
import { InteractionManager } from '@pixi/interaction'

// Loader plugins
import { Loader } from '@pixi/loaders'
import { BitmapFontLoader } from '@pixi/text-bitmap'
export * from '@pixi/constants'
export * from '@pixi/math'
// export * from '@pixi/runner'
export * from '@pixi/settings'
// export * from '@pixi/ticker'
export { utils }
export * from '@pixi/display'
export * from '@pixi/core'
export * from '@pixi/loaders'
export * from '@pixi/sprite'
export * from '@pixi/text-bitmap'
export * from '@pixi/graphics'
Renderer.registerPlugin('batch', BatchRenderer)
Renderer.registerPlugin('interaction', InteractionManager)
Loader.registerPlugin(BitmapFontLoader)

/* export {
  settings,
  SCALE_MODES,
  Container,
  Renderer,
  Loader,
  BitmapText,
  utils,
  Sprite
} from 'pixi.js' */
