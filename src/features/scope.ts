import type { Position, Selection, TextDocument } from 'vscode'

const BREAK_CHARACTER = [
  ' ', '\t', '\n', ',', '=', '{', '}', '(', ')', '[', ']',
  // '+', '-', '*', '/', '%', '<', '>',
]

const IS_SYMBOL_STARTS = /^[\}\)\]?.]*(.*?)[\{\(\[?.]*$/
const IS_BRACKETS_ENDS_MAP = { '(': ')', '{': '}', '[': ']' }
const ONLY_SPECIAL_CHARS = /^[^a-zA-Z0-9]+$/

// function calcCharCounts(string: string, char: string) {
//   const regex = new RegExp(char, 'g')

//   const matches = string.match(regex)

//   return matches ? matches.length : 0
// }

function getWordAtPosition(document: TextDocument, position: Position): string {
  const { isEmptyOrWhitespace, text: lineText } = document.lineAt(position.line)

  // empty line or no word
  if (isEmptyOrWhitespace) {
    return ''
  }

  const word = document.getWordRangeAtPosition(position)

  let startAt = position.character
  let endAt = position.character

  if (word) {
    startAt = word.start.character
    endAt = word.end.character
  }

  // Until you find the first delimiter
  while (startAt > 0 && !BREAK_CHARACTER.includes(lineText[startAt - 1])) {
    startAt--
  }

  // Get the text content of this range
  let content = lineText.slice(startAt, endAt)

  // e.g.: obj.value?.[0]?.test(  )
  //                           ^  ^
  if (content.length === 0) {
    let whitespaceIndex = lineText.lastIndexOf(' ', startAt - 1)

    // Avoid intercepting from the last because the index becomes -1.
    whitespaceIndex += whitespaceIndex === -1 ? 1 : 0

    let newContent = lineText.slice(whitespaceIndex, endAt)

    // If the content is only special characters, return an empty string
    // e.g.: '{}' => '', '()' => '', '[]' => ''
    if (ONLY_SPECIAL_CHARS.test(newContent)) {
      return ''
    }

    const lastChar = newContent.slice(-1)

    // Add brackets if the last character is a bracket. e.g. 'foo(' => 'foo()'
    if (lastChar in IS_BRACKETS_ENDS_MAP) {
      newContent += IS_BRACKETS_ENDS_MAP[lastChar as keyof typeof IS_BRACKETS_ENDS_MAP]
    }

    return newContent
  }

  // Automatically complete missing symbols
  // It is necessary to check only if the length of the content is at least greater than 2.
  if (content.length >= 2) {
    if (content.startsWith('\'') && !content.endsWith('\'')) {
      content += '\''
    } else if (content.startsWith('"') && !content.endsWith('"')) {
      content += '"'
    } else if (content.startsWith('`') && !content.endsWith('`')) {
      content += '`'
    }
  } else if (ONLY_SPECIAL_CHARS.test(content)) {
    // single character: '.', ')', ']', etc.
    return ''
  }

  return content
    .replace(IS_SYMBOL_STARTS, '$1') // e.g.: ?.args | ...args
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
