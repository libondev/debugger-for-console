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

export type InsertPosition = 'before' | 'after'

export interface WrapperContentParams {
  document: TextDocument
  insertLineNumber: number
  indents: string
  text: string
}

export interface WrapperResolveParams {
  lineNumber: number
  text: string
}
