export function getLabelByValue(value, options) {
  const matched = options.find((item) => item.value === value)
  return matched ? matched.label : value
}

export function getColorByValue(value, options) {
  const matched = options.find((item) => item.value === value)
  return matched ? matched.color : 'default'
}
