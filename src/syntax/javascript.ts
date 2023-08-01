// export function getInsertLineNumber(editor: TextEditor, direction: 'before' | 'after' = 'after') {
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
