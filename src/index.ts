import { commands, window } from 'vscode'
import type { ExtensionContext } from 'vscode'
import { commandPrefix } from './constants'

import logger from './commands/logger'

const directives = [
  logger,
]

export function activate(ctx: ExtensionContext) {
  const editor = window.activeTextEditor

  if (!editor) {
    return
  }

  directives.forEach((directive) => {
    commands.registerCommand(
      `${commandPrefix}.${directive.name}`,
      directive.bind(ctx, editor),
    )
  })
}

export function deactivate() {

}
