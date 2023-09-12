import type { TextEditor } from 'vscode'
import { lazyValue } from '../utils/index'
import { resolvedConfig } from '../extension'

const EMOJIS = [
  '🚀', '🛸', '🛰️', '👑', '🔭', '✨', '🍀', '🫧', '🍿', '🍉',
  '🔥', '🥑', '🎡', '🗝️', '📦', '📫', '🍟', '📜', '📃', '🌿',
]

export const quote = lazyValue<string>()

export function getRandomEmoji() {
  return resolvedConfig.get('emoji') ? EMOJIS[Math.floor(Math.random() * EMOJIS.length)] : ''
}

export function getLineNumber(lineNumber: number) {
  return resolvedConfig.get('lineNumber') ? `:${lineNumber}` : ''
}

export function documentAutoSaver(editor: TextEditor) {
  if (!resolvedConfig.get('autoSave')) {
    return
  }

  editor.document.save()
}
