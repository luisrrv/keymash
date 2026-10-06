# keymash

A keyboard toy for very small humans. Press a letter or a number and it fills the screen, with a picture and a voice.

A two-year-old kept trying to use my keyboard, so I made the keyboard do something.

## How it behaves

- **Letters `A–Z` and numbers `0–9` only.** Each letter shows a word that starts with its sound (G → goat), and the voice says the letter, pauses, then says the word ("A … apple"). Numbers show their quantity as dots.
- **Built for mashing.** The screen updates on every key. The voice waits for a short pause, then says the last key in full, so a fast mash doesn't turn into chopped-up syllables.
- **Held keys don't repeat.** Only the first press of a held key counts.
- **Every other key does nothing.** No errors, no scrolling, no browser quick-find.
- **Keys are read by physical position** (`event.code`), so Shift, Caps Lock, non-US layouts and an active Japanese IME all work the same.

## Local development

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # unit tests (Vitest)
npm run build    # type-check + production build to dist/
```

Requires Node 20.19+ (see `.nvmrc`).

## License

MIT
