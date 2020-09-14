export const range = (arg1, arg2) => {
  const [from, to] = arg2 === undefined ? [0, arg1] : [arg1, arg2]
  const n = to - from
  return Array.from(Array(n).keys()).map(idx => idx + from)
}
