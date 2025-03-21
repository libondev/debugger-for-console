import { type TextDocument, window, workspace } from 'vscode'
import { resolvedConfig } from '../extension'
import { getEllipsisString } from '../utils/index'

const cachedPathMap = new WeakMap<TextDocument, string>()

export function resetDepthCache() {
  const editor = window.activeTextEditor
  if (!editor) {
    return
  }

  const document = editor.document
  cachedPathMap.delete(document)
}

export function getDepth(document: TextDocument) {
  if (!document?.fileName) {
    return ''
  }

  const depth = resolvedConfig.get('fileDepth', 0)

  if (depth === 0) {
    return ''
  }

  const cachedPath = cachedPathMap.get(document)

  if (cachedPath) {
    return cachedPath
  }

  const relationFilePath = workspace.asRelativePath(document.fileName)

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
