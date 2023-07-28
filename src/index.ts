import { commands, window, workspace } from 'vscode'

import type {
  WorkspaceConfiguration,
} from 'vscode'

import {
  createDebuggers,
  createDebuggersBefore,
  removeDebuggers,
  toggleDebuggers,
} from './commands/index'

function resolveWorkbenchConfigWithCommands(workspaceConfig: WorkspaceConfiguration) {
  const config = workspaceConfig

  return [
    createDebuggers(config),
    toggleDebuggers(config),
    removeDebuggers(config),
    createDebuggersBefore(config),
  ]
}

export function activate(): void {
  if (!window.activeTextEditor) {
    return
  }

  const config = workspace.getConfiguration('debugger-for-console')
  const resolveCommand = resolveWorkbenchConfigWithCommands(config)

  resolveCommand.forEach((command) => {
    commands.registerCommand(command.command, command.handler)
  })
}
