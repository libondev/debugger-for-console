import { commands, window, workspace } from 'vscode'

import type {
  ExtensionContext,
  WorkspaceConfiguration,
} from 'vscode'

import {
  cancelDebuggers,
  createDebuggers,
  removeDebuggers
} from './commands/index'

function resolveWorkbenchConfigWithCommands(workspaceConfig: WorkspaceConfiguration) {
  const config = workspaceConfig

  return [createDebuggers(config), cancelDebuggers(config), removeDebuggers(config)]
}

export function activate(context: ExtensionContext): void {
  if (!window.activeTextEditor) {
    return
  }

  const config = workspace.getConfiguration('debugger-for-console')
  const resolveCommand = resolveWorkbenchConfigWithCommands(config)

  resolveCommand.forEach((command) => {
    commands.registerCommand(command.command, command.handler)
  })
}
