import type { window } from 'vscode'

declare global {
  type ActiveTextEditor = Exclude<typeof window.activeTextEditor, undefined>
}
