import { ORDER, type Item } from './content'

/**
 * Renders the current item. Every element is created with textContent and
 * replaced in one go, so a fast mash never leaves half of the previous key
 * on screen.
 */
export function render(stage: HTMLElement, item: Item) {
  const card = document.createElement('div')
  card.className = `card card-${item.kind}`

  const glyph = document.createElement('div')
  glyph.className = 'glyph'
  glyph.textContent = item.key
  card.append(glyph)

  if (item.kind === 'letter') {
    const pic = document.createElement('div')
    pic.className = 'emoji'
    pic.textContent = item.emoji
    pic.setAttribute('aria-hidden', 'true')
    const word = document.createElement('div')
    word.className = 'word'
    word.textContent = item.word
    card.append(pic, word)
  } else {
    const word = document.createElement('div')
    word.className = 'word'
    word.textContent = item.word
    card.append(word, dots(item.count))
  }

  stage.replaceChildren(card)
  stage.setAttribute('aria-label', item.say.join(', '))

  // Each key gets its own soft background, so changes are easy to notice
  // without being loud.
  const hue = Math.round((ORDER.indexOf(item.key) / ORDER.length) * 360)
  document.documentElement.style.setProperty('--hue', String(hue))
}

/** Quantity as dots, grouped in fives so 6–9 are easy to see at a glance. */
function dots(count: number): HTMLElement {
  const wrap = document.createElement('div')
  wrap.className = 'dots'
  wrap.setAttribute('aria-hidden', 'true')
  for (let g = 0; g < Math.ceil(count / 5); g++) {
    const group = document.createElement('div')
    group.className = 'dot-group'
    for (let i = 0; i < Math.min(5, count - g * 5); i++) {
      const dot = document.createElement('span')
      dot.className = 'dot'
      dot.style.setProperty('--i', String(g * 5 + i))
      group.append(dot)
    }
    wrap.append(group)
  }
  return wrap
}
