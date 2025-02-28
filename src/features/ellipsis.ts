import { lazyValue } from '../utils/index'

export const getEllipsis = lazyValue<boolean>(
  'ellipsis',
  v => v,
)
