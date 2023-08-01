import { sep } from 'node:path'
import { type TextDocument, workspace } from 'vscode'
import { resolvedConfig } from '../extension'

export function getFileDepth(document: TextDocument) {
  const depths = resolvedConfig.get('fileDepth')

  if (depths) {
    const relationFilePath = workspace.asRelativePath(document.fileName)
    const splitFilePaths = relationFilePath.split(new RegExp(`\\${sep}`))

    return ` ${splitFilePaths.slice(-depths).join('/')}`
  }

  return ''
}
