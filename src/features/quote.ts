import { lazyValue } from '../utils/index'

const DOUBLE_QUOTE_LANGUAGES = ['go', 'csharp', 'rust', 'shellscript', 'java']

export const getQuote = lazyValue<string>(
  'quote',
  (quote, languageId) => DOUBLE_QUOTE_LANGUAGES.includes(languageId!)
    ? '"'
    : quote as string,
)
