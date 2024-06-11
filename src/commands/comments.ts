import type { Range } from 'vscode'
import { WorkspaceEdit, window, workspace } from 'vscode'
import { getAllStatementRanges } from '../utils'
import { autoSave } from '../features/saver'
import { getComment } from '../features/comment'

async function toggle(type: 'comment' | 'uncomment' = 'comment') {
  const editor = window.activeTextEditor!

  const { document, document: { uri, languageId } } = editor
  const commentSymbols = getComment(languageId)

  const statements = getAllStatementRanges(document, commentSymbols)

  if (!statements.length) {
    return
  }

  const workspaceEdit = new WorkspaceEdit()
  const commentRegexp = new RegExp(`${commentSymbols}[ ]*`)

  const replacer = type === 'comment'
    ? (range: Range, indents: string, content: string) => {
        !content.startsWith(commentSymbols) && workspaceEdit.replace(uri, range, `${indents}${commentSymbols} ${content}`)
      }
    : (range: Range, indents: string, content: string) => {
        content.startsWith(commentSymbols) && workspaceEdit.replace(uri, range, `${indents}${content.replace(commentRegexp, '')}`)
      }

  statements.forEach((range) => {
    const { firstNonWhitespaceCharacterIndex, text } = document.lineAt(range.start.line)

    const indents = text.slice(0, firstNonWhitespaceCharacterIndex)
    const content = text.slice(firstNonWhitespaceCharacterIndex)

    replacer(range, indents, content)
  })

  await workspace.applyEdit(workspaceEdit)

  autoSave(editor)
}

export const commentDebuggers = toggle.bind(null, 'comment')

export const uncommentDebuggers = toggle.bind(null, 'uncomment')
