import { WorkspaceEdit, window, workspace } from 'vscode'
import { getAllStatementRanges, getLanguageStatement } from '../utils'
import { documentAutoSaver } from '../features'
import { COMMENT_TYPE } from '../syntax/comments'

async function toggle(type: 'comment' | 'uncomment' = 'comment') {
  const editor = window.activeTextEditor!

  const { document, document: { uri, languageId } } = editor
  const languageComment = COMMENT_TYPE[languageId as keyof typeof COMMENT_TYPE] || COMMENT_TYPE.default

  // ignore statement indents
  const regexp = new RegExp(
    `^[ ]*[${languageComment}[ ]*]*${getLanguageStatement(document).replace(/\$/, '.*?')}`,
    'gm',
  )

  const ranges = getAllStatementRanges(document, regexp)

  if (!ranges.length) {
    window.showInformationMessage('No statements found.')
    return
  }

  const workspaceEdit = new WorkspaceEdit()

  ranges.forEach((range) => {
    const line = document.lineAt(range.start.line)

    const { firstNonWhitespaceCharacterIndex, text } = line

    const indents = text.slice(0, firstNonWhitespaceCharacterIndex)
    const content = text.slice(firstNonWhitespaceCharacterIndex)

    if (type === 'comment' && !content.startsWith(languageComment)) {
      workspaceEdit.replace(uri, range, `${indents}${languageComment} ${content}`)
    } else if (type === 'uncomment' && content.startsWith(languageComment)) {
      workspaceEdit.replace(uri, range, `${indents}${content.replace(new RegExp(`${languageComment}[ ]*`), '')}`)
    }
  })

  await workspace.applyEdit(workspaceEdit)

  documentAutoSaver(editor)
}

export const commentDebuggers = toggle.bind(null, 'comment')

export const uncommentDebuggers = toggle.bind(null, 'uncomment')
