import { commands, window } from 'vscode'
import type { ExtensionContext, TextEditor } from 'vscode'

import insertLogger from './core/insert'
import removeLogger from './core/remove'

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
      ctx => insertLogger.call(ctx, 'after'),
    ),
    commands.registerTextEditorCommand(
      'debugger-for-console.wrapper.before',
      ctx => insertLogger.call(ctx, 'before'),
    ),
    commands.registerTextEditorCommand(
      'debugger-for-console.wrapper.remove',
      ctx => removeLogger.call(ctx),
    ),
  )
}

export function deactivate() { }
