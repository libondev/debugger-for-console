import { Position, Range, window } from 'vscode'
import type { Selection, TextEditor } from 'vscode'

import type { WrapperResolveParams } from './types'

import { getIndentsByLineNumber, getStatementByLanguage } from './utils'

function logWrapper(this: TextEditor, arrow: 'top' | 'down') {
  new Promise<WrapperResolveParams>((resolve, reject) => {
    this.selections.forEach((selection: Selection) => {
      // Gets a selection if there is one, otherwise gets a participle.
      // 如果有选中的文本则获取选中的文本的范围, 如果没有选中的文本则获取当前光标所在的分词(某个单词或字符组合)
      const range = selection.end.character - selection.start.character
        ? new Range(selection.start, selection.end)
        : this.document.getWordRangeAtPosition(selection.anchor)

      if (!range) {
        return reject(new Error('No selection or word found'))
      }

      const { document } = this
      const lineNumber = range.start.line

      resolve({
        lineNumber,
        selection,
        document,
        text: document.getText(range),
      })
    })
  }).then(({ document, lineNumber, text }) => {
    const { startAt, indents } = getIndentsByLineNumber(document, lineNumber)

    this.edit((editBuilder) => {
      editBuilder.insert(
        new Position(arrow === 'top' ? lineNumber : lineNumber + 1, startAt),
        `${getStatementByLanguage(this.document.languageId, text)}\r\n${indents}`,
      )
    })
  }).catch((error: Error) => {
    window.showInformationMessage(error.message)
  })
}

export default logWrapper
