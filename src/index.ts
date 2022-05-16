import { commands, window } from 'vscode'
import type { ExtensionContext, TextEditor } from 'vscode'

import logger from './core'

export const current = {} as {
  editor: TextEditor
  context: ExtensionContext
}

export function activate(context: ExtensionContext) {
  if (!window.activeTextEditor) {
    return
  }

  current.context = context
  current.editor = window.activeTextEditor

  context.subscriptions.push(
    commands.registerTextEditorCommand(
      'debugger-for-console.wrapper',
      ctx => logger.call(ctx, 'down'),
    ),
  )
}

export function deactivate() {

}
