import type { Position, Selection, TextDocument } from 'vscode'

const BREAK_CHARACTER = [
  ' ', '\n', '\t', '\'', '"', '`', '\\', ',', '=', '+', '-',
  '*', '/', '%', '(', ')', '{', '}', '<', '>', '[', ']',
]

const IS_SPREAD_STARTS = /^\.+/
const IS_SYMBOL_STARTS = /^[?.]*(.*?)[?.]*$/g

function getWordAtPosition(document: TextDocument, position: Position): string {
  const word = document.getWordRangeAtPosition(position)
  const lineContent = document.lineAt(position.line).text

  let start, end

  if (word) {
    start = word.start.character
    end = word.end.character
  } else {
    end = start = position.character - 1
  }

  while (start > 0 && !BREAK_CHARACTER.includes(lineContent[start - 1])) {
    start--
  }

  return lineContent
    .slice(start, end)
    .replace(IS_SPREAD_STARTS, '')
    .replace(IS_SYMBOL_STARTS, '$1')
}

export function getScope(document: TextDocument, selection: Selection): string {
  if (selection.isEmpty) {
    return getWordAtPosition(document, selection.anchor)
  }

  const start = selection.start.character
  const end = selection.end.character
  const lineContent = document.lineAt(selection.start.line).text

  return lineContent.slice(start, end)
}
