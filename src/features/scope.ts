import type { Position, Selection, TextDocument } from 'vscode'

const BREAK_CHARACTER = [
  ' ', '\t', '\n', ',', '=', '{', '}', '(', ')',
  // '+', '-', '*', '/', '%', '<', '>', '[', ']',
]

const IS_SPREAD_STARTS = /^\.+/
const IS_SYMBOL_STARTS = /^[?.]*(.*?)[?.]*$/g
const IS_BRACKETS_ENDS = { '(': ')', '{': '}', '[': ']' }

function getWordAtPosition(document: TextDocument, position: Position): string {
  const { isEmptyOrWhitespace, text: lineContent } = document.lineAt(position.line)

  // empty line or no word
  if (isEmptyOrWhitespace) {
    return ''
  }

  const word = document.getWordRangeAtPosition(position)

  let start, end

  if (word) {
    start = word.start.character
    end = word.end.character
  } else {
    end = position.character
    start = end
  }

  while (start > 0 && !BREAK_CHARACTER.includes(lineContent[start - 1])) {
    start--
  }

  let statementContent = lineContent.slice(start, end)

  if (statementContent.length <= 0) {
    let whitespaceIndex = lineContent.lastIndexOf(' ', start - 1)

    if (whitespaceIndex === -1) {
      whitespaceIndex = 0
    } else {
      // Skip the whitespace
      whitespaceIndex += 1
    }

    return lineContent.slice(whitespaceIndex, end)
  }

  const lastChar = statementContent.slice(-1)!

  // Add brackets if the last character is a bracket. e.g. 'foo(' => 'foo()'
  if (lastChar in IS_BRACKETS_ENDS) {
    statementContent += IS_BRACKETS_ENDS[lastChar as keyof typeof IS_BRACKETS_ENDS]
  }

  return statementContent
    .replace(IS_SPREAD_STARTS, '')
    .replace(IS_SYMBOL_STARTS, '$1')
}

export function getScope(document: TextDocument, selection: Selection): string {
  if (selection.isEmpty) {
    return getWordAtPosition(document, selection.anchor)
  }

  const { isEmptyOrWhitespace, text: lineContent } = document.lineAt(selection.start.line)

  if (isEmptyOrWhitespace) {
    return ''
  }

  return lineContent.slice(selection.start.character, selection.end.character)
}
