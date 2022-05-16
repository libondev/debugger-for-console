import { Range, type TextDocument, type TextEditor, WorkspaceEdit, workspace } from 'vscode'
import { getDebuggerStatementByLanguage } from '../utils'

function removeInsertedLogger(this: TextEditor) {
  const { document } = this
  const editWorkspace = new WorkspaceEdit()
  const statements = getAllStatementsByDocument(document)

  statements.forEach((statement) => {
    editWorkspace.delete(document.uri, statement)
  })

  workspace.applyEdit(editWorkspace).then(() => {
    console.log('1')
  })
}

function getAllStatementsByDocument(document: TextDocument) {
  const content = document.getText()
  const regexp = new RegExp(getDebuggerStatementByLanguage(document).replace(/(\(.*?\))/, ''), 'gu')

  const statements: Range[] = []

  let match: RegExpExecArray | null, range: Range

  do {
    match = regexp.exec(content)

    if (!match) {
      continue
    }

    console.log(match)

    range = new Range(
      document.positionAt(match.index),
      document.positionAt(match.index + match[0].length),
    )

    !range.isEmpty && statements.push(range)
  } while (match)

  return statements
}

export default removeInsertedLogger
