import { Position, WorkspaceEdit, window, workspace } from 'vscode'
import type { Selection, TextDocument } from 'vscode'
import { getLanguageStatement } from '../utils/index'
import {
  documentAutoSaver,
  getFileDepth,
  getLineNumber,
  getRandomEmoji,
  getScopeSymbols,
  getVariables,
  quote,
} from '../features/index'

function getStatementGetter(document: TextDocument, symbols: string) {
  const statement = getLanguageStatement(document)

  if (!statement) {
    throw new Error('No language statement found.')
  } else if (statement.includes('$')) {
    const [start, ...end] = statement.split('$')

    const template = `${start}${quote.$}${getRandomEmoji()}${
      getFileDepth(document)}$0$${symbols}「$1$」${quote.$}, $2$${end.join('')}\n`

    return (selection: Selection, text: string) => template
      .replace('$0$', getLineNumber(selection))
      .replace('$1$', text.replace(/['"`\\]/g, ''))
      .replace('$2$', text)
  }

  return () => `${statement}\n`
}

function getInsertLineIndents(
  { lineAt }: TextDocument,
  cursorLineNumber: number,
) {
  let { firstNonWhitespaceCharacterIndex } = lineAt(cursorLineNumber)

  // If the line is empty, get the indent of the previous line
  if (firstNonWhitespaceCharacterIndex === 0) {
    ({ firstNonWhitespaceCharacterIndex } = lineAt(cursorLineNumber - 1))
  }

  return ' '.repeat(firstNonWhitespaceCharacterIndex)
}

async function create(direction: 'before' | 'after' = 'after') {
  const editor = window.activeTextEditor!

  const { document, document: { uri } } = editor

  const workspaceEdit = new WorkspaceEdit()
  const scopeSymbols = await getScopeSymbols(editor)
  const statementGetter = getStatementGetter(document, scopeSymbols)

  let position = new Position(0, 0)

  editor.selections.forEach((selection) => {
    const line = selection.end.line + (direction === 'before' ? 0 : 1)
    const indents = getInsertLineIndents(document, line)
    const variables = getVariables(document, selection)

    position = position.translate(line - position.line)

    workspaceEdit.insert(
      uri,
      position,
      `${indents}${statementGetter(selection, variables)}`,
    )
  })

  await workspace.applyEdit(workspaceEdit)

  documentAutoSaver(editor)
}

export const createDebuggers = create.bind(null, 'after')

export const createDebuggersBefore = create.bind(null, 'before')
