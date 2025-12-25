import { commands, workspace } from 'vscode'
import type { ExtensionContext, WorkspaceConfiguration } from 'vscode'

import { commandsMapping } from './commands/index'
import { updateUserConfig } from './commands/update'

// eslint-disable-next-line import/no-mutable-exports
export let resolvedConfig = {} as WorkspaceConfiguration

export function activate(context: ExtensionContext): void {
  for (const command of Object.entries(commandsMapping)) {
    const disposable = commands.registerCommand(...command)

    context.subscriptions.push(disposable)
  }

  // only update user config when extension is activated
  updateUserConfig()

  // auto update config when configuration changes
  const configChangeListener = workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration('debugger-for-console')) {
      updateUserConfig()
    }
  })

  context.subscriptions.push(configChangeListener)
}

export function deactivate(): void {
  resolvedConfig = null!
}
