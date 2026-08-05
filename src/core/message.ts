import type { TextDocument } from 'vscode'
import { window, workspace } from 'vscode'

import { resolvedConfig } from '../config'

const DEFAULT_EMOJIS = [
  '🚀',
  '🛸',
  '🛰️',
  '👑',
  '🔭',
  '✨',
  '🍀',
  '🍻',
  '🍿',
  '🍉',
  '🔥',
  '🥑',
  '🎡',
  '🍙',
  '📦',
  '📫',
  '🍟',
  '🍭',
  '🍩',
  '🌿',
]

export function getRandomEmoji() {
  if (resolvedConfig.get('emoji')) {
    const customEmojiList = resolvedConfig.get<string[]>('emojiList', [])
    const emojiList = customEmojiList.length > 0 ? customEmojiList : DEFAULT_EMOJIS

    return emojiList[Math.floor(Math.random() * emojiList.length)]
  }

  return ''
}

const cachedPathMap = new WeakMap<TextDocument, string>()

export function resetFileDepthCache() {
  const editor = window.activeTextEditor
  if (!editor) {
    return
  }

  const document = editor.document
  cachedPathMap.delete(document)
}

export function getFileDepth(document: TextDocument) {
  if (!document?.fileName) {
    return ''
  }

  const depth = resolvedConfig.get<number>('fileDepth', 0)

  if (depth === 0) {
    return ''
  }

  const cachedPath = cachedPathMap.get(document)

  if (cachedPath) {
    return cachedPath
  }

  // Fixed the issue where the path could not be correctly captured when opening a file separately in the windows environment
  const relationFilePath = workspace.asRelativePath(document.fileName).replaceAll('\\', '/')

  let lastIndex = relationFilePath.length
  for (let i = 0; i < depth; i++) {
    lastIndex = relationFilePath.lastIndexOf('/', lastIndex - 1)
    if (lastIndex === -1) {
      break
    }
  }

  const level = getEllipsisString(relationFilePath.slice(lastIndex + 1))

  cachedPathMap.set(document, level)

  return level
}

export function getNumberLine(lineNumber: number) {
  const configValue = resolvedConfig.get<boolean>('lineNumber')

  if (configValue) {
    return `:${lineNumber}`
  }

  return ''
}

export function getIsEllipsis() {
  return resolvedConfig.get<boolean>('ellipsis', false)
}

export function getOutputNewline() {
  return resolvedConfig.get<boolean>('outputNewline', false) ? '\\n' : ''
}

const ONLY_OUTPUT_ONE_PARAMETER_LANGUAGE_ID = ['java']

export function getOnlyVariable(languageId: string) {
  const isOnlyVariable = resolvedConfig.get<string>('onlyVariable', 'auto')

  return isOnlyVariable === 'enable' || ONLY_OUTPUT_ONE_PARAMETER_LANGUAGE_ID.includes(languageId)
}

const ELLIPSIS_REGEX = /^(.{3}).*/
const ELLIPSIS_MAX_LENGTH = 10

// 获取精简后的字符串内容
export function getEllipsisString(str: string, trimQuotes?: boolean) {
  if (trimQuotes) {
    str = str.replace(/['"`\\]/g, '')
  }

  if (getIsEllipsis()) {
    let newStr = str

    if (newStr.length >= ELLIPSIS_MAX_LENGTH) {
      newStr = newStr.replace(ELLIPSIS_REGEX, '$1…')
    }

    return newStr
  }

  return str
}
