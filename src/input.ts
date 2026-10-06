/**
 * Keyboard → content key. Uses `event.code` (the physical key), not
 * `event.key`, so it works the same with Shift or Caps Lock held, with
 * non-US layouts, and with a Japanese IME switched on (where `event.key`
 * is just "Process").
 */
export type KeyLike = Pick<KeyboardEvent, 'code' | 'repeat' | 'metaKey' | 'ctrlKey' | 'altKey'>

export function keyFromEvent(e: KeyLike): string | null {
  // Holding a key fires keydown over and over; only the first press counts.
  if (e.repeat) return null
  // Leave real shortcuts alone (Cmd+R, Ctrl+L, …).
  if (e.metaKey || e.ctrlKey || e.altKey) return null

  const letter = /^Key([A-Z])$/.exec(e.code)
  if (letter) return letter[1]
  const digit = /^(?:Digit|Numpad)([0-9])$/.exec(e.code)
  if (digit) return digit[1]
  return null
}

/**
 * Whether to stop the browser's default action for a key press. Toddler
 * input shouldn't scroll (Space, arrows), move focus (Tab), go back
 * (Backspace in older browsers) or open quick-find (/ and ' in Firefox).
 * Shortcuts with Cmd/Ctrl/Alt are left alone so the parent can still use them.
 */
export function shouldBlockDefault(e: KeyLike): boolean {
  return !(e.metaKey || e.ctrlKey || e.altKey)
}
