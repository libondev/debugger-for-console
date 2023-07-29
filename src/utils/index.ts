import { basename, dirname } from 'node:path'
import { Range, window } from 'vscode'
import type { ActiveTextEditor } from '../types/global'
import { resolvedConfig } from '../index'
import { getCurrentScopeSymbol } from './symbol'

export function documentAutoSaver(editor: ActiveTextEditor) {
  if (!resolvedConfig.get('autoSave')) {
    return
  }

  editor.document.save()
}

export function getTargetLineIndents(
  editor: ActiveTextEditor,
  lineNumber: number,
) {
  const spaceNumber = editor.document.lineAt(lineNumber).firstNonWhitespaceCharacterIndex

  return ' '.repeat(spaceNumber)
}

const EMOJIS = [
  '🚀', '🎈', '🎆', '🎇', '✨', '🎉', '🎊', '🎃', '🎄', '🎍', '🎏',
  '🎐', '🎑', '🎡', '👑', '🧶', '⚽', '🥎', '🏀', '🏐', '🎮', '📦',
]

const semi = () => resolvedConfig.get('semi') ? ';' : ''
const quote = () => resolvedConfig.get('quote') || '\''

const getRandomEmojiPrefix = () => resolvedConfig.get('emoji') ? EMOJIS[Math.floor(Math.random() * EMOJIS.length)] : ''
const getDisplayLineNumber = (editor: ActiveTextEditor) => resolvedConfig.get('lineNumber') ? `:${editor.selection.active.line + 1}` : ''

function getCurrentFileName(editor: ActiveTextEditor) {
  if (resolvedConfig.get('fileName')) {
    const filepath = editor.document.fileName

    return ` ${basename(dirname(filepath))}/${basename(filepath)}`
  }

  return ''
}

function getLanguageStatements(editor: ActiveTextEditor) {
  const languageId = editor.document.languageId

  // This damn JavaScript language types
  if (['javascript', 'typescript', 'javascriptreact', 'typescript'].includes(languageId)) {
    return resolvedConfig.get('wrappers.javascript') || resolvedConfig.get('wrappers.default')
  } else {
    return resolvedConfig.get(`wrappers.${languageId}`) || resolvedConfig.get('wrappers.default')
  }
}

async function getDisplayScopeSymbols(editor: ActiveTextEditor) {
  if (!resolvedConfig.get('symbols')) {
    return ''
  }

  return `@${await getCurrentScopeSymbol(editor)}`
}

const BREAK_CHARACTER = [' ', '\n', '\'', '"', '`', '=', '\\', '(', '+', '-', '*', '/', '%', '{', '<', '>', ',']
export function getAnchorContent(editor: ActiveTextEditor) {
  const { document, selection } = editor
  const insertLine = document.lineAt(selection.end.line)

  let range: Range | undefined = new Range(selection.start, selection.end)

  if (selection.isEmpty) {
    const anchor = selection.anchor
    const lineContent = document.lineAt(anchor.line).text
    const word = document.getWordRangeAtPosition(anchor)

    if (word) {
      let start = word.start.character

      // 一直向前查找字符，直到找到一个空格或者是一个换行符或者是 = 符号
      while (start > 0 && !BREAK_CHARACTER.includes(lineContent[start - 1])) {
        start--
      }

      range = new Range(anchor.line, start, anchor.line, word.end.character)
    } else {
      return Promise.reject(new Error('No selection or word found.'))
    }
  }

  if (!range && insertLine.isEmptyOrWhitespace) {
    return Promise.resolve({ line: insertLine.lineNumber, text: '' })
  }

  return Promise.resolve({ line: insertLine.lineNumber, text: document.getText(range) })
}

export async function getDebuggerStatement(editor: ActiveTextEditor) {
  const statement = getLanguageStatements(editor)

  if (!statement) {
    window.showInformationMessage('No language statements found.')
    throw new Error('No language statements found.')
  } else if (statement === 'debugger') {
    return `${statement}${semi}`
  }

  const { text, line } = await getAnchorContent(editor)

  return `${getTargetLineIndents(editor, line)}${statement}(${quote()}${
    getRandomEmojiPrefix()}${getCurrentFileName(editor)}${getDisplayLineNumber(editor)
    }${await getDisplayScopeSymbols(editor)}${quote()}, ${text})${semi()}`
}
