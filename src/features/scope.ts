import type { Position, Selection, TextDocument } from 'vscode'

const BREAK_CHARACTER = [
  ' ', '\t', '\n', ',', '=', '{', '}', '(', ')',
  // '+', '-', '*', '/', '%', '<', '>', '[', ']',
]

const IS_SPREAD_STARTS = /^\.+/
const IS_SYMBOL_STARTS = /^[?.]*(.*?)[?.]*$/g
const IS_BRACKETS_ENDS = { '(': ')', '{': '}', '[': ']' }

function calcCharCounts(string: string, char: string) {
  const regex = new RegExp(char, 'g')

  const matches = string.match(regex)

  return matches ? matches.length : 0
}

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
    start = end = position.character
  }

  // Keep moving left until you find the boundary symbol
  while (start > 0 && !BREAK_CHARACTER.includes(lineContent[start - 1])) {
    start--
  }

  // Get the text content of this range
  let statementContent = lineContent.slice(start, end)

  // If there is no content, adjust the position to the last space
  // e.g.: obj.value?.[0]?.test()
  //                            ^
  //                             ^
  if (statementContent.length === 0) {
    let whitespaceIndex = lineContent.lastIndexOf(' ', start - 1)

    whitespaceIndex += whitespaceIndex === -1 ? 0 : 1

    let newContent = lineContent.slice(whitespaceIndex, end)

    const lastChar = newContent.slice(-1)

    // Add brackets if the last character is a bracket. e.g. 'foo(' => 'foo()'
    if (lastChar in IS_BRACKETS_ENDS) {
      newContent += IS_BRACKETS_ENDS[lastChar as keyof typeof IS_BRACKETS_ENDS]
    }

    return newContent
  }

  // Only when this symbol is included will the occurrence count be checked
  if (statementContent.length > 2 && statementContent.includes('[')) {
    const diffCounts = calcCharCounts(statementContent, '\\[') - calcCharCounts(statementContent, '\\]')

    if (diffCounts) {
      statementContent = statementContent.padEnd(statementContent.length + diffCounts, ']')
    }
  }

  return statementContent
    .replace(IS_SPREAD_STARTS, '') // e.g.: ...args
    .replace(IS_SYMBOL_STARTS, '$1') // e.g.: ?.args
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
