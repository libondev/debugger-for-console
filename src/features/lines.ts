import { lazyValue } from '../utils/index'

export const getLines = lazyValue<number>(
  'lineNumber',
  (_, lineNumber) => `:${lineNumber}`,
)
