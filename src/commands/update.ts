import { workspace } from 'vscode'
import { resolvedConfig } from '../extension'
import { resetFileDepthCache } from '../features/file-depth'
import { tabSizeConfig } from './create'

export function updateUserConfig() {
  Object.assign(resolvedConfig, workspace.getConfiguration('debugger-for-console'))

  const deps = [resetFileDepthCache, tabSizeConfig.set.bind(tabSizeConfig)]

  deps.forEach((dep) => dep())
}
