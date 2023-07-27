import type { WorkspaceConfiguration } from 'vscode'

export function removeDebuggers(config: WorkspaceConfiguration) {
  return {
    command: 'debugger-for-console.remove',
    handler: () => { },
  }
}
