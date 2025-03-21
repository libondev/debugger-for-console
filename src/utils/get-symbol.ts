import * as vscode from 'vscode'

/**
 * 获取当前光标位置的 Symbol
 * @returns Promise<vscode.SymbolInformation | undefined>
 */
export async function getCurrentSymbol(): Promise<vscode.SymbolInformation | undefined> {
  // 获取当前编辑器
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    return undefined
  }

  // 获取当前光标位置
  const position = editor.selection.active

  // 获取当前文档的所有符号
  const symbols = await vscode.commands.executeCommand<vscode.SymbolInformation[]>(
    'vscode.executeDocumentSymbolProvider',
    editor.document.uri,
  )

  if (!symbols || symbols.length === 0) {
    return undefined
  }

  // 查找光标所在的符号
  return symbols.find(symbol =>
    symbol.location.range.contains(position),
  )
}

/**
 * 获取当前光标位置的详细 DocumentSymbol（包含嵌套结构）
 * @returns Promise<vscode.DocumentSymbol | undefined>
 */
export async function getCurrentDocumentSymbol(): Promise<vscode.DocumentSymbol | undefined> {
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    return undefined
  }

  const position = editor.selection.active

  // 获取文档符号（包含层次结构）
  const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
    'vscode.executeDocumentSymbolProvider',
    editor.document.uri,
  )

  if (!symbols || symbols.length === 0) {
    return undefined
  }

  // 递归查找包含当前位置的符号
  return findSymbolAtPosition(symbols, position)
}

/**
 * 递归查找符号层次结构中包含指定位置的符号
 */
function findSymbolAtPosition(
  symbols: vscode.DocumentSymbol[],
  position: vscode.Position,
): vscode.DocumentSymbol | undefined {
  for (const symbol of symbols) {
    if (symbol.range.contains(position)) {
      // 先检查子符号
      if (symbol.children.length > 0) {
        const childSymbol = findSymbolAtPosition(symbol.children, position)
        if (childSymbol) {
          return childSymbol
        }
      }
      return symbol
    }
  }
  return undefined
}
