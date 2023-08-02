import { WorkspaceEdit, window, workspace } from 'vscode'
import { getAllStatementRanges, getLanguageStatement } from '../utils'
import { documentAutoSaver } from '../features'
import { COMMENT_SYMBOLS } from '../syntax/comments'

async function toggle(type: 'comment' | 'uncomment' = 'comment') {
  const editor = window.activeTextEditor!

  const { document, document: { uri, languageId } } = editor
  const commentSymbols = COMMENT_SYMBOLS[languageId as keyof typeof COMMENT_SYMBOLS] || COMMENT_SYMBOLS.default
  const languageRegexp = new RegExp(
    `^[ ]*[${commentSymbols}[ ]*]*${getLanguageStatement(document).replace(/\$/, '.*?')}`,
    'gm',
  )

  const statements = getAllStatementRanges(document, languageRegexp)

  if (!statements.length) {
    window.showInformationMessage('No statements matching the rule were found.')
    return
  }

  const workspaceEdit = new WorkspaceEdit()
  const commentRegexp = new RegExp(`${commentSymbols}[ ]*`)

  statements.forEach((range) => {
    const { firstNonWhitespaceCharacterIndex, text } = document.lineAt(range.start.line)

    const indents = text.slice(0, firstNonWhitespaceCharacterIndex)
    const content = text.slice(firstNonWhitespaceCharacterIndex)

    if (type === 'comment' && !content.startsWith(commentSymbols)) {
      workspaceEdit.replace(uri, range, `${indents}${commentSymbols} ${content}`)
    } else if (type === 'uncomment' && content.startsWith(commentSymbols)) {
      workspaceEdit.replace(uri, range, `${indents}${content.replace(commentRegexp, '')}`)
    }
  })

  await workspace.applyEdit(workspaceEdit)

  documentAutoSaver(editor)
}

export const commentDebuggers = toggle.bind(null, 'comment')

export const uncommentDebuggers = toggle.bind(null, 'uncomment')
