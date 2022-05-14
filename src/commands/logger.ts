import type {
  ExtensionContext,
  TextEditor,
  TextEditorEdit,
} from 'vscode'

import {
  insertStatementToSelection,
} from '../utils'

export default function logger(
  this: ExtensionContext,
  editor: TextEditor,
) {
  editor.edit((editBuilder: TextEditorEdit) => {
    editor.selections.forEach((selection) => {
      insertStatementToSelection({ selection, editor, editBuilder })
    })
  })
}
