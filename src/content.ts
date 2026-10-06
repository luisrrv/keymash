/**
 * What each key shows and says. Letters use words chosen by sound: each word
 * starts with the letter's most common sound (G → goat, C → cat). X is the
 * exception (fox), since almost no simple word starts with its "ks" sound.
 * Emoji come from older, widely supported sets so they render on most devices.
 */

/**
 * `say` is spoken as separate parts with a short pause between them, e.g.
 * ["ay", "Apple"].
 */
export type LetterItem = { kind: 'letter'; key: string; word: string; emoji: string; say: string[] }
export type NumberItem = { kind: 'number'; key: string; word: string; count: number; say: string[] }
export type Item = LetterItem | NumberItem

const LETTERS: [string, string, string][] = [
  ['A', 'Apple', '🍎'],
  ['B', 'Bear', '🐻'],
  ['C', 'Cat', '🐱'],
  ['D', 'Dog', '🐶'],
  ['E', 'Egg', '🥚'],
  ['F', 'Fish', '🐟'],
  ['G', 'Goat', '🐐'],
  ['H', 'Hat', '🎩'],
  ['I', 'Insect', '🐞'],
  ['J', 'Juice', '🧃'],
  ['K', 'Kite', '🪁'],
  ['L', 'Lion', '🦁'],
  ['M', 'Moon', '🌙'],
  ['N', 'Nose', '👃'],
  ['O', 'Octopus', '🐙'],
  ['P', 'Pig', '🐷'],
  ['Q', 'Queen', '👑'],
  ['R', 'Rocket', '🚀'],
  ['S', 'Sun', '☀️'],
  ['T', 'Turtle', '🐢'],
  ['U', 'Umbrella', '☂️'],
  ['V', 'Van', '🚐'],
  ['W', 'Whale', '🐳'],
  ['X', 'Fox', '🦊'],
  ['Y', 'Yo-yo', '🪀'],
  ['Z', 'Zebra', '🦓'],
]

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']

const capitalize = (s: string) => s[0].toUpperCase() + s.slice(1)

export const ITEMS: Record<string, Item> = {}

for (const [key, word, emoji] of LETTERS) {
  ITEMS[key] = { kind: 'letter', key, word, emoji, say: [`${key}.`, word] }
}

NUMBER_WORDS.forEach((word, n) => {
  ITEMS[String(n)] = { kind: 'number', key: String(n), word, count: n, say: [capitalize(word)] }
})

/** Position of a key in A–Z then 0–9, used to give each key its own gentle color. */
export const ORDER = [...LETTERS.map(([k]) => k), ...NUMBER_WORDS.map((_, n) => String(n))]
