import { WorkspaceEdit, window, workspace } from 'vscode'
import { getAllStatementRanges } from '../utils'
import { documentAutoSaver } from '../features'

export async function removeDebuggers() {
  const editor = window.activeTextEditor!

  const { document, document: { uri } } = editor

  const matchStatements = getAllStatementRanges(document)

  if (!matchStatements.length) {
    window.showInformationMessage('No debugger statements found.')
    return
  }

  const workspaceEdit = new WorkspaceEdit()
  matchStatements.forEach((statement) => {
    const lineRange = statement.with(statement.start.with(statement.start.line + 1, 0))
    workspaceEdit.delete(uri, statement)
    workspaceEdit.delete(uri, lineRange)
  })

  await workspace.applyEdit(workspaceEdit)

  documentAutoSaver(editor)
}
