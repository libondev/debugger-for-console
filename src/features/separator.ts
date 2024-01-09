import { lazyValue } from '../utils/index'

const ONLY_OUTPUT_ONE_PARAMETER_LANGUAGE_ID = ['java']

export const getSeparator = lazyValue<string>(
  'onlyOutputVariable',
  (onlyVariable, languageId) => (onlyVariable === 'enable' || ONLY_OUTPUT_ONE_PARAMETER_LANGUAGE_ID.includes(languageId!))
    ? ' + '
    : ', '
  ,
)
