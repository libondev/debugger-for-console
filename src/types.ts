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

export type Configurations = 'wrappers' | 'autoSave'

export type InsertPosition = 'before' | 'after'

export interface WrapperContentParams {
  document: TextDocument
  indents: string
  text: string
}

export interface WrapperResolveParams {
  lineNumber: number
  text: string
}
