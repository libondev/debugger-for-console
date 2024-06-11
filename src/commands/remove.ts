import { WorkspaceEdit, window, workspace } from 'vscode'
import { getAllStatementRanges } from '../utils'

import { autoSave } from '../features/saver'
import { getComment } from '../features/comment'

export async function removeDebuggers() {
  const editor = window.activeTextEditor!

  const { document, document: { uri, languageId } } = editor

  const commentSymbols = getComment(languageId)

  const statements = getAllStatementRanges(document, commentSymbols)

  if (!statements.length) {
    return
  }

  const workspaceEdit = new WorkspaceEdit()

  statements.forEach((range) => {
    const deleteRange = range.with(undefined, range.start.with(range.start.line + 1, 0))
    workspaceEdit.delete(uri, deleteRange)
  })

  await workspace.applyEdit(workspaceEdit)

  autoSave(editor)
}
