import { sep } from 'node:path'
import { workspace } from 'vscode'
import { resolvedConfig } from '../extension'

export function getFileDepth(editor: ActiveTextEditor) {
  const depths = resolvedConfig.get('fileDepth')

  if (depths) {
    const relationFilePath = workspace.asRelativePath(editor.document.fileName)
    const splitFilePaths = relationFilePath.split(new RegExp(`\\${sep}`))

    return ` ${splitFilePaths.slice(-depths).join('/')}`
  }

  return ''
}
