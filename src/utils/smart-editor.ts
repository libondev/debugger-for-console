import type { Position, Range, TextDocument, TextEditor, Uri } from 'vscode'
import { WorkspaceEdit, workspace } from 'vscode'

interface UnifiedEditBuilder {
  insert(position: Position, content: string): void
  replace(range: Range, newText: string): void
  delete(range: Range): void
  apply(): Promise<boolean>
  reset(): void
}

class EditBuilderPool {
  private static workspacePool: WorkspaceEditBuilder[] = []
  private static editorPool: EditorEditBuilder[] = []
  private static readonly MAX_POOL_SIZE = 5

  static acquireWorkspaceBuilder(uri: Uri): WorkspaceEditBuilder {
    let builder = this.workspacePool.pop()
    if (!builder) {
      builder = new WorkspaceEditBuilder(uri)
    } else {
      builder.setUri(uri)
    }
    return builder
  }

  static acquireEditorBuilder(editor: TextEditor): EditorEditBuilder {
    let builder = this.editorPool.pop()
    if (!builder) {
      builder = new EditorEditBuilder(editor)
    } else {
      builder.setEditor(editor)
    }
    return builder
  }

  static release(builder: UnifiedEditBuilder): void {
    if (builder instanceof WorkspaceEditBuilder) {
      if (this.workspacePool.length < this.MAX_POOL_SIZE) {
        builder.reset()
        this.workspacePool.push(builder)
      }
    } else if (builder instanceof EditorEditBuilder) {
      if (this.editorPool.length < this.MAX_POOL_SIZE) {
        builder.reset()
        this.editorPool.push(builder)
      }
    }
  }

  static clear(): void {
    this.workspacePool = []
    this.editorPool = []
  }
}

class WorkspaceEditBuilder implements UnifiedEditBuilder {
  private workspaceEdit: WorkspaceEdit
  private uri!: Uri
  private operations: Array<[Position | Range, string | null]> = []
  private operationType: Array<'insert' | 'replace' | 'delete'> = []

  constructor(uri: Uri) {
    this.workspaceEdit = new WorkspaceEdit()
    this.setUri(uri)
  }

  setUri(uri: Uri): void {
    this.uri = uri
  }

  insert(position: Position, content: string): void {
    this.operations.push([position, content])
    this.operationType.push('insert')
  }

  replace(range: Range, newText: string): void {
    this.operations.push([range, newText])
    this.operationType.push('replace')
  }

  delete(range: Range): void {
    this.operations.push([range, null])
    this.operationType.push('delete')
  }

  async apply(): Promise<boolean> {
    for (let i = 0; i < this.operations.length; i++) {
      const [target, content] = this.operations[i]
      switch (this.operationType[i]) {
        case 'insert':
          this.workspaceEdit.insert(this.uri, target as Position, content!)
          break
        case 'replace':
          this.workspaceEdit.replace(this.uri, target as Range, content!)
          break
        case 'delete':
          this.workspaceEdit.delete(this.uri, target as Range)
          break
      }
    }

    const result = await workspace.applyEdit(this.workspaceEdit)
    EditBuilderPool.release(this)
    return result
  }

  reset(): void {
    this.workspaceEdit = new WorkspaceEdit()
    this.operations = []
    this.operationType = []
  }
}

class EditorEditBuilder implements UnifiedEditBuilder {
  private editor!: TextEditor
  private operations: Array<[Position | Range, string | null]> = []
  private operationType: Array<'insert' | 'replace' | 'delete'> = []

  constructor(editor: TextEditor) {
    this.setEditor(editor)
  }

  setEditor(editor: TextEditor): void {
    this.editor = editor
  }

  insert(position: Position, content: string): void {
    this.operations.push([position, content])
    this.operationType.push('insert')
  }

  replace(range: Range, newText: string): void {
    this.operations.push([range, newText])
    this.operationType.push('replace')
  }

  delete(range: Range): void {
    this.operations.push([range, null])
    this.operationType.push('delete')
  }

  async apply(): Promise<boolean> {
    const result = await this.editor.edit((builder) => {
      for (let i = 0; i < this.operations.length; i++) {
        const [target, content] = this.operations[i]
        switch (this.operationType[i]) {
          case 'insert':
            builder.insert(target as Position, content!)
            break
          case 'replace':
            builder.replace(target as Range, content!)
            break
          case 'delete':
            builder.delete(target as Range)
            break
        }
      }
    })
    EditBuilderPool.release(this)
    return result
  }

  reset(): void {
    this.operations = []
    this.operationType = []
  }
}

let lastBuilder: UnifiedEditBuilder | null = null
let lastDocument: TextDocument | null = null
let lastUseWorkspace: boolean | null = null

export function smartToggleEditor(
  useWorkspace: boolean,
  document: TextDocument,
  editor: TextEditor,
): UnifiedEditBuilder {
  if (
    lastBuilder &&
    lastDocument === document &&
    lastUseWorkspace === useWorkspace
  ) {
    lastBuilder.reset()
    return lastBuilder
  }

  const builder = useWorkspace
    ? EditBuilderPool.acquireWorkspaceBuilder(document.uri)
    : EditBuilderPool.acquireEditorBuilder(editor)

  lastBuilder = builder
  lastDocument = document
  lastUseWorkspace = useWorkspace

  return builder
}

export function disposePool(): void {
  lastBuilder = null
  lastDocument = null
  lastUseWorkspace = null

  EditBuilderPool.clear()
}
