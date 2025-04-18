import type { Position, Selection, TextDocument } from 'vscode'

const BREAK_CHARACTER = ' \t\n={}()[]'

// only special characters
// 如果内容不是英文字符/数字/_/$ 的话则返回空字符串
const ONLY_HAS_SYMBOL_REGEX = /^[^a-zA-Z0-9_$]+$/

// 是不是已特殊符号作为字符串的开头
const IS_SYMBOL_START_REGEX = /^[}\])?.=;]*([\s\S]*?)(?:[{([?.=;]*)$/

// 用于判断是否处于函数参数中
const IS_IN_FN_PARAMETER_REGEX = /.*?(\()\S*|\D+/

const IS_TAIL_SYMBOL_ENDS_REGEX = /\?/

/**
 * Is member call
 * 是否是方法/属性调用的符号作为起始位置
 * @example
 * ```
 * .test
 * ?.test
 * ::stdout()
 * ```
 */
const IS_MEMBER_CALL = ['.', ':', '!.', '?.']

const PAIRED_STRING_MAP = {
  '"': '"',
  '`': '`',
  '/': '/',
  '\'': '\'',
}

const PAIRED_BRACKET_MAP = {
  '(': ')',
  '{': '}',
  '[': ']',
}

type PairedSymbolKeys = keyof typeof PAIRED_STRING_MAP

// Find the correct character position at the beginning/end of the string
// 如果成对的符号没有正确闭合的话则继续查找正确的闭合位置
function ensureCorrectPosition(text: string, start: number, char: string, reverse: boolean) {
  const searchMethod = reverse ? text.lastIndexOf.bind(text) : text.indexOf.bind(text)

  const offset = reverse ? -1 : 1

  let idx = searchMethod(char, start + offset)

  while (idx >= 0 && text[idx - 1] === '\\') {
    idx = searchMethod(char, idx + offset)
  }

  return reverse ? idx : idx + offset
}

// Get the word at the given position
function getCorrectVariableScope(document: TextDocument, anchorPosition: Position): string {
  const { isEmptyOrWhitespace, text } = document.lineAt(anchorPosition.line)

  // empty line or no word
  if (isEmptyOrWhitespace) {
    return ''
  }

  let startAt = anchorPosition.character
  let endAt = anchorPosition.character

  // 读取自带的分词
  const word = document.getWordRangeAtPosition(anchorPosition)

  if (word) {
    startAt = word.start.character
    endAt = word.end.character
  }

  // Until the first delimiter is found
  // 直到找到第一个隔断符
  while (startAt > 0 && !BREAK_CHARACTER.includes(text[startAt - 1])) {
    startAt--
  }

  // trim tail semicolon
  let content = text.slice(startAt, endAt).replace(/;*$/, '')

  // js spread operator
  if (content.startsWith('...')) {
    return content.slice(3)
  }

  // is empty text, or only special characters, or member call
  // e.g.: obj.value?.[0]?.test(  );
  //                           ^  ^
  if (startAt === endAt || IS_MEMBER_CALL.some(s => content.startsWith(s))) {
    const whitespaceIndex = text.lastIndexOf(' ', startAt) + 1
    content = text.slice(whitespaceIndex, endAt)

    // 上面直接截取到开头可能会得到这种结果：setSelectedImage(result.assets[0].uri)
    //                          ^                                    ^
    // 这种结果一般是想要获取到函数调用时传入的参数，所以需要从 '(' 开始截取
    if (IS_IN_FN_PARAMETER_REGEX.test(content)) {
      const breakPoint = content.indexOf('(') + 1

      return content.slice(breakPoint)
    }

    // If the content is only special characters, return an empty string, e.g.: '{}', '()', '[]'
    if (ONLY_HAS_SYMBOL_REGEX.test(content)) {
      return ''
    }

    return content.replace(IS_SYMBOL_START_REGEX, '$1')
  }

  // only character: '.', ')', ']', etc.
  if (ONLY_HAS_SYMBOL_REGEX.test(content)) {
    return ''
  }

  /**
   * gets the starting and ending positions of paired strings
   * 获取成对的字符串开始和结束位置
   * @example
   * ```js
   * 'lorem -> 'lorem'
   * "lorem -> "lorem"
   * `lorem -> `lorem`
   * [lorem -> [lorem]
   * (lorem -> (lorem)
   * ```
   */
  const startPairedSymbol = PAIRED_STRING_MAP[content[0] as PairedSymbolKeys]
  const endPairedSymbol = PAIRED_STRING_MAP[content[content.length - 1] as PairedSymbolKeys]

  if (startPairedSymbol && !endPairedSymbol) {
    endAt = ensureCorrectPosition(text, startAt, startPairedSymbol, false)

    return text.slice(startAt, endAt)
  } else if (!startPairedSymbol && endPairedSymbol) {
    startAt = ensureCorrectPosition(text, startAt, endPairedSymbol, true)

    return text.slice(startAt, endAt)
  }

  return content.replace(IS_TAIL_SYMBOL_ENDS_REGEX, '')
}

// Get the completed variable(获取补全的变量名称)
export function getVariableCompletion(document: TextDocument, selection: Selection): string {
  // If the selection of the cursor is empty,
  // the selection is obtained in a form conforming to the programming grammar.
  if (selection.isEmpty) {
    const variableString = getCorrectVariableScope(document, selection.anchor)

    const lastChar = variableString[variableString.length - 1]

    // 补全结尾的括号，比如: 'foo(' => 'foo()'
    if (lastChar in PAIRED_BRACKET_MAP) {
      return variableString + PAIRED_BRACKET_MAP[lastChar as keyof typeof PAIRED_BRACKET_MAP]
    }

    return variableString
  }

  const { isEmptyOrWhitespace, text } = document.lineAt(selection.start.line)

  if (isEmptyOrWhitespace) {
    return ''
  }

  return text.slice(selection.start.character, selection.end.character)
}
