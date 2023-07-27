import type { WorkspaceConfiguration } from 'vscode'

export function cancelDebuggers(config: WorkspaceConfiguration) {
  return {
    command: 'debugger-for-console.cancel',
    handler: () => { },
  }
}
