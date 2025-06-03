import { Position, Range, window } from 'vscode'
import { getAllStatementRanges } from '../utils/shared'

import { getCommentSymbol } from '../features/comment-symbol'
import { smartToggleEditor } from '../utils/smart-editor'

export async function remove() {
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

  const smartEditor = smartToggleEditor(statements.length > 1, document, editor)

  statements.forEach((line) => {
    // delete the whole line
    const startRange = new Position(line.start.line, 0)
    const endRange = new Position(line.start.line + 1, 0)

    // position to range
    const range = new Range(startRange, endRange)

    smartEditor.delete(range)
  })

  smartEditor.applyEdit()
}
