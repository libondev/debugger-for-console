import type { Position, Selection, TextDocument } from 'vscode'

const BREAK_CHARACTER = ' \t\n={}()[]'

// only special characters
// 如果内容不是英文字符/数字/_/$ 的话则返回空字符串
const ONLY_HAS_SYMBOL_REGEX = /^[^a-zA-Z0-9_$]+$/

// 是不是已特殊符号作为字符串的开头
const IS_SYMBOL_START_REGEX = /^[}\])?.=;]*([\s\S]*?)(?:[{([?.=;]*)$/

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

// 成对符号的映射
const PAIRED_SYMBOL_MAP = {
  '(': ')',
  '{': '}',
  '[': ']',
  '"': '"',
  '`': '`',
  '\'': '\'',
}

type PairedSymbolKeys = keyof typeof PAIRED_SYMBOL_MAP

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
  while (text[endAt - 1] === ';') {
    endAt--
  }

  let content = text.slice(startAt, endAt)

  // js spread operator
  if (content.startsWith('...')) {
    return content.slice(3)
  }

  // is empty text, or only special characters, or member call
  // e.g.: obj.value?.[0]?.test(  );
  //                           ^  ^
  if (startAt === endAt || IS_MEMBER_CALL.some(s => content.startsWith(s))) {
    // Find the position of the first space from the starting position to the left,
    // Avoid including truncated spaces, so + 1 is required.
    // 从开始位置向左查找第一个空格的位置，避免包含截断的空格，所以需要 +1
    const whitespaceIndex = text.lastIndexOf(' ', startAt) + 1

    content = text.slice(whitespaceIndex, endAt)

    // If the content is only special characters, return an empty string, e.g.: '{}', '()', '[]'
    if (ONLY_HAS_SYMBOL_REGEX.test(content)) {
      return ''
    }

    const lastChar = content[content.length - 1] as PairedSymbolKeys

    // Add brackets if the last character is a bracket. e.g. 'foo(' => 'foo()'
    // 补全结尾的括号
    if (lastChar in PAIRED_SYMBOL_MAP) {
      content += PAIRED_SYMBOL_MAP[lastChar]
    }

    return content.replace(IS_SYMBOL_START_REGEX, '$1')
  }

  // only character: '.', ')', ']', etc.
  if (ONLY_HAS_SYMBOL_REGEX.test(content)) {
    return ''
  }

  /**
   * get the start and end key paired symbol
   * 获取成对符号的开始和结束符号
   * @example
   * ```js
   * 'lorem -> 'lorem'
   * "lorem -> "lorem"
   * `lorem -> `lorem`
   * [lorem -> [lorem]
   * (lorem -> (lorem)
   * ```
   */
  const startPairedSymbol = PAIRED_SYMBOL_MAP[content[0] as PairedSymbolKeys]
  const endPairedSymbol = PAIRED_SYMBOL_MAP[content[content.length - 1] as PairedSymbolKeys]

  if (startPairedSymbol && !endPairedSymbol) {
    endAt = ensureCorrectPosition(text, startAt, startPairedSymbol, false)

    return text.slice(startAt, endAt)
  } else if (!startPairedSymbol && endPairedSymbol) {
    startAt = ensureCorrectPosition(text, startAt, endPairedSymbol, true)

    return text.slice(startAt, endAt)
  }

  return content.replace(IS_TAIL_SYMBOL_ENDS_REGEX, '')
}

export function getScope(document: TextDocument, selection: Selection): string {
  // If the selection of the cursor is empty,
  // the selection is obtained in a form conforming to the programming grammar.
  if (selection.isEmpty) {
    return getCorrectVariableScope(document, selection.anchor)
  }

  const { isEmptyOrWhitespace, text } = document.lineAt(selection.start.line)

  if (isEmptyOrWhitespace) {
    return ''
  }

  return text.slice(selection.start.character, selection.end.character)
}
