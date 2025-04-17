import { Position, window, workspace } from 'vscode'
import type { TextDocument } from 'vscode'

import { resolvedConfig } from '../extension'
import { getQuote } from '../features/quote'
import { getRandomEmoji } from '../features/random-emoji'
import { getFileDepth } from '../features/file-depth'
import { getNumberLine } from '../features/number-line'
import { getVariableCompletion } from '../features/variable-completion'
import {
  getAfterBlankLine,
  getBeforeBlankLine,
  getOnlyVariable,
  getOutputNewline,
} from '../features/output'

import { getBlockBoundaryLineWithIndent } from '../utils/scope'

import {
  VARIABLE_PLACEHOLDER,
  VARIABLE_PLACEHOLDER_REGEX,
  getEllipsisString,
  getLanguageStatement,
} from '../utils/index'
import { smartToggleEditor } from '../utils/smart-editor'

const ERROR_MESSAGES = {
  NOTHING: 'Nothing to insert.',
  MULTI_LINE: 'Multi-line selection is not supported.',
} as const

export const tabSizeConfig = {
  value: 2,
  set() {
    this.value = workspace.getConfiguration('editor').get('tabSize', 2)
  },
}

interface MergedSelection {
  line: number
  indents: string
  text: string[]
}

function getStatementGenerator(document: TextDocument) {
  const statement = getLanguageStatement(document)

  if (!statement) {
    throw new Error('No language statement found.')
  } else if (statement.includes(VARIABLE_PLACEHOLDER)) {
    const formatter = (str: string) => `${statement.replace(VARIABLE_PLACEHOLDER_REGEX, str)}\n`

    if (getOnlyVariable(document.languageId)) {
      return (_: number, t: string) => formatter(t)
    }

    const quote = getQuote(document.languageId)

    const template = `${quote}${getRandomEmoji()}${getFileDepth(document)
    }$1/($2):${getOutputNewline()}${quote}$3`

    return (lineNumber: number, text: string) => formatter(template
      .replace('$1', getNumberLine(lineNumber) as string)
      .replace('$2', getEllipsisString(text, true))
      .replace('$3', text ? `, ${text}` : ''),
    )
  }

  return () => `${statement}\n`
}

async function _create(insertOffset: number, displayOffset: number) {
  const editor = window.activeTextEditor

  if (!editor) {
    return
  }

  const { document } = editor

  // 合并多个在同一行的选区
  let hasMultiLineSelection = false
  const mergedSelections = editor.selections.reduce((listMap, selection) => {
    if (selection.isSingleLine) {
      const startLine = selection.start.line
      const targetLine = startLine + insertOffset

      let existLines = listMap.get(targetLine)

      if (!existLines) {
        existLines = {
          ...getBlockBoundaryLineWithIndent(document, startLine, insertOffset),
          text: [],
        }

        listMap.set(targetLine, existLines)
      }

      existLines.text.push(getVariableCompletion(document, selection))
    } else {
      hasMultiLineSelection = true
    }

    return listMap
  }, new Map<number, MergedSelection>())

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
  const insertEmptyLine = resolvedConfig.get<string>('insertEmptyLine', 'none')

  const beforeBlank = getBeforeBlankLine(insertEmptyLine, insertPosition)
  const afterBlank = getAfterBlankLine(insertEmptyLine, insertPosition)

  // 如果选区大于1则使用智能编辑器批量应用修改，否则使用普通编辑器
  const smartEditor = smartToggleEditor(mergedSelections.size > 1, document, editor)

  for (const [lineNumber, variables] of mergedSelections) {
    position = position.translate(variables.line - position.line)

    const contents = `${beforeBlank}${variables.indents}${statementGetter(
      lineNumber + displayOffset,
      variables.text.join(', '),
    )}${afterBlank}`

    smartEditor.insert(
      position,
      contents,
    )
  }

  smartEditor.applyEdit()
}

export const create = _create.bind(null, 1, 0)

export const createBefore = _create.bind(null, 0, 2)
