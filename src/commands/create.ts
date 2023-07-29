import { window } from 'vscode'
import { getDebuggerStatement } from '../utils/index'

export async function createDebuggers() {
  const editor = window.activeTextEditor!

  // const logger = await getDebuggerStatement(editor, 'this is a debugger statement.')

  // console.log(await getDebuggerStatement(editor, 'this is a debugger statement.'))

  console.log(await getDebuggerStatement(editor))
}

export async function createDebuggersBefore() {

}
