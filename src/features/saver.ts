import type { TextEditor } from 'vscode'
import { lazyValue } from '../utils/index'

export const autoSave = lazyValue<TextEditor>(
  'autoSave',
  (_, editor) => { editor!.document.save() },
)
