# keymash

A keyboard toy for very small humans. Press a letter or a number and it fills the screen, with a picture and a voice.

A two-year-old kept trying to use my keyboard, so I made the keyboard do something.

## How it behaves

- **Letters `A–Z` and numbers `0–9` only.** Each letter shows a word that starts with its sound (G → goat), and the voice says the letter, pauses, then says the word ("A … apple"). Numbers show their quantity as dots.
- **Built for mashing.** The screen updates on every key. The voice waits for a short pause, then says the last key in full, so a fast mash doesn't turn into chopped-up syllables.
- **Held keys don't repeat.** Only the first press of a held key counts.
- **Every other key does nothing.** No errors, no scrolling, no browser quick-find.
- **Keys are read by physical position** (`event.code`), so Shift, Caps Lock, non-US layouts and an active Japanese IME all work the same.

## Parent mode

Pressing **start** enters fullscreen, unlocks audio, and turns on a set of guards so a mashing toddler is less likely to leave the app:

- **Exit by holding Esc for 2 seconds.** In Chrome and Edge, Keyboard Lock captures Esc (and shortcuts like Cmd/Ctrl+W) in fullscreen, and the browser itself asks for a long press. Other browsers leave fullscreen on a single Esc; the app keeps running in the window, and holding Esc still exits.
- **A "leave site?" prompt** if the tab is about to close.
- **Back is neutralized**, and trackpad swipe-navigation is turned off.
- **Clicks, right-clicks and scrolling are ignored**, and the cursor hides after 2 seconds.
- **The screen stays awake** while playing (Screen Wake Lock, where supported).

A browser can't block everything: Cmd+Q, Cmd+Tab and OS gestures still work. The goal is fewer accidental exits, not a locked-down kiosk.

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
