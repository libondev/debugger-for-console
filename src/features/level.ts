import { type TextDocument, workspace } from 'vscode'
import { lazyValue } from '../utils/index'

export const getLevel = lazyValue<TextDocument>(
  'fileDepth',
  (depths, document) => {
    const relationFilePath = workspace.asRelativePath(document!.fileName)
    const splitFilePaths = relationFilePath.split('/')

    return ` ${splitFilePaths.slice(-depths).join('/')}`
  },
)
