import { lazyValue } from '../utils/index'

const EMOJIS = [
  '🚀', '🛸', '🛰️', '👑', '🔭', '✨', '🍀', '🍻', '🍿', '🍉',
  '🔥', '🥑', '🎡', '🍙', '📦', '📫', '🍟', '🍭', '🍩', '🌿',
]

export const getEmoji = lazyValue('emoji', () => {
  return EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
})
