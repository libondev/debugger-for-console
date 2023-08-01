import type { Range, Selection, TextDocument } from 'vscode'
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
      getLineNumber(selection)}${scopeSymbols}「${text.replace(/['"`]/g, '')}」${quote.$}, ${text}`

    return `${statement.replace(/\$/g, content)}\n`
  }

  return `${statement}\n`
}

export function getAllStatementRanges(document: TextDocument, regexp: RegExp) {
  const text = document.getText()

  let range: Range
  const statements = [...text.matchAll(regexp)].reduce((acc, match) => {
    range = document.lineAt(document.positionAt(match.index!).line).range

    if (!range.isEmpty) {
      acc.push(range)
    }

    return acc
  }, [] as Range[])

  return statements
}
