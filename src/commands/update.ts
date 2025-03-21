import { workspace } from 'vscode'
import { resolvedConfig } from '../extension'
import { resetFileDepthCache } from '../features/file-depth'

export function updateUserConfig() {
  Object.assign(resolvedConfig, workspace.getConfiguration('debugger-for-console'))

  const deps = [
    resetFileDepthCache,
  ]

  deps.forEach(dep => dep())
}
