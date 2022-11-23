import { Position, Range, type TextEditor, window } from 'vscode'
import type { InsertPosition, WrapperResolveParams } from '../types'

import {
  getConfiguration,
  getIndentsByLineNumber,
  getInsertTextByLanguage,
  getTargetLineByLineNumber,
} from '../utils'

async function insertVariableLogger(this: TextEditor, arrow: InsertPosition) {
  const { selection, document } = this

  new Promise<WrapperResolveParams>((resolve, reject) => {
    const insertLine = document.lineAt(selection.end.line)

    // Gets a selection if there is one, otherwise gets a participle.
    // 如果有选中的文本则获取选中的文本的范围, 如果没有选中的文本则获取当前光标所在的分词(某个单词或字符组合)
    const range = selection.end.character - selection.start.character ?
      new Range(selection.start, selection.end) :
      this.document.getWordRangeAtPosition(selection.anchor)

    if (!range && insertLine.isEmptyOrWhitespace) {
      return resolve({ lineNumber: insertLine.lineNumber, text: '' })
    } else if (!range) {
      return reject(new Error('No selection or word found.'))
    }

    resolve({ lineNumber: range.end.line, text: document.getText(range) })
  }).then(({ lineNumber, text }) => {
    const indents = getIndentsByLineNumber(document, lineNumber)
    const insertLineNumber = getTargetLineByLineNumber(document, lineNumber, arrow)

    this.edit(async (editor) => {
      editor.insert(
        new Position(insertLineNumber, 0),
        getInsertTextByLanguage({ document, indents, lineNumber, text }),
      )

      await Promise.resolve()
      getConfiguration('autoSave') && document.save()
    })
  }).catch((error: Error) => {
    window.showInformationMessage(error.message)
  })
}

export default insertVariableLogger
