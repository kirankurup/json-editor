import { describe, it, expect } from 'vitest'
import { generateJSONPath } from './jsonPath'

describe('generateJSONPath', () => {
  it('generates path for root', () => {
    expect(generateJSONPath([])).toBe('$')
  })

  it('generates path for simple property', () => {
    expect(generateJSONPath(['users'])).toBe('$.users')
  })

  it('generates path for array index', () => {
    expect(generateJSONPath(['users', 0])).toBe('$.users[0]')
  })

  it('generates path for nested property', () => {
    expect(generateJSONPath(['users', 0, 'name'])).toBe('$.users[0].name')
  })

  it('generates path for complex nested structure', () => {
    expect(generateJSONPath(['data', 'items', 2, 'address', 'city']))
      .toBe('$.data.items[2].address.city')
  })
})
