import { workspace } from 'vscode'
import { resolvedConfig } from '../extension'
import { autoSave } from '../features/saver'
import { getQuote } from '../features/quote'
import { getEmoji } from '../features/emoji'
import { getLines } from '../features/lines'
import { getLevel } from '../features/level'
import { getOneVariable } from '../features/variable'
import { getAfterEmptyLine, getBeforeEmptyLine } from '../features/empty-line'

export function updateUserConfig() {
  Object.assign(
    resolvedConfig,
    workspace.getConfiguration('debugger-for-console'),
  )

  const deps = [
    autoSave,
    getQuote,
    getEmoji,
    getLines,
    getLevel,
    getOneVariable,
    getBeforeEmptyLine,
    getAfterEmptyLine,
  ]

  deps.forEach(dep => dep.update())
}
