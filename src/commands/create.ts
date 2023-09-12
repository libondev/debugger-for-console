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

/**
 * get the indent of the current line(获取插入行的缩进内容)
 * @param document current editor document(当前编辑器的文档对象)
 * @param cursorLineNumber insert line number(插入行的行号)
 * @returns spaces(缩进内容)
 */
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

  let { firstNonWhitespaceCharacterIndex: targetLineSpaces } = lineAt(cursorLineNumber)

  if (targetLineSpaces === 0) {
    const {
      firstNonWhitespaceCharacterIndex: previousLineSpaces,
      text: previousLineText,
    } = lineAt(cursorLineNumber - 1)

    // block start and scope start need to add 2 spaces
    // 块开始和作用域开始需要加 2 个空格
    targetLineSpaces = ['{', ':'].includes(previousLineText.at(-1)!)
      ? targetLineSpaces + 2
      // if the next line is empty, get the indent of the previous line
      // 如果下一行是空行则获取上一行的缩进大小
      : previousLineSpaces
  }

  // TODO: 如果缩进的方式是 tab, 那么这种计算方式就不正确, 也许需要换一种计算方式
  // 比如需要先获取到文档的缩进类型以及默认的缩进大小, 然后再进行计算
  return ' '.repeat(targetLineSpaces)
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
