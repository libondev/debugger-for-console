import { Position, WorkspaceEdit, window, workspace } from 'vscode'
import type { TextDocument } from 'vscode'

import { autoSave } from '../features/saver'
import { getQuote } from '../features/quote'
import { getEmoji } from '../features/emoji'
import { getLines } from '../features/lines'
import { getLevel } from '../features/level'
import { getScope } from '../features/scope'
import { getSymbols } from '../features/symbols'
import { getAfterEmptyLine, getBeforeEmptyLine } from '../features/empty-line'

import { getLanguageStatement } from '../utils/index'

/**
 * get the indent of the current line(获取插入行的缩进内容)
 * @param document current editor document(当前编辑器的文档对象)
 * @param insertLine insert line number(插入行的行号)
 * @returns spaces(缩进内容)
 */
function getInsertLineIndents(
  { lineAt, lineCount }: TextDocument,
  insertLine: number,
  offsetLine: number,
) {
  // If the cursor is at the end of the document, return a new line
  // 如果当前光标所在的行是最后一行则用换行来代替首位的缩进内容
  if (insertLine >= lineCount) {
    return '\n'
  } else if (insertLine <= 0) {
    // If the cursor is at the start of the document, return an empty string
    // 如果当前光标所在的行是第一行则输出空字符
    return ''
  }

  // Get the indent of the current line
  // 获取光标所行的原始缩进大小
  let { firstNonWhitespaceCharacterIndex: insertLineIndents } = lineAt(insertLine - offsetLine)

  // If the indent of the current line is 0, you need to get the indent of the previous line
  // 如果当前行的缩进为0，则需要获取上一行的缩进
  if (insertLineIndents === 0) {
    const {
      firstNonWhitespaceCharacterIndex: previousLineSpaces,
      text: previousLineText,
    } = lineAt(insertLine - 1)

    // block start and scope start need to add 2 spaces, e.g. [if (true) {] or [case '1':]
    // 块开始和作用域开始需要加 2 个空格, 比如 if (true) { 或者 case '1': 这种情况
    insertLineIndents = ['{', ':', '('].includes(previousLineText.at(-1)!)
      ? insertLineIndents + 2
      // if the next line is empty, get the indent of the previous line
      // 如果下一行是空行则获取上一行的缩进大小
      : previousLineSpaces
  }

  return ' '.repeat(insertLineIndents)

  // Uncertain whether this function is needed, currently no feedback on using tab as indent
  // 不确定是否需要这个功能, 目前还没有得到使用 tab 作为缩进的反馈
  // const [indentType, indentSize] = workspace
  //   .getConfiguration('editor', null)
  //   .get('insertSpaces', true)
  //   ? ['space', workspace.getConfiguration('editor', null).get('tabSize', 2)]
  //   : ['tab', 1]

  // return indentType === 'space'
  //   ? ' '.repeat(targetLineSpaces)
  //   : '\t'.repeat(targetLineSpaces / indentSize)
}

function getStatementGenerator(document: TextDocument, symbols: string) {
  const statement = getLanguageStatement(document)

  if (!statement) {
    throw new Error('No language statement found.')
  } else if (statement.includes('$')) {
    const [start, ...end] = statement.split('$')

    const quote = getQuote(document.languageId)

    const template = `${start}${quote}${getEmoji()}${
      getLevel(document)}$0$${symbols} ~ [$1$]:${quote}, $2$${end.join('')}\n`

    return (lineNumber: number, text: string) => template
      .replace('$0$', getLines(lineNumber)!)
      .replace('$1$', text.replace(/['"`\\]/g, ''))
      .replace('$2$', text)
  }

  return () => `${statement}\n`
}

async function create(insertLineOffset: number, displayLineOffset: number) {
  const editor = window.activeTextEditor!

  const { document, document: { uri } } = editor

  const workspaceEdit = new WorkspaceEdit()
  const scopeSymbols = await getSymbols(editor)
  const statementGetter = getStatementGenerator(document, scopeSymbols)

  let position = new Position(0, 0)

  const mergedSelections = editor.selections.reduce((lines, selection) => {
    const targetLine = selection.start.line + insertLineOffset

    lines[targetLine] ??= []

    lines[targetLine].push(getScope(document, selection))

    return lines
  }, Object.create(null) as Record<number, string[]>)

  for (const line in mergedSelections) {
    const lineNumber = Number(line)

    // TODO(optimize feature): find Object/Array/Function Params scope range
    const indents = getInsertLineIndents(document, lineNumber, insertLineOffset)

    position = position.translate(lineNumber - position.line)

    workspaceEdit.insert(
      uri,
      position,
      `${getBeforeEmptyLine()}${indents
      }${statementGetter(
        lineNumber + displayLineOffset,
        mergedSelections[line].join(', '),
      )}${getAfterEmptyLine()}`,
    )
  }

  await workspace.applyEdit(workspaceEdit)

  autoSave(editor)
}

export const createDebuggers = create.bind(null, 1, 0)

export const createDebuggersBefore = create.bind(null, 0, 2)
