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

function getInsertLineIndents(
  { lineAt, lineCount }: TextDocument,
  cursorLineNumber: number,
) {
  // If the cursor is at the end of the document, return a new line
  if (cursorLineNumber >= lineCount) {
    return '\n'
  } else if (cursorLineNumber <= 0) {
    // If the cursor is at the start of the document, return an empty string
    return ''
  }

  let { firstNonWhitespaceCharacterIndex } = lineAt(cursorLineNumber)

  // If the line is empty, get the indent of the previous line
  if (firstNonWhitespaceCharacterIndex === 0) {
    ({ firstNonWhitespaceCharacterIndex } = lineAt(cursorLineNumber - 1))
  }

  return ' '.repeat(firstNonWhitespaceCharacterIndex)
}

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

async function create(directionOffset: number) {
  const editor = window.activeTextEditor!

  const { document, document: { uri } } = editor

  const workspaceEdit = new WorkspaceEdit()
  const scopeSymbols = await getScopeSymbols(editor)
  const statementGetter = getStatementGetter(document, scopeSymbols)

  let position = new Position(0, 0)

  editor.selections.forEach((selection) => {
    const line = Math.min(selection.end.line + directionOffset, document.lineCount)

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

export const createDebuggers = create.bind(null, 1)

export const createDebuggersBefore = create.bind(null, 0)
