import { describe, it, expect } from 'vitest'
import { flattenJSON } from './treeFlattener'

describe('flattenJSON', () => {
  it('flattens simple object', () => {
    const input = { name: 'John', age: 30 }
    const result = flattenJSON(input)

    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({
      key: 'name',
      value: 'John',
      type: 'primitive',
      depth: 0,
      path: ['name']
    })
    expect(result[1]).toMatchObject({
      key: 'age',
      value: 30,
      type: 'primitive',
      depth: 0,
      path: ['age']
    })
  })

  it('flattens nested object', () => {
    const input = {
      user: {
        name: 'John',
        age: 30
      }
    }
    const result = flattenJSON(input)

    expect(result).toHaveLength(3)
    expect(result[0].key).toBe('user')
    expect(result[0].type).toBe('object')
    expect(result[0].isExpanded).toBe(true)
    expect(result[1].key).toBe('name')
    expect(result[1].depth).toBe(1)
    expect(result[2].key).toBe('age')
  })

  it('flattens array', () => {
    const input = {
      users: ['Alice', 'Bob']
    }
    const result = flattenJSON(input)

    expect(result[0].key).toBe('users')
    expect(result[0].type).toBe('array')
    expect(result[1].key).toBe('0')
    expect(result[1].value).toBe('Alice')
    expect(result[2].key).toBe('1')
    expect(result[2].value).toBe('Bob')
  })

  it('truncates long string values', () => {
    const longString = 'a'.repeat(150)
    const input = { text: longString }
    const result = flattenJSON(input)

    expect(result[0].isTruncated).toBe(true)
    expect(result[0].value).toBe(longString)
  })

  it('respects expanded state', () => {
    const input = {
      user: { name: 'John' }
    }
    const expandedIds = new Set<string>()
    const result = flattenJSON(input, expandedIds)

    // When user object is not in expandedIds, its children should not appear
    const userNode = result.find(n => n.key === 'user')
    expect(userNode?.isExpanded).toBe(false)
  })
})
