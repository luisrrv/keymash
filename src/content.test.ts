import { describe, expect, it } from 'vitest'
import { ITEMS, ORDER } from './content'

describe('content', () => {
  it('covers A–Z and 0–9, nothing else', () => {
    const keys = Object.keys(ITEMS).sort()
    expect(keys).toEqual([...'0123456789', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'])
    expect(ORDER).toHaveLength(36)
  })

  it('letters say the letter, then the word', () => {
    expect(ITEMS.A.say).toEqual(['A.', 'Apple'])
    expect(ITEMS.G).toMatchObject({ word: 'Goat', emoji: '🐐' })
    expect(ITEMS.X.say).toEqual(['X.', 'Fox'])
  })

  it('every letter word starts with its letter, except X', () => {
    for (const k of 'ABCDEFGHIJKLMNOPQRSTUVWYZ') expect(ITEMS[k]).toMatchObject({ word: expect.stringMatching(new RegExp(`^${k}`)) })
  })

  it('numbers carry their quantity', () => {
    expect(ITEMS['7']).toMatchObject({ kind: 'number', word: 'seven', count: 7, say: ['Seven'] })
    expect(ITEMS['0']).toMatchObject({ count: 0, say: ['Zero'] })
  })
})
