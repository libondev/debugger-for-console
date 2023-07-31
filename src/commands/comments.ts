import { WorkspaceEdit, window, workspace } from 'vscode'
import { getAllStatementRanges } from '../utils'
import { documentAutoSaver } from '../features'

async function toggle(type: 'comment' | 'uncomment' = 'comment') {
  const editor = window.activeTextEditor!

  const { document, document: { uri } } = editor
  const workspaceEdit = new WorkspaceEdit()
  const statements = getAllStatementRanges(editor.document)

  for (let i = 0; i < statements.length; i++) {
    const range = statements[i]
    const line = document.lineAt(range.start.line)

    const { firstNonWhitespaceCharacterIndex, text } = line

    const indents = text.slice(0, firstNonWhitespaceCharacterIndex)
    const content = text.slice(firstNonWhitespaceCharacterIndex)

    // TODO: 可能需要处理多行注释的情况
    // TODO: 可能有不是已 // 开头的注释，比如 python 的 # 开头的注释
    if (type === 'comment' && !content.startsWith('//')) {
      workspaceEdit.replace(uri, range, `${indents}// ${content}`)
    } else if (type === 'uncomment' && content.startsWith('//')) {
      workspaceEdit.replace(uri, range, `${indents}${content.replace(/\/\/\s*/, '')}`)
    }
  }

  await workspace.applyEdit(workspaceEdit)

  documentAutoSaver(editor)
}

export const commentDebuggers = toggle.bind(null, 'comment')

export const uncommentDebuggers = toggle.bind(null, 'uncomment')
