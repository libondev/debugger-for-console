import type { Position, Selection, TextDocument } from 'vscode'

const BREAK_CHARACTER = [
  ' ', '\t', '\n', ',', '=', '{', '}', '(', ')', '[', ']',
  // '+', '-', '*', '/', '%', '<', '>',
]

const IS_SYMBOL_STARTS = /^[}\])?.=]*([\s\S]*?)(?:[{([?.=]*)$/
const IS_BRACKETS_ENDS_MAP = { '(': ')', '{': '}', '[': ']' }
const ONLY_SPECIAL_CHARS = /^[^a-zA-Z0-9]+$/

const ENLARGED_SELECTION_SYMBOLS = '\'"`'

function ensureCorrectPosition(text: string, start: number, char: string, reverse: boolean) {
  const searchMethod = reverse ? text.lastIndexOf.bind(text) : text.indexOf.bind(text)

  const offset = reverse ? -1 : 1

  let idx = searchMethod(char, start + offset)

  while (idx >= 0 && text[idx - 1] === '\\') {
    idx = searchMethod(char, idx + offset)
  }

  return reverse ? idx : idx + offset
}

function getWordAtPosition(document: TextDocument, position: Position): string {
  const { isEmptyOrWhitespace, text } = document.lineAt(position.line)

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
  while (startAt > 0 && !BREAK_CHARACTER.includes(text[startAt - 1])) {
    startAt--
  }

  // Get the text content of this range
  let content = text.slice(startAt, endAt)

  // e.g.: obj.value?.[0]?.test(  )
  //                           ^  ^
  if (content.length === 0) {
    // Avoid including truncated spaces, so +1 is required.
    const whitespaceIndex = text.lastIndexOf(' ', startAt) + 1

    let newContent = text.slice(whitespaceIndex, endAt)

    // If the content is only special characters, return an empty string
    // e.g.: ('{}','()','[]') => ''
    if (ONLY_SPECIAL_CHARS.test(newContent)) {
      return ''
    }

    const lastChar = newContent.slice(-1)

    // Add brackets if the last character is a bracket. e.g. 'foo(' => 'foo()'
    if (lastChar in IS_BRACKETS_ENDS_MAP) {
      newContent += IS_BRACKETS_ENDS_MAP[lastChar as keyof typeof IS_BRACKETS_ENDS_MAP]
    }

    return newContent.replace(IS_SYMBOL_STARTS, '$1') // e.g.: ?.args | ...args
  }

  // Get the text content of this range
  const content = text.slice(startAt, endAt)

  // only character: '.', ')', ']', etc.
  if (ONLY_SPECIAL_CHARS.test(content)) {
    return ''
  }

  const _firstChar = content[0]
  const _lastChar = content[content.length - 1]

  // if the first character is a symbol, then we need to enlarge the selection
  if (ENLARGED_SELECTION_SYMBOLS.includes(_firstChar)) {
    endAt = ensureCorrectPosition(text, startAt, _firstChar, false)

    return text.slice(startAt, endAt)
  } else if (ENLARGED_SELECTION_SYMBOLS.includes(_lastChar)) {
    startAt = ensureCorrectPosition(text, startAt, _lastChar, true)

    return text.slice(startAt, endAt)
  }

  return content.replace(IS_SYMBOL_STARTS, '$1') // e.g.: ?.args | ...args
}

export function getScope(document: TextDocument, selection: Selection): string {
  if (selection.isEmpty) {
    return getWordAtPosition(document, selection.anchor)
  }

  const { isEmptyOrWhitespace, text } = document.lineAt(selection.start.line)

  if (isEmptyOrWhitespace) {
    return ''
  }

  return text.slice(selection.start.character, selection.end.character)
}
