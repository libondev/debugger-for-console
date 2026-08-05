import type { TextDocument } from 'vscode'

import {
  VARIABLE_PLACEHOLDER,
  VARIABLE_PLACEHOLDER_REGEX,
  getLanguageStatement,
  getQuote,
} from './language'
import {
  getFileDepth,
  getNumberLine,
  getOnlyVariable,
  getOutputNewline,
  getRandomEmoji,
  getEllipsisString,
} from './message'

// 根据文档语言生成语句插入函数
export function getStatementGenerator(document: TextDocument) {
  const statement = getLanguageStatement(document)

  if (!statement) {
    throw new Error('No language statement found.')
  } else if (statement.includes(VARIABLE_PLACEHOLDER)) {
    const formatter = (str: string) => `${statement.replace(VARIABLE_PLACEHOLDER_REGEX, str)}\n`

    if (getOnlyVariable(document.languageId)) {
      return (_: number, t: string) => formatter(t)
    }

    const quote = getQuote(document.languageId)

    const template = `${quote}${getRandomEmoji()}${getFileDepth(
      document,
    )}$1/($2):${getOutputNewline()}${quote}$3`

    return (lineNumber: number, text: string) =>
      formatter(
        template
          .replace('$1', getNumberLine(lineNumber) as string)
          .replace('$2', getEllipsisString(text, true))
          .replace('$3', text ? `, ${text}` : ''),
      )
  }

  return () => `${statement}\n`
}
