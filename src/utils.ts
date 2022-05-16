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
  const startAt = document.lineAt(lineNumber).firstNonWhitespaceCharacterIndex
  const indents = document.lineAt(lineNumber).text.substring(0, startAt)

  return {
    startAt,
    indents,
  }
}

// Reading the configuration returns the corresponding language statement
// 读取用户设置文件中的配置(如果没有则会使用插件预设的配置), 根据语言获取对应的语句并转义引号
export function getIndentStatementByLanguage({ document, text, indents, insertLineNumber }: WrapperContentParams) {
  const emptyLine = document.lineAt(insertLineNumber).isEmptyOrWhitespace
  const wrappers = getConfiguration('wrappers')
  const statement = (wrappers[document.languageId] || wrappers.default) as string
  const content = text.trim().replace(/\r\n/g, ',').replace(/(\"|'|`)/g, '\\$1')

  return `${(emptyLine ? indents : '')}${statement.replace(/%s/gu, content)}\r\n${indents}`
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
