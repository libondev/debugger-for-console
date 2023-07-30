import type { Range, TextDocument } from 'vscode'
import { WorkspaceEdit, window, workspace } from 'vscode'
import { getLanguageStatement } from '../utils'
import { documentAutoSaver } from '../features'

function getStatements(document: TextDocument, regexp: RegExp) {
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

export async function removeDebuggers() {
  const editor = window.activeTextEditor!

  const matchStatements = getStatements(editor.document, new RegExp(getLanguageStatement(editor), 'gm'))

  if (!matchStatements.length) {
    window.showInformationMessage('No debugger statements found.')
    return
  }

  const workspaceEdit = new WorkspaceEdit()
  matchStatements.forEach((statement) => {
    const lineRange = statement.with(statement.start.with(statement.start.line + 1, 0))
    workspaceEdit.delete(editor.document.uri, statement)
    workspaceEdit.delete(editor.document.uri, lineRange)
  })

  await workspace.applyEdit(workspaceEdit)

  documentAutoSaver(editor)
}
