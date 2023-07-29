import { workspace } from 'vscode'
import { resolvedConfig } from '../index'

export function updateUserConfig() {
  Object.assign(
    resolvedConfig,
    workspace.getConfiguration('debugger-for-console'),
  )
}
