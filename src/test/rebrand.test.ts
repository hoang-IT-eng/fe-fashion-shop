import { describe, it, expect } from 'vitest'
import { rebrand } from '../lib/format'

describe('rebrand display shim', () => {
  it('maps legacy brand words from live API rows to NOCTURNE', () => {
    expect(rebrand('ENIGMA 01 "Obsidian Monolith" High-Top')).toBe('NOCTURNE 01 "Obsidian Monolith" High-Top')
    expect(rebrand('Reborn Horsehide Flight Bomber')).toBe('Afterlife Horsehide Flight Bomber')
    expect(rebrand('REBORN BY ENIGMA')).toBe('AFTERLIFE BY NOCTURNE')
  })
  it('leaves unrelated words and identifiers alone', () => {
    expect(rebrand('enigma_vault_state_v1')).toBe('enigma_vault_state_v1')
    expect(rebrand('Enigmatic trench')).toBe('Enigmatic trench')
    expect(rebrand(undefined)).toBe('')
  })
})
