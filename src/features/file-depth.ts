import { type TextDocument, window, workspace } from 'vscode'
import { resolvedConfig } from '../extension'
import { getEllipsisString } from '../utils/shared'

const cachedPathMap = new WeakMap<TextDocument, string>()

export function resetFileDepthCache() {
  const editor = window.activeTextEditor
  if (!editor) {
    return
  }

  const document = editor.document
  cachedPathMap.delete(document)
}

export function getFileDepth(document: TextDocument) {
  if (!document?.fileName) {
    return ''
  }

  const depth = resolvedConfig.get<number>('fileDepth', 0)

  if (depth === 0) {
    return ''
  }

  const cachedPath = cachedPathMap.get(document)

  if (cachedPath) {
    return cachedPath
  }

  // Fixed the issue where the path could not be correctly captured when opening a file separately in the windows environment
  const relationFilePath = workspace.asRelativePath(document.fileName).replaceAll('\\', '/')

  let lastIndex = relationFilePath.length
  for (let i = 0; i < depth; i++) {
    lastIndex = relationFilePath.lastIndexOf('/', lastIndex - 1)
    if (lastIndex === -1) {
      break
    }
  }

  const level = getEllipsisString(relationFilePath.slice(lastIndex + 1))

  cachedPathMap.set(document, level)

  return level
}
