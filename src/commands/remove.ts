import { window } from 'vscode'
import { getAllStatementRanges } from '../utils'

import { autoSave } from '../features/saver'
import { getComment } from '../features/comment'
import { smartToggleEditor } from '../utils/smart-editor'

export async function remove() {
  const editor = window.activeTextEditor

  if (!editor) {
    return
  }

  const { document, document: { languageId } } = editor

  const commentSymbols = getComment(languageId)

  const statements = getAllStatementRanges(document, commentSymbols)

  if (!statements.length) {
    return
  }

  const smartEditor = smartToggleEditor(statements.length > 1, document, editor)

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

    smartEditor.delete(lineRange.with(startRange, endRange))
  })

  await smartEditor.apply()

  autoSave(editor)
}
