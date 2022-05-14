import type {
  Selection,
  TextEditor,
  TextEditorEdit,
} from 'vscode'

export interface InsertStatementParams {
  selection: Selection
  editor: TextEditor
  editBuilder: TextEditorEdit
}
