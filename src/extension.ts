import { type WorkspaceConfiguration, commands, window } from 'vscode'

import { commandsMapping } from './commands/index'
import { updateUserConfig } from './commands/update'

export const resolvedConfig = {} as WorkspaceConfiguration

export function activate(): void {
  if (!window.activeTextEditor) {
    return
  }

  for (const command of Object.entries(commandsMapping)) {
    commands.registerCommand(...command)
  }

  // only update user config when extension is activated
  updateUserConfig()
}
