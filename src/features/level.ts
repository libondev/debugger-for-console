import { type TextDocument, workspace } from 'vscode'
import { resolvedConfig } from '../extension'

export function getLevel(document: TextDocument) {
  const depth = resolvedConfig.get('fileDepth', 0)

  if (depth === 0) {
    return ''
  }

  const relationFilePath = workspace.asRelativePath(document.fileName)

  let lastIndex = relationFilePath.length
  for (let i = 0; i < depth; i++) {
    lastIndex = relationFilePath.lastIndexOf('/', lastIndex - 1)
    if (lastIndex === -1) {
      break
    }
  }

  return relationFilePath.slice(lastIndex + 1)
}
