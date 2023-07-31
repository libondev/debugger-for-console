import { commentDebuggers, uncommentDebuggers } from './comments'
import { createDebuggers, createDebuggersBefore } from './create'
import { removeDebuggers } from './remove'
import { updateUserConfig } from './update'

export const commandsMapping = {
  'debugger-for-console.comment': commentDebuggers,
  'debugger-for-console.uncomment': uncommentDebuggers,
  'debugger-for-console.create': createDebuggers,
  'debugger-for-console.before': createDebuggersBefore,
  'debugger-for-console.remove': removeDebuggers,
  'debugger-for-console.update': updateUserConfig,
} as const
