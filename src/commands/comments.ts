import { WorkspaceEdit, window, workspace } from 'vscode'
import { getAllStatementRanges, getLanguageStatement } from '../utils'
import { documentAutoSaver } from '../features'
import { COMMENT_TYPE } from '../syntax/comments'

async function toggle(type: 'comment' | 'uncomment' = 'comment') {
  const editor = window.activeTextEditor!

  const { document, document: { uri, languageId } } = editor
  // ignore statement indents
  const languageComment = COMMENT_TYPE[languageId as keyof typeof COMMENT_TYPE] || COMMENT_TYPE.default
  const regexp = new RegExp(`^[ ]*[${languageComment}[ ]*]*${getLanguageStatement(document).replace(/\$/, '.*?')}`, 'gm')

  const statements = getAllStatementRanges(document, regexp)

  if (!statements.length) {
    window.showInformationMessage('No statements found.')
    return
  }

  const workspaceEdit = new WorkspaceEdit()

  for (let i = 0; i < statements.length; i++) {
    const range = statements[i]
    const line = document.lineAt(range.start.line)

    const { firstNonWhitespaceCharacterIndex, text } = line

    const indents = text.slice(0, firstNonWhitespaceCharacterIndex)
    const content = text.slice(firstNonWhitespaceCharacterIndex)

    // TODO: multiline comment?
    if (type === 'comment' && !content.startsWith(languageComment)) {
      workspaceEdit.replace(uri, range, `${indents}${languageComment} ${content}`)
    } else if (type === 'uncomment' && content.startsWith(languageComment)) {
      workspaceEdit.replace(uri, range, `${indents}${content.replace(new RegExp(`${languageComment}[ ]*`), '')}`)
    }
  }

  await workspace.applyEdit(workspaceEdit)

  documentAutoSaver(editor)
}

export const commentDebuggers = toggle.bind(null, 'comment')

export const uncommentDebuggers = toggle.bind(null, 'uncomment')
