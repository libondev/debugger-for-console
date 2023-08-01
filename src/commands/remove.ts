import { WorkspaceEdit, window, workspace } from 'vscode'
import { getAllStatementRanges, getLanguageStatement } from '../utils'
import { documentAutoSaver } from '../features'
import { COMMENT_TYPE } from '../syntax/comments'

export async function removeDebuggers() {
  const editor = window.activeTextEditor!

  const { document, document: { uri, languageId } } = editor

  const languageComment = COMMENT_TYPE[languageId as keyof typeof COMMENT_TYPE] || COMMENT_TYPE.default
  const regexp = new RegExp(`^\\s*[${languageComment}\\s*]*${getLanguageStatement(document).replace(/\$/, '.*?')}`, 'gm')

  const matchStatements = getAllStatementRanges(document, regexp)

  if (!matchStatements.length) {
    window.showInformationMessage('No debugger statements found.')
    return
  }

  const workspaceEdit = new WorkspaceEdit()
  matchStatements.forEach((statementRange) => {
    workspaceEdit.delete(uri, statementRange)
    workspaceEdit.delete(uri, statementRange.with(statementRange.start.with(statementRange.start.line + 1, 0)))
  })

  await workspace.applyEdit(workspaceEdit)

  documentAutoSaver(editor)
}
