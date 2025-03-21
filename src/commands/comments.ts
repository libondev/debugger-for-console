import type { Range } from 'vscode'
import { window } from 'vscode'
import { getAllStatementRanges } from '../utils'
import { getCommentSymbol } from '../features/comment-symbol'
import { smartToggleEditor } from '../utils/smart-editor'

async function toggle(type: 'comment' | 'uncomment' = 'comment') {
  const editor = window.activeTextEditor

  if (!editor) {
    return
  }

  const { document, document: { languageId } } = editor
  const commentSymbols = getCommentSymbol(languageId)

  const statements = getAllStatementRanges(document, commentSymbols)

  if (!statements.length) {
    return
  }

  const commentRegexp = new RegExp(`${commentSymbols}[ ]*`)

  const smartEditor = smartToggleEditor(statements.length > 1, document, editor)

  const replacer = {
    comment: (range: Range, indents: string, content: string) => {
      !content.startsWith(commentSymbols)
        && smartEditor.replace(range, `${indents}${commentSymbols} ${content}`)
    },
    uncomment: (range: Range, indents: string, content: string) => {
      content.startsWith(commentSymbols)
        && smartEditor.replace(range, `${indents}${content.replace(commentRegexp, '')}`)
    },
  }[type]

  statements.forEach((range) => {
    const { firstNonWhitespaceCharacterIndex, text } = document.lineAt(range.start.line)

    const indents = text.slice(0, firstNonWhitespaceCharacterIndex)
    const content = text.slice(firstNonWhitespaceCharacterIndex)

    replacer(range, indents, content)
  })

  smartEditor.applyEdit()
}

export const comment = toggle.bind(null, 'comment')

export const uncomment = toggle.bind(null, 'uncomment')
