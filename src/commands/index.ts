import { createDebuggers, createDebuggersBefore } from './create'
import { removeDebuggers } from './remove'
import { toggleDebuggers } from './toggle'
import { updateUserConfig } from './update'

export const commandsMapping = {
  'debugger-for-console.create': createDebuggers,
  'debugger-for-console.before': createDebuggersBefore,
  'debugger-for-console.toggle': toggleDebuggers,
  'debugger-for-console.remove': removeDebuggers,
  'debugger-for-console.update': updateUserConfig,
} as const
