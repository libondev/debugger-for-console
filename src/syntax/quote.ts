export const QUOTE_SYMBOLS = {
  go: '"',
  csharp: '"',
  rust: '"',
  shellscript: '"',
} as const

export type QuoteSymbolsKeys = keyof typeof QUOTE_SYMBOLS
