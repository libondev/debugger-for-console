import type { DocumentSymbol, Position, TextEditor } from 'vscode'
import { commands } from 'vscode'
import { resolvedConfig } from '../extension'

function findSymbols(symbols: DocumentSymbol[], position: Position): DocumentSymbol[] {
  return symbols.reduce((acc: DocumentSymbol[], symbol) => {
    if (symbol.range.contains(position) && symbol.range.start.line !== position.line) {
      acc.push(symbol, ...findSymbols(symbol.children, position))
    }
    return acc
  }, [])
}

export async function getEditorScopeSymbol({
  document: { uri },
  selection: { active },
}: TextEditor) {
  const symbols = await commands.executeCommand<DocumentSymbol[]>('vscode.executeDocumentSymbolProvider', uri)

  if (!symbols) {
    return []
  }

  return findSymbols(symbols, active)
}

const SEPARATORS = ' > '
export async function getScopeSymbols(editor: TextEditor) {
  if (!resolvedConfig.get('symbols')) {
    return ''
  }

  const symbols = await getEditorScopeSymbol(editor)

  if (!symbols.length) {
    return ''
  }

  return `@${symbols.reduce((acc, { name }) => `${acc}${SEPARATORS}${name}`, '').slice(SEPARATORS.length)}`
}
