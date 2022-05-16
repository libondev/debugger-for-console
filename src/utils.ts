import { Range, workspace } from 'vscode'
import type {
  Selection,
  TextDocument,
  WorkspaceConfiguration,
} from 'vscode'

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

export function getDocumentTextBySelection(document: TextDocument, selection: Selection) {
  return document.getText(new Range(selection.start, selection.end))
}

// Reading the configuration returns the corresponding language statement
// 读取用户设置文件中的配置(如果没有设置则会使用插件预设的配置), 根据当前语言获取对应的语句
export function getStatementByLanguage(language: string, text = '') {
  const wrappers = getConfiguration('wrappers')
  const statement = (wrappers[language] || wrappers.default) as string

  text = text.trim()
  const label = text.replace(/\r\n/g, ',').replace(/(\"|'|`)/g, '\\$1')

  return statement
    .replace(/\#label/g, label)
    .replace(/\#value/g, text.replace(/\r\n/g, ',\n'))
}
