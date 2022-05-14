import { Range, workspace } from 'vscode'
import type {
  Selection,
  TextDocument,
  TextEditor,
  WorkspaceConfiguration,
} from 'vscode'
import { commandPrefix } from './constants'
import type { InsertStatementParams } from './types'

// Gets the configuration items for the plug-in in the workspace
export function getConfiguration<T extends Record<string, string>>(
  configKey: keyof WorkspaceConfiguration,
) {
  return workspace.getConfiguration(`${commandPrefix}.${configKey}`) as unknown as T
}

// Gets the active text editor tab size
export function getTabSize(editor: TextEditor) {
  const tabSize = editor.options.tabSize
  if (tabSize && typeof tabSize === 'number') {
    return tabSize
  } else if (tabSize && typeof tabSize === 'string') {
    return parseInt(tabSize)
  } else {
    return 4
  }
}

export function getIndentsByLineNumber(editor: TextEditor, lineNumber: number) {
  const doc = editor.document

  if (doc.lineCount > lineNumber && lineNumber >= 0)
    return (doc.lineAt(lineNumber).text.match(/^\s+/) || ['']).shift()

  return ''
}

export function getDocumentTextBySelection(document: TextDocument, selection: Selection) {
  return document.getText(new Range(selection.start, selection.end))
}

// Reading the configuration returns the corresponding language statement
export function getStatementByLanguage(language: string, text = '') {
  const wrappers = getConfiguration('wrappers')
  const statement = wrappers[language] || wrappers.default

  text = text.trim()
  const label = text.replace(/\r\n/g, ',').replace(/(\"|'|`)/g, '\\$1')

  return statement
    .replace(/\#label/g, label)
    .replace(/\#value/g, text.replace(/\r\n/g, ',\n'))
}

export function insertStatementToSelection({
  editor,
  editBuilder,
  selection,
  editor: { document },
}: InsertStatementParams) {
  const {
    text: selectionText,
    range: insertPosition,
  } = document.lineAt(selection.end.line)
  const indent = getIndentsByLineNumber(editor, selection.end.line)
  const statement = getStatementByLanguage(
    document.languageId,
    getDocumentTextBySelection(document, selection),
  )

  editBuilder.replace(
    insertPosition,
    `${selectionText}\n${indent}${statement}`,
  )
}
