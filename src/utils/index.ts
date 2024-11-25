import type { Range, TextDocument, TextLine } from 'vscode'
import { resolvedConfig } from '../extension'

export function lazyValue<Params>(
  configKey: string,
  generator: (configValue: string | boolean, params?: Params) => void | string | boolean,
) {
  let _generator = generator

  const getter = (params?: Params) => _generator(resolvedConfig.get(configKey)!, params)

  getter.update = () => {
    _generator = resolvedConfig.get(configKey) ? generator : () => ''
  }

  return getter
}

// This damn JavaScript language types
export const JAVASCRIPT_ALIAS = [
  'javascript', 'javascriptreact', 'svelte',
  'typescript', 'typescriptreact', 'vue',
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
export function getAllStatementRanges(document: TextDocument, commentSymbols: string) {
  const text = document.getText()

  if (!text.trim()) {
    return []
  }

  const matchRegexp = new RegExp(`^[${commentSymbols}[ ]*]*${getLanguageStatement(document).replace(/{VALUE}/, '.*?')}`, 'gm')

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
