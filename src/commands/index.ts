import { comment, uncomment } from './comments'
import { create, createBefore } from './create'
import { remove } from './remove'
import { updateUserConfig } from './update'

export const commandsMapping = {
  'debugger-for-console.create': create,
  'debugger-for-console.before': createBefore,
  'debugger-for-console.remove': remove,
  'debugger-for-console.update': updateUserConfig,
  'debugger-for-console.comment': comment,
  'debugger-for-console.uncomment': uncomment,
} as const
