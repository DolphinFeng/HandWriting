export const getNumberOption = (start: number = 1, end?: number) => {
  if (end < start) return []
  return new Array(end - start + 1).fill({}).map((_, index) => ({
    label: `${start + index}`,
    value: start + index
  }))
}
