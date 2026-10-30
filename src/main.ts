import './style.css'
import { ITEMS } from './content'
import { keyFromEvent, shouldBlockDefault } from './input'
import { render } from './view'
import { createSpeaker } from './speech'
import { createToddlerMode } from './parent'

const stage = document.getElementById('stage')!
const start = document.getElementById('start')!
const startButton = document.getElementById('start-button') as HTMLButtonElement
const exitHint = document.getElementById('exit-hint')!

const speaker =
  'speechSynthesis' in window
    ? createSpeaker({ synth: window.speechSynthesis, makeUtterance: (t) => new SpeechSynthesisUtterance(t) })
    : null

const toddler = createToddlerMode({
  onExit() {
    speaker?.stop()
    stage.hidden = true
    stage.replaceChildren()
    exitHint.classList.remove('show')
    start.hidden = false
    startButton.textContent = 'start again'
    startButton.focus()
  },
})

// The parent presses start. This one click is the user gesture browsers
// require for fullscreen, Keyboard Lock and audio, so all three happen here.
startButton.addEventListener('click', () => {
  speaker?.unlock()
  start.hidden = true
  stage.hidden = false
  stage.focus()
  void toddler.enter()
  // A quiet reminder for the parent, gone after a few seconds.
  exitHint.classList.add('show')
  setTimeout(() => exitHint.classList.remove('show'), 4000)
})

window.addEventListener('keydown', (e) => {
  if (!toddler.isActive()) {
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
