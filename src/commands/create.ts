/* eslint-disable no-console */
import { window } from 'vscode'
import type { WorkspaceConfiguration } from 'vscode'

export function createDebuggers(config: WorkspaceConfiguration) {
  return {
    command: 'debugger-for-console.wrapper',
    handler: (...rest: any) => {
      const editor = window.activeTextEditor

      if (editor) {
        const document = editor.document
        const filename = document.fileName

        console.log(filename)
        window.showInformationMessage(filename)
      } else {
        console.log('no active editor')
        window.showErrorMessage('no active editor')
      }

      window.showInformationMessage('Hello World!')
      window.showInformationMessage(rest)
    },
  }
}

export function createDebuggersBefore(config: WorkspaceConfiguration) {
  return {
    command: 'debugger-for-console.before',
    handler: (...rest: any) => {
      console.log('---------------------', rest)
    },
  }
}
