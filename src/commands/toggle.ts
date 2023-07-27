import type { WorkspaceConfiguration } from 'vscode'

export function toggleDebuggers(config: WorkspaceConfiguration) {
  return {
    command: 'debugger-for-console.toggle',
    handler: () => { },
  }
}
