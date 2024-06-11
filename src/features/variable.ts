import { lazyValue } from '../utils/index'

const ONLY_OUTPUT_ONE_PARAMETER_LANGUAGE_ID = ['java']

export const getOnlyVariable = lazyValue<string>(
  'onlyOutputVariable',
  (isOnlyVariable, languageId) => (
    isOnlyVariable === 'enable' ||
    ONLY_OUTPUT_ONE_PARAMETER_LANGUAGE_ID.includes(languageId!)
  ),
)
