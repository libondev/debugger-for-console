import { resolvedConfig } from '../extension'

const DOUBLE_QUOTE_LANGUAGES = ['go', 'csharp', 'rust', 'shellscript', 'java']

export function getQuote(languageId: string) {
  const quote = resolvedConfig.get<string>('quote', "'")

  return DOUBLE_QUOTE_LANGUAGES.includes(languageId!) ? '"' : quote
}
