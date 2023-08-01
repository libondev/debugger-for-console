import { Position, WorkspaceEdit, window, workspace } from 'vscode'
import { getDebuggerStatement, getInsertLineIndents } from '../utils/index'
import { documentAutoSaver, getScopeSymbols } from '../features'

async function create(direction: 'before' | 'after' = 'after') {
  const editor = window.activeTextEditor!

  const { document, document: { uri } } = editor
  const workspaceEdit = new WorkspaceEdit()
  const selectionsLength = editor.selections.length

  const scopeSymbols = await getScopeSymbols(editor)

  for (let i = 0; i < selectionsLength; i++) {
    const selection = editor.selections[i]

    const line = selection.end.line + (direction === 'before' ? 0 : 1)
    const indents = getInsertLineIndents(document, line)

    const debuggerStatement = getDebuggerStatement(document, selection, scopeSymbols)

    workspaceEdit.insert(
      uri,
      new Position(line, 0),
      `${indents}${debuggerStatement}`,
    )
  }

  await workspace.applyEdit(workspaceEdit)

  documentAutoSaver(editor)
}

export const createDebuggers = create.bind(null, 'after')

export const createDebuggersBefore = create.bind(null, 'before')
