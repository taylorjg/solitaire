export const range = (arg1, arg2) => {
  const [from, to] = arg2 === undefined ? [0, arg1] : [arg1, arg2]
  const n = to - from
  return Array.from(Array(n).keys()).map(idx => idx + from)
}

export const zipWithIndex = xs =>
  Array.from(xs.entries())

export const delay = ms =>
  new Promise(resolve => setTimeout(resolve, ms))
