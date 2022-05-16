import { commands, window } from 'vscode'
import type { ExtensionContext, TextEditor } from 'vscode'

// import wrapper from './commands/wrapper'
import logWrapper from './core'

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
      'debugger-for-console.logger',
      () => logWrapper.call(current.editor, 'down'),
    ),
  )
}

export function deactivate() {

}
