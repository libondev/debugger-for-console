import type { WorkspaceConfiguration } from 'vscode'

export function createDebuggers(config: WorkspaceConfiguration) {
  return {
    command: 'debugger-for-console.wrapper',
    handler: () => { },
  }
}

export function createDebuggersBefore(config: WorkspaceConfiguration) {
  return {
    command: 'debugger-for-console.before',
    handler: () => { },
  }
}
