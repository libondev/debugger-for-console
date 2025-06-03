import type { Range, TextDocument, TextLine } from 'vscode'
import { resolvedConfig } from '../extension'
import { getIsEllipsis } from '../features/output'

export const VARIABLE_PLACEHOLDER = '{VALUE}'
export const VARIABLE_PLACEHOLDER_REGEX = new RegExp(VARIABLE_PLACEHOLDER, 'g')

// This damn JavaScript language types
export const JAVASCRIPT_ALIAS = [
  'javascript', 'javascriptreact', 'svelte',
  'typescript', 'typescriptreact', 'vue', 'html',
]

// Get the statement corresponding to the language of the current document.
export function getLanguageStatement({ languageId }: TextDocument): string {
  if (JAVASCRIPT_ALIAS.includes(languageId)) {
    return resolvedConfig.get('wrappers.javascript')!
  }

  return resolvedConfig.get(`wrappers.${languageId}`) || resolvedConfig.get('wrappers.default')!
}

// Gets the start/end line of a multi-line statement.
function getMultiLineStatement(document: TextDocument, line: TextLine) {
  let nextLine = document.lineAt(line.lineNumber + 1)
  let count = 1

  while (count > 0) {
    nextLine.text.includes('(') && count++
    nextLine.text.includes(')') && count--

    count && (nextLine = document.lineAt(nextLine.lineNumber + 1))
  }

  return { start: line.range.start.line, end: nextLine.range.end.line }
}

// Get the start/end line of a single-line statement.
export function getAllStatementRanges(document: TextDocument, symbols: string) {
  const text = document.getText()

  if (!text.trim()) {
    return []
  }

  const matchRegexp = new RegExp(`^[ \t]*[${symbols}[ \t]*]*${
    getLanguageStatement(document)
    .replace(VARIABLE_PLACEHOLDER_REGEX, '.*?')
    .replace(/\(|\)|\[|\]|\{|\}/g, '\\$&')
   }`, 'gms')

  const matchedResults = [...text.matchAll(matchRegexp)]

  if (!matchedResults.length) {
    return []
  }

  // Matches the first statement in a line
  const singleLineRegexp = /\(.*?\)($)?/

  let line: TextLine
  const statements = matchedResults.reduce<Range[]>((acc, match) => {
    line = document.lineAt(document.positionAt(match.index!).line)

    // not have a '(' or is a single line statement. e.g. debugger
    if (
      singleLineRegexp.test(line.text) ||
      !line.text.includes('(')
    ) {
      acc.push(line.range)
    } else {
      // multi-line statement
      const { start, end } = getMultiLineStatement(document, line)

      // Push the range of the statement
      for (let i = start; i <= end; i++) {
        acc.push(document.lineAt(i).range)
      }
    }

    return acc
  }, [])

  return statements
}

// const ELLIPSIS_REGEX = /^(.{1}).*(.{3})$/
const ELLIPSIS_REGEX = /^(.{3}).*/
const ELLIPSIS_MAX_LENGTH = 10

// 获取精简后的字符串内容
export function getEllipsisString(str: string, trimQuotes?: boolean) {
  if (trimQuotes) {
    str = str.replace(/['"`\\]/g, '')
  }

  if (getIsEllipsis()) {
    let newStr = str

    if (newStr.length >= ELLIPSIS_MAX_LENGTH) {
      newStr = newStr.replace(ELLIPSIS_REGEX, '$1…')
    }

    return newStr
  }

  return str
}

// 转义正则表达式
export function escapeRegexp(string: string) {
  // return string.replace(' ', '\\s*').replace(/[.*+^?${}()|[\]\\]/g, '\\$&')
  // return string.replace(/[.+*^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s*')
  return string.replace(/[+^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s*')
}

export function generateBlockRegexp(symbols: string[]) {
  const symbol = symbols.map(s => escapeRegexp(s)).join('|')

  return new RegExp(`(?:${symbol})\\s*$`)
}

// 获取到当前行需要缩进的次数
export function getIndentCount(
  lineCount: number,
  insertLineNumber: number,
  nonBlankIndex: number,
) {
  // if first line(文档的第一行)
  if (insertLineNumber <= 0) {
    return 0
  } else if (insertLineNumber >= lineCount) {
    // if last line(最后一行)
    return -1
  }

  return nonBlankIndex
}

// 获取缩进类型
export function getIndentType(nonBlankIndex: number, text: string) {
  if (nonBlankIndex === 0) {
    return ' '
  }

  const firstChar = text.slice(0, 1) || ' '

  return firstChar
}

// 根据缩进大小和类型生成缩进字符串
export function getIndentString(count: number, indentType: string) {
  if (count <= 0) {
    return ''
  }

  return indentType.repeat(count)
}
