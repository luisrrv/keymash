import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createSpeaker, pickVoice } from './speech'

type FakeUtterance = { text: string; volume: number; onend: (() => void) | null }

function setup() {
  const spoken: string[] = []
  const queue: FakeUtterance[] = []
  const synth = {
    speak: vi.fn((u: FakeUtterance) => {
      if (u.volume > 0) {
        spoken.push(u.text)
        queue.push(u)
      }
    }),
    cancel: vi.fn(),
    getVoices: () => [] as SpeechSynthesisVoice[],
  }
  const speaker = createSpeaker({
    synth: synth as never,
    makeUtterance: (text) => ({ text, onend: null }) as unknown as SpeechSynthesisUtterance,
    delayMs: 200,
    gapMs: 450,
  })
  /** Pretend the voice finished the oldest utterance. */
  const finish = () => queue.shift()?.onend?.()
  return { synth, speaker, spoken, finish }
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('speaker', () => {
  it('waits for a pause, then says only the last key', () => {
    const { speaker, spoken } = setup()
    for (const k of 'ABCDE') {
      speaker.request([k])
      vi.advanceTimersByTime(80) // mashing: 80 ms between keys
    }
    expect(spoken).toEqual([])
    vi.advanceTimersByTime(200)
    expect(spoken).toEqual(['E'])
  })

  it('says the letter, pauses, then says the word', () => {
    const { speaker, spoken, finish } = setup()
    speaker.request(['A', 'Apple'])
    vi.advanceTimersByTime(200)
    expect(spoken).toEqual(['A'])
    finish()
    vi.advanceTimersByTime(449)
    expect(spoken).toEqual(['A'])
    vi.advanceTimersByTime(1)
    expect(spoken).toEqual(['A', 'Apple'])
  })

  it('a new key during the pause drops the old word', () => {
    const { speaker, spoken, finish } = setup()
    speaker.request(['A', 'Apple'])
    vi.advanceTimersByTime(200)
    finish()
    speaker.request(['B', 'Bear'])
    vi.advanceTimersByTime(1000)
    expect(spoken).toEqual(['A', 'B'])
  })

  it('an old utterance finishing late does not resume the old request', () => {
    const { speaker, spoken, finish } = setup()
    speaker.request(['A', 'Apple'])
    vi.advanceTimersByTime(200)
    speaker.request(['7'])
    finish() // "A" reports its end after "7" was requested
    vi.advanceTimersByTime(1000)
    expect(spoken).toEqual(['A', '7'])
  })

  it('cancels whatever is playing on every new key', () => {
    const { speaker, synth } = setup()
    speaker.request(['A'])
    vi.advanceTimersByTime(300)
    speaker.request(['B'])
    expect(synth.cancel).toHaveBeenCalledTimes(2)
  })

  it('stop drops pending speech', () => {
    const { speaker, spoken } = setup()
    speaker.request(['A'])
    speaker.stop()
    vi.advanceTimersByTime(500)
    expect(spoken).toEqual([])
  })

  it('unlock speaks silently', () => {
    const { speaker, synth, spoken } = setup()
    speaker.unlock()
    expect(synth.speak).toHaveBeenCalledTimes(1)
    expect(spoken).toEqual([])
  })
})

describe('pickVoice', () => {
  const v = (name: string, lang: string) => ({ name, lang }) as SpeechSynthesisVoice
  it('prefers known clear English voices, then any en-US, then any English', () => {
    expect(pickVoice([v('Kyoko', 'ja-JP'), v('Samantha', 'en-US')])?.name).toBe('Samantha')
    expect(pickVoice([v('Kyoko', 'ja-JP'), v('Other', 'en-GB'), v('Fred', 'en-US')])?.name).toBe('Fred')
    expect(pickVoice([v('Kyoko', 'ja-JP')])).toBeNull()
  })
})
