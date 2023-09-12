import { WorkspaceEdit, window, workspace } from 'vscode'
import { getAllStatementRanges, getLanguageStatement } from '../utils'
import { documentAutoSaver } from '../features'
import { COMMENT_SYMBOLS, type CommentSymbolsKeys } from '../syntax/comments'

export async function removeDebuggers() {
  const editor = window.activeTextEditor!

  const { document, document: { uri, languageId } } = editor

  const languageComment = COMMENT_SYMBOLS[languageId as CommentSymbolsKeys] || COMMENT_SYMBOLS.default
  const regexp = new RegExp(`^[ ]*[${languageComment}[ ]*]*${getLanguageStatement(document).replace(/\$/, '.*?')}`, 'gm')

  const statements = getAllStatementRanges(document, regexp)

  if (!statements.length) {
    window.showInformationMessage('No statements matching the rule were found.')
    return
  }

  const workspaceEdit = new WorkspaceEdit()

  statements.forEach((range) => {
    const deleteRange = range.with(undefined, range.start.with(range.start.line + 1, 0))
    workspaceEdit.delete(uri, deleteRange)
  })

  await workspace.applyEdit(workspaceEdit)

  documentAutoSaver(editor)
}
