import { resolvedConfig } from '../extension'

export function getNumberLine(lineNumber: number) {
  const configValue = resolvedConfig.get<boolean>('insertEmptyLine')

  if (configValue) {
    return `:${lineNumber}`
  }

  return ''
}
