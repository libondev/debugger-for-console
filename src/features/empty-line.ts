export function getBeforeEmptyLine(configValue: string, direction: string) {
  if (
    ['before', 'both'].includes(configValue)
    || (configValue === 'direction' && direction === 'before')
    || (configValue === 'directionReverse' && direction === 'after')
  ) {
    return '\n'
  }

  return ''
}

export function getAfterEmptyLine(configValue: string, direction: string) {
  if (
    ['after', 'both'].includes(configValue)
    || (configValue === 'direction' && direction === 'after')
    || (configValue === 'directionReverse' && direction === 'before')
  ) {
    return '\n'
  }

  return ''
}
