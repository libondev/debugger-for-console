import { basename, dirname } from 'node:path'
import type { ActiveTextEditor } from './types/global'

const EMOJIS = [
  '🚀', '🎈', '🎆', '🎇', '✨', '🎉', '🎊', '🎃', '🎄', '🎍', '🎏',
  '🎐', '🎑', '🎡', '👑', '🧶', '⚽', '🥎', '🏀', '🏐', '🎮', '📦',
]
export const getRandomEmoji = () => EMOJIS[Math.floor(Math.random() * EMOJIS.length)]

export function getTargetLineIndents(
  editor: ActiveTextEditor,
  lineNumber: number,
) {
}

export function getCurrentLineNumber(
  editor: ActiveTextEditor,
  editorLineNumberOffset: 0 | 1 = 1,
) {
  const real = editor.selection.active.line

  return { real, display: editor.selection.active.line + editorLineNumberOffset }
}

export function getCurrentFileName(editor: ActiveTextEditor) {
  const filepath = editor.document.fileName

  return ` ${basename(dirname(filepath))}/${basename(filepath)} `
}
