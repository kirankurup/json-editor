export function generateJSONPath(path: (string | number)[]): string {
  if (path.length === 0) return '$'

  return path.reduce((acc, segment) => {
    if (typeof segment === 'number') {
      return `${acc}[${segment}]`
    }
    return `${acc}.${segment}`
  }, '$')
}
