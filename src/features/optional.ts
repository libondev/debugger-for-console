import type { Selection, TextEditor } from 'vscode'
import { lazyValue } from '../utils/index'
import { resolvedConfig } from '../extension'

const EMOJIS = [
  '🚀', '🛸', '🛰️', '👑', '🔭', '✨', '📦', '🔦', '🔌', '☘️',
  '🔧', '🥑', '🎡', '🗝️', '📦', '📫', '📮', '📜', '📃', '📦',
]

// export const semi = lazyValue<string>()
export const quote = lazyValue<string>()

export function getRandomEmoji() {
  return resolvedConfig.get('emoji') ? EMOJIS[Math.floor(Math.random() * EMOJIS.length)] : ''
}

export function getLineNumber(selection: Selection) {
  return resolvedConfig.get('lineNumber') ? `:${selection.active.line + 1}` : ''
}

export function documentAutoSaver(editor: TextEditor) {
  if (!resolvedConfig.get('autoSave')) {
    return
  }

  editor.document.save()
}
