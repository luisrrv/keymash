/**
 * Detects a key held down for a while (the parent's exit: hold Esc ~2 s).
 *
 * Works from keydown/keyup alone, so it behaves the same whether or not the
 * browser sends auto-repeat events while the key is held.
 */
export function createHoldDetector(code: string, holdMs: number, now: () => number = () => performance.now()) {
  let downAt: number | null = null

  return {
    /** Feed every keydown; returns true once the key has been held long enough. */
    down(e: { code: string }): boolean {
      if (e.code !== code) {
        downAt = null
        return false
      }
      downAt ??= now()
      return now() - downAt >= holdMs
    },
    /** Feed every keyup. */
    up(e: { code: string }) {
      if (e.code === code) downAt = null
    },
    /** Whether the key has been held long enough right now (for a timer check). */
    held(): boolean {
      return downAt !== null && now() - downAt >= holdMs
    },
    reset() {
      downAt = null
    },
  }
}
