import { workspace } from 'vscode'
import { resolvedConfig } from '../extension'
import { quote } from '../features/optional'

export function updateUserConfig() {
  const config = Object.assign(
    resolvedConfig,
    workspace.getConfiguration('debugger-for-console'),
  )

  quote.update(config.get('quote')!)
  // semi.update(config.get('semi') ? ';' : '')
}
