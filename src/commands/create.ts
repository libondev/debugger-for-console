import { window } from 'vscode'
import type { WorkspaceConfiguration } from 'vscode'

export function createDebuggers(config: WorkspaceConfiguration) {
  return {
    command: 'debugger-for-console.wrapper',
    handler: () => {
      const editor = window.activeTextEditor
    },
  }
}

export function createDebuggersBefore(config: WorkspaceConfiguration) {
  return {
    command: 'debugger-for-console.before',
    handler: () => {
    },
  }
}
