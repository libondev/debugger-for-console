import { Position, Range, window } from 'vscode'
import type { TextEditor } from 'vscode'
import type { InsertPosition, WrapperResolveParams } from './types'

import {
  getIndentStatementByLanguage,
  getIndentsByLineNumber,
  getTargetLineByLineNumber,
} from './utils'

async function logWrapper(this: TextEditor, arrow: InsertPosition) {
  const { selection, document } = this

  new Promise<WrapperResolveParams>((resolve, reject) => {
    // Gets a selection if there is one, otherwise gets a participle.
    // 如果有选中的文本则获取选中的文本的范围, 如果没有选中的文本则获取当前光标所在的分词(某个单词或字符组合)
    const range = selection.end.character - selection.start.character ?
      new Range(selection.start, selection.end) :
      this.document.getWordRangeAtPosition(selection.anchor)

    if (!range) {
      return reject(new Error('No selection or word found'))
    }

    resolve({ lineNumber: range.start.line, text: document.getText(range) })
  }).then(({ lineNumber, text }) => {
    const { startAt, indents } = getIndentsByLineNumber(document, lineNumber)

    this.edit((editor) => {
      const insertLineNumber = getTargetLineByLineNumber(document, lineNumber, arrow)
      editor.insert(
        new Position(insertLineNumber, startAt),
        getIndentStatementByLanguage({ document, indents, text, insertLineNumber }),
      )
    })
  }).catch((error: Error) => {
    window.showInformationMessage(error.message)
  })
}

export default logWrapper
