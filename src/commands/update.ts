import { workspace } from 'vscode'
import { autoSave } from '../features/saver'
import { getQuote } from '../features/quote'
import { getEmoji } from '../features/emoji'
import { getLines } from '../features/lines'
import { resolvedConfig } from '../extension'
import { getEllipsis } from '../features/ellipsis'
import { getOnlyVariable, getOutputNewline } from '../features/variable'

export function updateUserConfig() {
  Object.assign(resolvedConfig, workspace.getConfiguration('debugger-for-console'))

  const deps = [
    autoSave,
    getQuote,
    getEmoji,
    getLines,
    getEllipsis,
    getOnlyVariable,
    getOutputNewline,
  ]

  deps.forEach(dep => dep.update())
}
