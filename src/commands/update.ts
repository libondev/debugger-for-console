import { workspace } from 'vscode'
import { resolvedConfig } from '../extension'
import { autoSave } from '../features/saver'
import { getQuote } from '../features/quote'
import { getEmoji } from '../features/emoji'
import { getLines } from '../features/lines'
import { getEllipsis } from '../features/ellipsis'
import { resetDepthCache } from '../features/depth'
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
    { update: resetDepthCache },
  ]

  deps.forEach(dep => dep.update())
}
