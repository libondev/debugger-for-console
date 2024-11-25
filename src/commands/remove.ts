import { WorkspaceEdit, window, workspace } from 'vscode'
import { getAllStatementRanges } from '../utils'

import { autoSave } from '../features/saver'
import { getComment } from '../features/comment'

export async function remove() {
  const editor = window.activeTextEditor!

  const { document, document: { uri, languageId } } = editor

  const commentSymbols = getComment(languageId)

  const statements = getAllStatementRanges(document, commentSymbols)

  if (!statements.length) {
    return
  }

  const workspaceEdit = new WorkspaceEdit()

  statements.forEach((lineRange) => {
    let startRange = lineRange.start
    let endRange = lineRange.end

    const [beforeLine, afterLine] = [
      document.lineAt(startRange.line - 1),
      document.lineAt(endRange.line + 1),
    ]

    // before empty line
    if (beforeLine.range.isEmpty) {
      startRange = beforeLine.range.start
    }

    // after empty line
    if (afterLine.range.isEmpty) {
      endRange = afterLine.range.end
    }

    const deleteRange = lineRange.with(startRange, endRange)

    workspaceEdit.delete(uri, deleteRange)
  })

  await workspace.applyEdit(workspaceEdit)

  autoSave(editor)
}
