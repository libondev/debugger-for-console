import type {
  Selection,
  TextDocument,
  TextEditor,
  TextEditorEdit,
} from 'vscode'

export interface InsertStatementParams {
  selection: Selection
  editor: TextEditor
  editBuilder: TextEditorEdit
}

export interface WrapperResolveParams {
  document: TextDocument
  selection: Selection
  lineNumber: number
  text: string
}
