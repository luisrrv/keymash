import './style.css'
import { ITEMS } from './content'
import { keyFromEvent, shouldBlockDefault } from './input'
import { render } from './view'
import { createSpeaker } from './speech'

const stage = document.getElementById('stage')!
const start = document.getElementById('start')!
const startButton = document.getElementById('start-button') as HTMLButtonElement

const speaker =
  'speechSynthesis' in window
    ? createSpeaker({ synth: window.speechSynthesis, makeUtterance: (t) => new SpeechSynthesisUtterance(t) })
    : null

let started = false

// The parent presses start: this one click is the user gesture browsers
// require before playing audio.
startButton.addEventListener('click', () => {
  started = true
  speaker?.unlock()
  start.hidden = true
  stage.hidden = false
  stage.focus()
})

window.addEventListener('keydown', (e) => {
  if (!started) {
    // Let the parent use Enter/Space on the start button.
    return
  }
  if (shouldBlockDefault(e)) e.preventDefault()

  const key = keyFromEvent(e)
  if (!key) return // every other key does nothing, and never shows an error
  const item = ITEMS[key]

  render(stage, item) // the screen updates on every key, immediately
  speaker?.request(item.say) // the voice waits for a short pause
})
