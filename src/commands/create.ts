import type { WorkspaceConfiguration } from 'vscode'

export function createDebuggers(config: WorkspaceConfiguration) {
  return {
    command: 'debugger-for-console.createDebuggers',
    handler: () => { },
  }
}
