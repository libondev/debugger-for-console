import type { Range, Selection, TextDocument, TextLine } from 'vscode'
import { resolvedConfig } from '../extension'
import {
  getFileDepth,
  getLineNumber,
  getRandomEmoji,
  getVariables,
  quote,
} from '../features'

export function lazyValue<Value>() {
  let _value: Value

  return {
    get $() {
      return _value
    },
    update(newValue: Value) {
      _value = newValue
    },
  }
}

export function getInsertLineIndents(
  { lineAt }: TextDocument,
  cursorLineNumber: number,
) {
  let { firstNonWhitespaceCharacterIndex } = lineAt(cursorLineNumber)

  // If the line is empty, get the indent of the previous line
  if (firstNonWhitespaceCharacterIndex === 0) {
    ({ firstNonWhitespaceCharacterIndex } = lineAt(cursorLineNumber - 1))
  }

  return ' '.repeat(firstNonWhitespaceCharacterIndex)
}

// This damn JavaScript language types
export const JAVASCRIPT_ALIAS = [
  'javascript', 'javascriptreact', 'typescript',
  'typescriptreact', 'vue', 'svelte',
]

export function getLanguageStatement({ languageId }: TextDocument): string {
  if (JAVASCRIPT_ALIAS.includes(languageId)) {
    return resolvedConfig.get('wrappers.javascript')!
  } else {
    return resolvedConfig.get(`wrappers.${languageId}`) || resolvedConfig.get('wrappers.default')!
  }
}

export function getDebuggerStatement(
  document: TextDocument,
  selection: Selection,
  scopeSymbols: string,
) {
  const statement = getLanguageStatement(document)

  if (!statement) {
    throw new Error('No language statement found.')
  } else if (statement.includes('$')) {
    const text = getVariables(document, selection)

    const content = `${quote.$}${getRandomEmoji()}${getFileDepth(document)}${
      getLineNumber(selection)}${scopeSymbols}【${text.replace(/['"`]/g, '')}】${quote.$}, ${text}`

    return `${statement.replace(/\$/g, content)}\n`
  }

  return `${statement}\n`
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

    if (singleLineRegexp.test(line.text)) {
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
