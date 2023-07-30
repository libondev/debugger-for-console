import type { Selection } from 'vscode'
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
  { document }: ActiveTextEditor,
  cursorLineNumber: number,
) {
  const spaceNumber = document.lineAt(cursorLineNumber).firstNonWhitespaceCharacterIndex

  return ' '.repeat(spaceNumber)
}

// This damn JavaScript language types
const JAVASCRIPT_ALIAS = ['javascript', 'typescript', 'javascriptreact', 'typescript', 'vue', 'svelte']
export function getLanguageStatement(editor: ActiveTextEditor): string {
  const languageId = editor.document.languageId

  if (JAVASCRIPT_ALIAS.includes(languageId)) {
    return resolvedConfig.get('wrappers.javascript')!
  } else {
    return resolvedConfig.get(`wrappers.${languageId}`) || resolvedConfig.get('wrappers.default')!
  }
}

export function getDebuggerStatement(editor: ActiveTextEditor, selection: Selection, symbols: string) {
  const statement = getLanguageStatement(editor)

  if (!statement) {
    throw new Error('No language statement found.')
  } else if (statement === 'debugger') {
    return `${statement}${semi}`
  }

  const text = getVariables(editor, selection)

  return `${statement}(${quote.$}${getRandomEmoji()}${getFileDepth(editor)}${
    getLineNumber(selection)}${symbols}「${text.replace(/['"`]/g, '')}」${quote.$}, ${text})${semi.$}\n`
}
