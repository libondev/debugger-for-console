import { resolvedConfig } from '../config'

// 语句模板中的占位符，会被替换为实际的日志内容
export const VARIABLE_PLACEHOLDER = '{VALUE}'
export const VARIABLE_PLACEHOLDER_REGEX = new RegExp(VARIABLE_PLACEHOLDER, 'g')

// This damn JavaScript language types, who's next?
export const JAVASCRIPT_ALIAS = [
  'javascript',
  'javascriptreact',
  'typescript',
  'typescriptreact',
  'svelte',
  'astro',
  'html',
  'vue',
]

const DOUBLE_QUOTE_LANGUAGES = ['go', 'csharp', 'rust', 'shellscript', 'java']

const HASH_COMMENT_LANGUAGES = ['python', 'shellscript']

// 获取当前文档语言对应的调试语句模板
export function getLanguageStatement({ languageId }: { languageId: string }): string {
  if (JAVASCRIPT_ALIAS.includes(languageId)) {
    return resolvedConfig.get('wrappers.javascript')!
  }

  return resolvedConfig.get(`wrappers.${languageId}`) || resolvedConfig.get('wrappers.default')!
}

// 获取插入语句时使用的引号（部分语言只支持双引号）
export function getQuote(languageId: string) {
  const quote = resolvedConfig.get<string>('quote', "'")

  return DOUBLE_QUOTE_LANGUAGES.includes(languageId) ? '"' : quote
}

// 获取语言对应的注释符号
export function getCommentSymbol(languageId: string) {
  return HASH_COMMENT_LANGUAGES.includes(languageId) ? '#' : '//'
}
