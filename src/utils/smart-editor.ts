import type { TextDocument, TextEditor } from 'vscode'
import { WorkspaceEdit, workspace } from 'vscode'

import { autoSave } from '../features/saver'

interface Change {
  type: 'insert' | 'replace' | 'delete'
  args: any
}

function createEditor(editor: TextEditor) {
  const changes: Change[] = []

  function collectChanges(type: Change['type'], ...args: Change['args']) {
    changes.push({ type, args })
  }

  return {
    insert: collectChanges.bind(null, 'insert'),
    replace: collectChanges.bind(null, 'replace'),
    delete: collectChanges.bind(null, 'delete'),
    async applyEdit() {
      await editor.edit((builder) => {
        changes.forEach(({ type, args }) => {
          (builder[type] as any)(...args)
        })
      })

      autoSave(editor)
    },
  }
}

function createWorkspace(editor: TextEditor, { uri }: TextDocument) {
  const edit = new WorkspaceEdit()

  return {
    insert: edit.insert.bind(edit, uri),
    replace: edit.replace.bind(edit, uri),
    delete: edit.delete.bind(edit, uri),
    async applyEdit() {
      await workspace.applyEdit(edit)

      autoSave(editor)
    },
  }
}

export function smartToggleEditor(
  useWorkspace: boolean,
  document: TextDocument,
  editor: TextEditor,
) {
  return useWorkspace
    ? createWorkspace(editor, document)
    : createEditor(editor)
}
