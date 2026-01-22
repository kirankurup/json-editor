export function generateJSONPath(path: (string | number)[]): string {
  if (path.length === 0) return '$'

  return path.reduce<string>((acc, segment) => {
    if (typeof segment === 'number') {
      return `${acc}[${segment}]`
    }
    return `${acc}.${segment}`
  }, '$')
}
