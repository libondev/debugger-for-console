import { Position, WorkspaceEdit, window, workspace } from 'vscode'
import type { TextDocument } from 'vscode'

import { autoSave } from '../features/saver'
import { getQuote } from '../features/quote'
import { getEmoji } from '../features/emoji'
import { getLines } from '../features/lines'
import { getLevel } from '../features/level'
import { getScope } from '../features/scope'
import { getSymbols } from '../features/symbols'
import { getSeparator } from '../features/separator'
import { getAfterEmptyLine, getBeforeEmptyLine } from '../features/empty-line'

import {
  getLanguageStatement,
  isLastCharScopeStart,
} from '../utils/index'

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
  if (insertLine <= 0) { // if first line(文档的第一行)
    return ''
  } else if (insertLine >= lineCount) { // if last line(最后一行)
    return '\n'
  }

  // Get information about the line where the cursor is located
  // 获取光标所行的信息
  let {
    firstNonWhitespaceCharacterIndex: insertLineIndents,
    text: insertLineText,
  } = lineAt(insertLine - offsetLine)

  // If the target line is the start line of a scope block,
  // you need to indent one more time on the basis of the current line indent.
  // But if created upwards, this operation is not required
  // 如果目标行是一个作用域块的开始行则需要在当前行的缩进基础上再缩进一次, 但如果向上创建则不需要这个操作
  if (offsetLine && isLastCharScopeStart(insertLineText)) {
    insertLineIndents += 2
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
  } else if (statement.includes('{VALUE}')) {
    const [start, ...end] = statement.split('{VALUE}')

    const separator = getSeparator(document.languageId)

    // If the delimiter is " + ", it means that only one parameter is output,
    // otherwise it will become a string addition,
    // and the printed thing will have no meaning
    // 如果分割符是 " + " 则表示只输出一个参数, 否则会变成字符串相加, 打印出来的东西没有意义
    if (separator === ' + ') {
      return (_: number, text: string) => `${start}$3${end.join('')}\n`.replace('$3', text)
    }

    const quote = getQuote(document.languageId)

    const template = `${start}${quote}${getEmoji()}${
      getLevel(document)}$1${symbols} ~ [$2]:${quote}${separator}$3${end.join('')}\n`

    return (lineNumber: number, text: string) => template
      .replace('$1', getLines(lineNumber) as string)
      .replace('$2', text.replace(/['"`\\]/g, ''))
      .replace('$3', text)
  }

  return () => `${statement}\n`
}

async function create(insertLineOffset: number, displayLineOffset: number) {
  const editor = window.activeTextEditor!

  const { document, document: { uri } } = editor

  const mergedSelections = editor.selections.reduce((lines, selection) => {
    const targetLine = selection.start.line + insertLineOffset

    lines[targetLine] ??= []

    lines[targetLine].push(getScope(document, selection))

    return lines
  }, Object.create(null) as Record<number, string[]>)

  const workspaceEdit = new WorkspaceEdit()
  const scopeSymbols = await getSymbols(editor)
  const statementGetter = getStatementGenerator(document, scopeSymbols)
  let position = new Position(0, 0)

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
