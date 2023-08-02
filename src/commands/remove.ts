import { WorkspaceEdit, window, workspace } from 'vscode'
import { getAllStatementRanges, getLanguageStatement } from '../utils'
import { documentAutoSaver } from '../features'
import { COMMENT_TYPE } from '../syntax/comments'

export async function removeDebuggers() {
  const editor = window.activeTextEditor!

  const { document, document: { uri, languageId } } = editor

  const languageComment = COMMENT_TYPE[languageId as keyof typeof COMMENT_TYPE] || COMMENT_TYPE.default
  const regexp = new RegExp(`^[ ]*[${languageComment}[ ]*]*${getLanguageStatement(document).replace(/\$/, '.*?')}`, 'gm')

  const ranges = getAllStatementRanges(document, regexp)

  if (!ranges.length) {
    window.showInformationMessage('No debugger statements found.')
    return
  }

  const workspaceEdit = new WorkspaceEdit()
  ranges.forEach((range) => {
    workspaceEdit.delete(uri, range)
    workspaceEdit.delete(uri, range.with(range.start.with(range.start.line + 1, 0)))
  })

  await workspace.applyEdit(workspaceEdit)

  documentAutoSaver(editor)
}
