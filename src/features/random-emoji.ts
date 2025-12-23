import { resolvedConfig } from '../extension'

const EMOJIS = [
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
    return EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
  }

  return ''
}
