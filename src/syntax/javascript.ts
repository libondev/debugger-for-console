// export function getInsertLineNumber(editor: ActiveTextEditor, direction: 'before' | 'after' = 'after') {
//   const position = editor.selection.active
//   const openBrackets = ['{', '[', '(', '({']
//   const closeBrackets = ['}', ']', ')', '})']

//   if (direction === 'before') {
//     for (let i = position.line; i >= 0; i--) {
//       const line = editor.document.lineAt(i).text
//       const searchLimit = i === position.line ? position.character : line.length

//       for (let j = searchLimit - 1; j >= 0; j--) {
//         const char = line[j]
//         if (char === '' || closeBrackets.includes(char)) {
//           return i - 1
//         }
//       }
//     }
//   } else if (direction === 'after') {
//     for (let i = position.line; i < editor.document.lineCount; i++) {
//       const line = editor.document.lineAt(i).text
//       const searchStart = i === position.line ? position.character : 0

//       for (let j = searchStart; j < line.length; j++) {
//         const char = line[j]
//         if (char === '' || openBrackets.includes(char)) {
//           return i + 1
//         }
//       }
//     }
//   }

//   return position.line
// }

import { SymbolKind } from 'vscode'
import { getCurrentScopeSymbol } from '../features/symbols'

export async function isInJSObjectArrayOrFunctionParameter(editor: ActiveTextEditor) {
  const symbols = await getCurrentScopeSymbol(editor)

  // const cursorPos = editor.selection.active
  const currentSymbol = symbols.at(-1)!
  // const currentSymbol = symbols.find((symbol) => {
  //   const start = symbol.range.start
  //   const end = symbol.range.end
  //   return cursorPos.isAfterOrEqual(start) && cursorPos.isBeforeOrEqual(end)
  // })

  if (currentSymbol) {
    console.log(currentSymbol.kind, currentSymbol.range.end.line + 1, currentSymbol)

    switch (currentSymbol.kind) {
      case SymbolKind.Property:
      case SymbolKind.Enum:
      case SymbolKind.Interface:
      case SymbolKind.TypeParameter:
      case SymbolKind.Object:
      case SymbolKind.Array:
        console.log('作用域中，需要找到结束位置')
        break
    }
  }
}
