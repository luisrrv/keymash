/**
 * Speech for mashing. Three rules:
 *
 * 1. A new request cancels whatever is playing or waiting.
 * 2. Speech starts only after input pauses for `delayMs`. During a fast mash
 *    the screen keeps up with every key, but the voice waits and then says
 *    the last key in full, instead of cutting every word after one syllable.
 * 3. A request can have several parts (["A", "Apple"]). Each is its own
 *    utterance, with a `gapMs` pause in between.
 *
 * The delay also sidesteps a Chrome quirk where `speak()` called right after
 * `cancel()` is sometimes dropped.
 *
 * Kept behind this small interface so recorded audio can replace
 * speechSynthesis later without touching the rest of the app.
 */
export interface Speaker {
  /** Say these parts, in order, once input has been quiet for the delay. */
  request(parts: string[]): void
  /** Stop speaking and drop anything pending. */
  stop(): void
  /** Call from a user gesture: browsers only allow audio after one. */
  unlock(): void
}

type Synth = Pick<SpeechSynthesis, 'speak' | 'cancel' | 'getVoices'> & {
  addEventListener?: SpeechSynthesis['addEventListener']
}

type Options = {
  synth: Synth
  makeUtterance: (text: string) => SpeechSynthesisUtterance
  delayMs?: number
  gapMs?: number
  setTimer?: (fn: () => void, ms: number) => unknown
  clearTimer?: (t: unknown) => void
}

/** Prefer a clear US/UK English voice when the device has one. */
export function pickVoice(voices: readonly SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const english = voices.filter((v) => /^en[-_]/i.test(v.lang))
  const preferred = ['Samantha', 'Google US English', 'Karen', 'Daniel', 'Google UK English Female']
  for (const name of preferred) {
    const v = english.find((x) => x.name.includes(name))
    if (v) return v
  }
  return english.find((v) => /^en[-_]US/i.test(v.lang)) ?? english[0] ?? null
}

export function createSpeaker({
  synth,
  makeUtterance,
  delayMs = 200,
  gapMs = 450,
  setTimer = (fn, ms) => setTimeout(fn, ms),
  clearTimer = (t) => clearTimeout(t as ReturnType<typeof setTimeout>),
}: Options): Speaker {
  let timer: unknown = null
  // Bumped on every request/stop, so a finished utterance from an older
  // request can't start the next part of a newer one.
  let generation = 0
  // Voices often load after the page does.
  let voice = pickVoice(synth.getVoices())
  synth.addEventListener?.('voiceschanged', () => {
    voice = pickVoice(synth.getVoices()) ?? voice
  })

  const utter = (text: string, volume = 1) => {
    const u = makeUtterance(text)
    u.lang = voice?.lang ?? 'en-US'
    if (voice) u.voice = voice
    u.rate = 0.7 // clearly slower than default, for small listeners
    u.pitch = 1.1
    u.volume = volume
    return u
  }

  const stop = () => {
    generation++
    if (timer !== null) clearTimer(timer)
    timer = null
    synth.cancel()
  }

  const speakPart = (parts: string[], i: number, gen: number) => {
    timer = null
    const u = utter(parts[i])
    if (i < parts.length - 1) {
      u.onend = () => {
        if (gen !== generation) return
        timer = setTimer(() => speakPart(parts, i + 1, gen), gapMs)
      }
    }
    synth.speak(u)
  }

  return {
    request(parts) {
      stop()
      if (parts.length === 0) return
      const gen = generation
      timer = setTimer(() => speakPart(parts, 0, gen), delayMs)
    },
    stop,
    unlock() {
      // A silent utterance inside the click lets later speech play (needed on iOS/Safari).
      synth.speak(utter(' ', 0))
    },
  }
}
