import type { window } from 'vscode'

export type ActiveTextEditor = Exclude<typeof window.activeTextEditor, undefined>
