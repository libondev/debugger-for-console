import { Position, WorkspaceEdit, window, workspace } from 'vscode'
import type { TextDocument } from 'vscode'
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
import { QUOTE_SYMBOLS, type QuoteSymbolsKeys } from '../syntax/quote'

function getInsertLineIndents(
  { lineAt, lineCount }: TextDocument,
  cursorLineNumber: number,
) {
  // If the cursor is at the end of the document, return a new line
  // 如果当前光标所在的行是最后一行则用换行来代替首位的缩进内容
  if (cursorLineNumber >= lineCount) {
    return '\n'
  } else if (cursorLineNumber <= 0) {
    // If the cursor is at the start of the document, return an empty string
    // 如果当前光标所在的行是第一行则输出空字符
    return ''
  }

  let { firstNonWhitespaceCharacterIndex, text } = lineAt(cursorLineNumber)

  // If the line is empty, get the indent of the previous line
  // 如果下一行的缩进是 0 则获取上一行的缩进
  if (firstNonWhitespaceCharacterIndex === 0) {
    ({ firstNonWhitespaceCharacterIndex } = lineAt(cursorLineNumber - 1))
  }

  return ' '.repeat(firstNonWhitespaceCharacterIndex)
}

function getStatementGenerator(document: TextDocument, symbols: string) {
  const statement = getLanguageStatement(document)

  if (!statement) {
    throw new Error('No language statement found.')
  } else if (statement.includes('$')) {
    const [start, ...end] = statement.split('$')
    const _quote = QUOTE_SYMBOLS[document.languageId as QuoteSymbolsKeys] ?? quote.$

    const template = `${start}${_quote}${getRandomEmoji()}${
      getFileDepth(document)}$0$${symbols} - [$1$]: ${_quote}, $2$${end.join('')}\n`

    return (lineNumber: number, text: string) => template
      .replace('$0$', getLineNumber(lineNumber))
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
  const statementGetter = getStatementGenerator(document, scopeSymbols)

  let position = new Position(0, 0)

  const mergedSelections = editor.selections.reduce((lines, selection) => {
    const targetLine = selection.start.line + directionOffset

    lines[targetLine] ??= []

    lines[targetLine].push(getVariables(document, selection))

    return lines
  }, Object.create(null) as Record<number, string[]>)

  for (const line in mergedSelections) {
    const lineNumber = Number(line)

    // TODO(optimize feature): find Object/Array/Function Params scope range
    const indents = getInsertLineIndents(document, lineNumber)

    position = position.translate(lineNumber - position.line)

    workspaceEdit.insert(
      uri,
      position,
      `${indents}${statementGetter(lineNumber, mergedSelections[line].join(', '))}`,
    )
  }

  await workspace.applyEdit(workspaceEdit)

  documentAutoSaver(editor)
}

export const createDebuggers = create.bind(null, 1)

export const createDebuggersBefore = create.bind(null, 0)
