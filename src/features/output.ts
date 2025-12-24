import { resolvedConfig } from '../extension'

export function getIsEllipsis() {
  return resolvedConfig.get<boolean>('ellipsis', false)
}

export function getOutputNewline() {
  return resolvedConfig.get<boolean>('outputNewline', false) ? '\\n' : ''
}

const ONLY_OUTPUT_ONE_PARAMETER_LANGUAGE_ID = ['java']

export function getOnlyVariable(languageId: string) {
  const isOnlyVariable = resolvedConfig.get<string>('onlyVariable', 'auto')

  return isOnlyVariable === 'enable' || ONLY_OUTPUT_ONE_PARAMETER_LANGUAGE_ID.includes(languageId!)
}
