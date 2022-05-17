import type { Range } from 'vscode'
import {
  type TextDocument,
  type TextEditor,
  WorkspaceEdit,
  window,
  workspace,
} from 'vscode'

import { getConfiguration, getDebuggerStatementByLanguage } from '../utils'

async function removeInsertedLogger(this: TextEditor) {
  const { document } = this
  const statementRanges = getAllStatementsByDocument(document)

  if (!statementRanges.length) {
    window.showInformationMessage('No logger statement found.')
    return
  }

  const workspaceEdit = new WorkspaceEdit()
  statementRanges.forEach((statement) => {
    workspaceEdit.delete(document.uri, statement)
  })

  await workspace.applyEdit(workspaceEdit)
  getConfiguration('autoSave') && document.save()
  window.showInformationMessage('Remove all logger success.')
}

// Get all debugging statements in the document
// 在文档中获取所有的调试语句
function getAllStatementsByDocument(document: TextDocument) {
  const content = document.getText()
  const regexp = new RegExp(
    `${getDebuggerStatementByLanguage(document)
      .replace(/\./g, '\\.')
      .replace(/\(.*?\)/, '\\(.*?\\)')}\\s*;?\\s*`,
    'gm',
  )

  const statements: Range[] = []

  let match: RegExpExecArray | null, range: Range

  do {
    match = regexp.exec(content)

    if (!match) {
      continue
    }

    range = document.lineAt(document.positionAt(match.index)).range

    !range.isEmpty && statements.push(range)
  } while (match)

  return statements
}

export default removeInsertedLogger
