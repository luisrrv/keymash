import { describe, expect, it } from 'vitest'
import { createHoldDetector } from './hold'

describe('hold detector', () => {
  const setup = () => {
    let t = 0
    const d = createHoldDetector('Escape', 2000, () => t)
    return { d, at: (ms: number) => (t = ms) }
  }

  it('fires only after the key is held long enough', () => {
    const { d, at } = setup()
    at(0)
    expect(d.down({ code: 'Escape' })).toBe(false)
    at(1999)
    expect(d.down({ code: 'Escape' })).toBe(false) // auto-repeat
    at(2000)
    expect(d.down({ code: 'Escape' })).toBe(true)
  })

  it('works without auto-repeat events, via held()', () => {
    const { d, at } = setup()
    at(0)
    d.down({ code: 'Escape' })
    at(2100)
    expect(d.held()).toBe(true)
  })

  it('a quick tap never fires', () => {
    const { d, at } = setup()
    at(0)
    d.down({ code: 'Escape' })
    at(300)
    d.up({ code: 'Escape' })
    at(5000)
    expect(d.held()).toBe(false)
    expect(d.down({ code: 'Escape' })).toBe(false)
  })

  it('another key during the hold starts over', () => {
    const { d, at } = setup()
    at(0)
    d.down({ code: 'Escape' })
    at(1500)
    d.down({ code: 'KeyA' }) // mashing while Esc is down
    at(2500)
    expect(d.held()).toBe(false)
  })
})
