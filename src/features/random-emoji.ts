import { resolvedConfig } from '../extension'

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
