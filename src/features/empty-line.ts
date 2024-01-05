import { lazyValue } from '../utils/index'

export const getBeforeEmptyLine = lazyValue(
  'insertEmptyLineBeforeLogMessage',
  insertBefore => insertBefore ? '\n' : '',
)

export const getAfterEmptyLine = lazyValue(
  'insertEmptyLineAfterLogMessage',
  insertAfter => insertAfter ? '\n' : '',
)

export const getReplaceEmptyLine = lazyValue(
  'replaceEmptyLine',
  replaceEmpty => replaceEmpty,
)
