import type { Range, TextDocument, TextLine } from 'vscode'
import { resolvedConfig } from '../extension'

export function lazyValue<Params>(
  configKey: string,
  generator: (config: string | boolean, params?: Params) => string | void,
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

export function getLanguageStatement({ languageId }: TextDocument): string {
  if (JAVASCRIPT_ALIAS.includes(languageId)) {
    return resolvedConfig.get('wrappers.javascript')!
  } else {
    return resolvedConfig.get(`wrappers.${languageId}`) || resolvedConfig.get('wrappers.default')!
  }
}

function getMultiLineStatement(document: TextDocument, line: TextLine) {
  let nextLine = document.lineAt(line.lineNumber + 1)
  let count = 1

  while (count > 0) {
    nextLine.text.includes('(') && count++
    nextLine.text.includes(')') && count--

    count && (nextLine = document.lineAt(nextLine.lineNumber + 1))
  }

  return [line.range.start.line, nextLine.range.end.line]
}

export function getAllStatementRanges(document: TextDocument, regexp: RegExp) {
  const text = document.getText()

  // Matches the first statement in a line
  const singleLineRegexp = /\(.*?\)/

  let line: TextLine
  const statements = [...text.matchAll(regexp)].reduce((acc, match) => {
    line = document.lineAt(document.positionAt(match.index!).line)

    // not have a '(' or is a single line statement
    if (singleLineRegexp.test(line.text) || !line.text.includes('(')) {
      acc.push(line.range)
    } else {
    // multi-line statement
      const [start, end] = getMultiLineStatement(document, line)

      // Push the range of the statement
      for (let i = start; i <= end; i++) {
        acc.push(document.lineAt(i).range)
      }
    }

    return acc
  }, [] as Range[])

  return statements
}
