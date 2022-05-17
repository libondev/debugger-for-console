import { workspace } from 'vscode'
import type {
  TextDocument,
  WorkspaceConfiguration,
} from 'vscode'

import type { InsertPosition, WrapperContentParams } from './types'

// Gets the configuration items for the plug-in in the workspace
// 获取工作区中的插件配置项
export function getConfiguration(
  configKey: keyof WorkspaceConfiguration,
) {
  return workspace.getConfiguration(`debugger-for-console.${configKey}`)
}

// Gets the corresponding indentation size based on the line number
// 根据行号获取对应的缩进大小
export function getIndentsByLineNumber(document: TextDocument, lineNumber: number) {
  const { text, firstNonWhitespaceCharacterIndex } = document.lineAt(lineNumber)
  return text.substring(0, firstNonWhitespaceCharacterIndex)
}

// Reading the configuration returns the corresponding language statement
// 读取用户设置文件中的配置(如果没有则会使用插件预设的配置), 获取对应的调试语句
export function getDebuggerStatementByLanguage(document: TextDocument) {
  const wrappers = getConfiguration('wrappers')
  return (wrappers[document.languageId] || wrappers.default) as string
}

// Gets a debug statement inserted into the document
// 获取插入到文档中的调试语句
export function getInsertTextByLanguage({ document, text, indents }: WrapperContentParams) {
  const statement = getDebuggerStatementByLanguage(document)
  const content = text.trim().replace(/\r\n/g, ',').replace(/(\"|'|`)/g, '\\$1')

  return `${indents}${statement.replace(/%s/gu, content)}\r\n`
}

// Gets the line number of the target line
// 根据当前行号获取插入目标行号
export function getTargetLineByLineNumber(document: TextDocument, lineNumber: number, arrow: InsertPosition) {
  if (arrow === 'before' && lineNumber === 0) {
    return 0
  } else if (arrow === 'after' && lineNumber !== document.lineCount - 1) {
    return lineNumber + 1
  }

  return lineNumber
}
