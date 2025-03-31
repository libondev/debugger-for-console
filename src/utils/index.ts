import type { Range, TextDocument, TextLine } from 'vscode'
import { resolvedConfig } from '../extension'
import { getIsEllipsis } from '../features/output'

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

  const matchRegexp = new RegExp(`^[ \t]*[${symbols}[ \t]*]*${getLanguageStatement(document).replace(/{VALUE}/, '.*?')}`, 'gms')

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
