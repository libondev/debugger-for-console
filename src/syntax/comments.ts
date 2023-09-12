export const COMMENT_SYMBOLS = {
  python: '#',
  shellscript: '#',
  default: '//',
} as const

export type CommentSymbolsKeys = keyof typeof COMMENT_SYMBOLS
