import type { Range, Selection, TextDocument } from 'vscode'
import { resolvedConfig } from '../extension'
import {
  getFileDepth,
  getLineNumber,
  getRandomEmoji,
  getVariables,
  quote,
  semi,
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
  document: TextDocument,
  cursorLineNumber: number,
) {
  const spaceNumber = document.lineAt(cursorLineNumber).firstNonWhitespaceCharacterIndex

  return ' '.repeat(spaceNumber)
}

// This damn JavaScript language types
const JAVASCRIPT_ALIAS = ['javascript', 'typescript', 'javascriptreact', 'typescript', 'vue', 'svelte']
export function getLanguageStatement(document: TextDocument): string {
  const languageId = document.languageId

  if (JAVASCRIPT_ALIAS.includes(languageId)) {
    return resolvedConfig.get('wrappers.javascript')!
  } else {
    return resolvedConfig.get(`wrappers.${languageId}`) || resolvedConfig.get('wrappers.default')!
  }
}

export function getDebuggerStatement(document: TextDocument, selection: Selection, symbols: string) {
  const statement = getLanguageStatement(document)

  if (!statement) {
    throw new Error('No language statement found.')
  } else if (statement === 'debugger') {
    return `${statement}${semi}`
  }

  const text = getVariables(document, selection)

  return `${statement}(${quote.$}${getRandomEmoji()}${getFileDepth(document)}${
    getLineNumber(selection)}${symbols}「${text.replace(/['"`]/g, '')}」${quote.$}, ${text})${semi.$}\n`
}

export function getAllStatementRanges(document: TextDocument) {
  const text = document.getText()
  const regexp = new RegExp(getLanguageStatement(document), 'gm')

  let range: Range
  const statements = [...text.matchAll(regexp)].reduce((acc, match) => {
    // TODO: multiple line statements
    range = document.lineAt(document.positionAt(match.index!).line).range

    if (!range.isEmpty) {
      acc.push(range)
    }

    return acc
  }, [] as Range[])

  return statements
}
