/**
 * Toddler mode: everything that makes accidental exits less likely.
 *
 * A browser can't lock the keyboard completely, so this reduces accidents
 * rather than preventing every exit. Cmd+Q, Cmd+Tab and OS gestures still
 * work, by design of the browser.
 */
import { createHoldDetector } from './hold'

type KeyboardLock = { lock(keys?: string[]): Promise<void>; unlock(): void }
type WakeLock = { request(type: 'screen'): Promise<{ release(): Promise<void> }> }

const nav = navigator as Navigator & { keyboard?: KeyboardLock; wakeLock?: WakeLock }

export const EXIT_HOLD_MS = 2000
const CURSOR_IDLE_MS = 2000

export function createToddlerMode(opts: { onExit: () => void }) {
  let active = false
  let cursorTimer: ReturnType<typeof setTimeout> | undefined
  let holdTimer: ReturnType<typeof setInterval> | undefined
  let wake: { release(): Promise<void> } | null = null
  const escHold = createHoldDetector('Escape', EXIT_HOLD_MS)

  // A "leave site?" prompt, so one stray Cmd/Ctrl+W doesn't close the tab.
  const onBeforeUnload = (e: BeforeUnloadEvent) => {
    e.preventDefault()
    e.returnValue = ''
  }

  // Trackpad swipes and the Back key: keep a history entry to land on.
  const onPopState = () => {
    if (active) history.pushState({ keymash: true }, '')
  }

  // Toddlers slap the trackpad too. No clicks, context menus or zooming.
  const swallow = (e: Event) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const showCursor = () => {
    document.body.classList.remove('hide-cursor')
    clearTimeout(cursorTimer)
    cursorTimer = setTimeout(() => document.body.classList.add('hide-cursor'), CURSOR_IDLE_MS)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (escHold.down(e)) exit()
  }
  const onKeyUp = (e: KeyboardEvent) => escHold.up(e)

  const onFullscreenChange = () => {
    // In Chrome/Edge, Keyboard Lock turns Esc into the browser's own
    // "press and hold Esc to exit", so leaving fullscreen there means the
    // parent held Esc: end toddler mode. Elsewhere a single Esc leaves
    // fullscreen, so keep playing in the window; holding Esc still exits.
    if (!document.fullscreenElement && active && nav.keyboard?.lock) exit()
  }

  async function enter() {
    active = true
    escHold.reset()
    history.pushState({ keymash: true }, '')
    window.addEventListener('beforeunload', onBeforeUnload)
    window.addEventListener('popstate', onPopState)
    window.addEventListener('keydown', onKeyDown, true)
    window.addEventListener('keyup', onKeyUp, true)
    for (const type of ['click', 'auxclick', 'dblclick', 'contextmenu', 'wheel']) {
      window.addEventListener(type, swallow, { capture: true, passive: false })
    }
    window.addEventListener('mousemove', showCursor)
    document.addEventListener('fullscreenchange', onFullscreenChange)
    document.documentElement.classList.add('toddler')
    showCursor()
    // Without auto-repeat, keydown alone can't tell how long Esc is held.
    holdTimer = setInterval(() => escHold.held() && exit(), 100)

    try {
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' })
      // Lock every key the browser allows (Esc, Cmd/Ctrl+W, …). Chromium only.
      await nav.keyboard?.lock()
    } catch {
      // No fullscreen (e.g. iPhone) or no lock: still playable in the window.
    }
    try {
      // Keep the screen from dimming mid-play.
      wake = (await nav.wakeLock?.request('screen')) ?? null
    } catch {
      wake = null
    }
  }

  function exit() {
    if (!active) return
    active = false
    window.removeEventListener('beforeunload', onBeforeUnload)
    window.removeEventListener('popstate', onPopState)
    window.removeEventListener('keydown', onKeyDown, true)
    window.removeEventListener('keyup', onKeyUp, true)
    for (const type of ['click', 'auxclick', 'dblclick', 'contextmenu', 'wheel']) {
      window.removeEventListener(type, swallow, { capture: true })
    }
    window.removeEventListener('mousemove', showCursor)
    document.removeEventListener('fullscreenchange', onFullscreenChange)
    document.documentElement.classList.remove('toddler')
    document.body.classList.remove('hide-cursor')
    clearTimeout(cursorTimer)
    clearInterval(holdTimer)
    nav.keyboard?.unlock()
    void wake?.release()
    wake = null
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {})
    opts.onExit()
  }

  return { enter, exit, isActive: () => active }
}
