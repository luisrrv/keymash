import { describe, expect, it } from 'vitest'
import { keyFromEvent, shouldBlockDefault, type KeyLike } from './input'

const ev = (code: string, extra: Partial<KeyLike> = {}): KeyLike => ({
  code,
  repeat: false,
  metaKey: false,
  ctrlKey: false,
  altKey: false,
  ...extra,
})

describe('keyFromEvent', () => {
  it('maps letters and digits by physical key', () => {
    expect(keyFromEvent(ev('KeyA'))).toBe('A')
    expect(keyFromEvent(ev('KeyZ'))).toBe('Z')
    expect(keyFromEvent(ev('Digit7'))).toBe('7')
    expect(keyFromEvent(ev('Numpad0'))).toBe('0')
  })

  it('ignores everything else', () => {
    for (const code of ['Space', 'Semicolon', 'Enter', 'ShiftLeft', 'F5', 'ArrowUp', 'Backspace', 'IntlYen', 'NumpadAdd']) {
      expect(keyFromEvent(ev(code)), code).toBeNull()
    }
  })

  it('ignores held-key repeats', () => {
    expect(keyFromEvent(ev('KeyJ', { repeat: true }))).toBeNull()
  })

  it('leaves shortcuts to the browser', () => {
    expect(keyFromEvent(ev('KeyR', { metaKey: true }))).toBeNull()
    expect(keyFromEvent(ev('KeyL', { ctrlKey: true }))).toBeNull()
    expect(shouldBlockDefault(ev('KeyR', { metaKey: true }))).toBe(false)
    expect(shouldBlockDefault(ev('Space'))).toBe(true)
  })
})
