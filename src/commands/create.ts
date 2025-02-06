import { Position, window } from 'vscode'
import type { TextDocument } from 'vscode'

import { resolvedConfig } from '../extension'
import { getQuote } from '../features/quote'
import { getEmoji } from '../features/emoji'
import { getLines } from '../features/lines'
import { getLevel } from '../features/level'
import { getScope } from '../features/scope'
import { getOnlyVariable, getOutputNewline } from '../features/variable'
import { getAfterEmptyLine, getBeforeEmptyLine } from '../features/empty-line'

import { getLanguageStatement } from '../utils/index'
import { smartToggleEditor } from '../utils/smart-editor'

// if the last character of the text is a scope block start character, return true
// 判断最后一个字符是否是作用域块的开始字符
function isLastCharScopeStart(text: string) {
  return ['(', '{', ':'].includes(text[text.length - 1])
}

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
    text,
  } = lineAt(insertLine - offsetLine)
  const indentsChar = text.slice(0, 1) === '\t' ? '\t' : ' '

  // If the target line is the start line of a scope block,
  // you need to indent one more time on the basis of the current line indent.
  // But if created upwards, this operation is not required
  // 如果目标行是一个作用域块的开始行则需要在当前行的缩进基础上再缩进一次, 但如果向上创建则不需要这个操作
  if (offsetLine && isLastCharScopeStart(text.trim())) {
    // insertLineIndents += workspace.getConfiguration('editor', null).get('tabSize', 2)
    insertLineIndents += 2
  }

  return indentsChar.repeat(insertLineIndents)
}

function getStatementGenerator(document: TextDocument) {
  const statement = getLanguageStatement(document)

  if (!statement) {
    throw new Error('No language statement found.')
  } else if (statement.includes('{VALUE}')) {
    const [start, ...end] = statement.split('{VALUE}')
    const restEndStrings = end.join('')

    if (getOnlyVariable(document.languageId)) {
      return (_: number, t: string) => `${start}${t}${restEndStrings}\n`
    }

    const quote = getQuote(document.languageId)

    const template = `${start}${quote}${getEmoji()}${getLevel(document)
    }$1/($2):${getOutputNewline()}${quote}$3${restEndStrings}\n`

    return (lineNumber: number, text: string) => template
      .replace('$1', getLines(lineNumber) as string)
      .replace('$2', text.replace(/['"`\\]/g, ''))
      .replace('$3', text ? `, ${text}` : '')
  }

  return () => `${statement}\n`
}

const ERROR_MESSAGES = {
  NOTHING: 'Nothing to insert.',
  MULTI_LINE: 'Multi-line selection is not supported.',
} as const

async function _create(insertOffset: number, displayOffset: number) {
  const editor = window.activeTextEditor

  if (!editor) {
    return
  }

  const { document } = editor

  let hasMultiLineSelection = false
  const mergedSelections = editor.selections.reduce((listMap, selection) => {
    if (selection.isSingleLine) {
      const targetLine = selection.start.line + insertOffset
      let existLines = listMap.get(targetLine)

      if (!existLines) {
        listMap.set(targetLine, (existLines = []))
      }

      existLines.push(getScope(document, selection))
    } else {
      hasMultiLineSelection = true
    }

    return listMap
  }, new Map<number, string[]>())

  if (hasMultiLineSelection) {
    window.showInformationMessage(ERROR_MESSAGES.MULTI_LINE)
  }

  if (mergedSelections.size <= 0) {
    // avoid popping windows twice at the same time.
    !hasMultiLineSelection && window.showInformationMessage(ERROR_MESSAGES.NOTHING)
    return
  }

  const statementGetter = getStatementGenerator(document)
  let position = new Position(0, 0)

  const insertPosition = insertOffset > 0 ? 'after' : 'before'
  const insertEmptyLine = resolvedConfig.get('insertEmptyLine') as string

  const beforeEmptyLine = getBeforeEmptyLine(insertEmptyLine, insertPosition)
  const afterEmptyLine = getAfterEmptyLine(insertEmptyLine, insertPosition)

  const smartEditor = smartToggleEditor(mergedSelections.size > 1, document, editor)

  for (const [lineNumber, variables] of mergedSelections) {
    // TODO(optimize feature): find Object/Array/Function Params scope range
    const indents = getInsertLineIndents(document, lineNumber, insertOffset)

    position = position.translate(lineNumber - position.line)

    const contents = `${beforeEmptyLine}${indents}${statementGetter(
      lineNumber + displayOffset,
      variables.join(', '),
    )}${afterEmptyLine}`

    smartEditor.insert(
      position,
      contents,
    )
  }

  smartEditor.applyEdit()
}

export const create = _create.bind(null, 1, 0)

export const createBefore = _create.bind(null, 0, 2)
