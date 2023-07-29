import type { DocumentSymbol, Position } from 'vscode'
import { commands } from 'vscode'
import type { ActiveTextEditor } from '../types/global'

export async function getCurrentScopeSymbol({ document: { uri }, selection: { active } }: ActiveTextEditor) {
  const symbols = await commands.executeCommand<DocumentSymbol[]>('vscode.executeDocumentSymbolProvider', uri)

  if (!symbols) {
    return ''
  }

  let scopeSymbols: DocumentSymbol[] = []

  for (const symbol of symbols) {
    if (symbol.range.contains(active)) {
      scopeSymbols.push(symbol)
      scopeSymbols = scopeSymbols.concat(findNestedSymbols(symbol, active))
    }
  }

  return scopeSymbols.map(({ name }) => name).join(' > ')
}

function findNestedSymbols(symbol: DocumentSymbol, position: Position): DocumentSymbol[] {
  let nestedSymbols: DocumentSymbol[] = []

  for (const child of symbol.children) {
    if (child.range.contains(position)) {
      nestedSymbols.push(child)
      nestedSymbols = nestedSymbols.concat(findNestedSymbols(child, position))
    }
  }

  return nestedSymbols
}
