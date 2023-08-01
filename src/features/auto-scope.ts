import type { Position, Selection, TextDocument } from 'vscode'

const BREAK_CHARACTER = [
  ' ', '\n', '\'', '"', '`', '=', '\\', '(', ',',
  ')', '+', '-', '*', '/', '%', '{', '<', '>',
]

function getWordAtPosition(document: TextDocument, position: Position): string {
  const word = document.getWordRangeAtPosition(position)
  if (!word)
    return ''

  const lineContent = document.lineAt(position.line).text
  let start = word.start.character

  while (start > 0 && !BREAK_CHARACTER.includes(lineContent[start - 1])) {
    start--
  }

  return lineContent.slice(start, word.end.character)
}

export function getVariables(document: TextDocument, selection: Selection): string {
  if (selection.isEmpty) {
    return getWordAtPosition(document, selection.anchor)
  }

  const start = selection.start.character
  const end = selection.end.character
  const lineContent = document.lineAt(selection.start.line).text

  return lineContent.slice(start, end)
}
