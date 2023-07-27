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

  return [createDebuggers(config), toggleDebuggers(config), removeDebuggers(config), createDebuggersBefore(config)]
}

export function activate(): void {
  // if (!window.activeTextEditor) {
  //   return
  // }

  // commands.registerCommand('debugger-for-console.wrapper', () => {
  //   console.log(111111)
  //   window.showErrorMessage('111')
  // })

  const config = workspace.getConfiguration('debugger-for-console')
  const resolveCommand = resolveWorkbenchConfigWithCommands(config)

  window.showInformationMessage(`${resolveCommand.length}`)

  resolveCommand.forEach((command) => {
    commands.registerCommand(command.command, command.handler)
  })
}
