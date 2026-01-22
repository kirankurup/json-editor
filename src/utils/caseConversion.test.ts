import { describe, it, expect } from 'vitest'
import { convertCase, snakeToCamel, camelToSnake } from './caseConversion'

describe('snakeToCamel', () => {
  it('converts snake_case to camelCase', () => {
    expect(snakeToCamel('user_name')).toBe('userName')
    expect(snakeToCamel('first_name_last')).toBe('firstNameLast')
  })

  it('handles already camelCase', () => {
    expect(snakeToCamel('userName')).toBe('userName')
  })
})

describe('camelToSnake', () => {
  it('converts camelCase to snake_case', () => {
    expect(camelToSnake('userName')).toBe('user_name')
    expect(camelToSnake('firstName')).toBe('first_name')
  })

  it('handles already snake_case', () => {
    expect(camelToSnake('user_name')).toBe('user_name')
  })
})

describe('convertCase', () => {
  const input = {
    user_name: 'John',
    user_age: 30,
    user_address: {
      street_name: 'Main St',
      zip_code: '12345'
    }
  }

  it('converts deep snake_to_camel', () => {
    const result = convertCase(input, 'snake_to_camel', 'deep')
    expect(result).toEqual({
      userName: 'John',
      userAge: 30,
      userAddress: {
        streetName: 'Main St',
        zipCode: '12345'
      }
    })
  })

  it('converts shallow snake_to_camel', () => {
    const result = convertCase(input, 'snake_to_camel', 'shallow')
    expect(result).toEqual({
      userName: 'John',
      userAge: 30,
      userAddress: {
        street_name: 'Main St',
        zip_code: '12345'
      }
    })
  })

  it('handles arrays', () => {
    const arrayInput = {
      user_list: [
        { user_name: 'Alice' },
        { user_name: 'Bob' }
      ]
    }
    const result = convertCase(arrayInput, 'snake_to_camel', 'deep')
    expect(result).toEqual({
      userList: [
        { userName: 'Alice' },
        { userName: 'Bob' }
      ]
    })
  })
})
