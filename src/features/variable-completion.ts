import type { Position, Selection, TextDocument } from 'vscode'

const BREAK_CHARACTER = ' \t\n={}()[]'

// only special characters
// 如果内容不是英文字符/数字/_/$ 的话则返回空字符串
const ONLY_HAS_SYMBOL_REGEX = /^[^\w$]+$/

// 是不是已特殊符号作为字符串的开头
const IS_SYMBOL_STARTS_WITH_REGEX = /^[}\])?.=;]*([\s\S]*?)(?:[{([?.=;]*)$/

/**
 * 判断内容末尾是否处于“函数调用参数输入中”（存在未闭合的 '('）
 * - e.g. `setSelectedImage(result.assets[0].uri` -> `result.assets[0].uri`
 * - e.g. `h(App)` -> null（括号已闭合，不应当被认为在参数输入中）
 */
function getUnclosedCallArgsTail(content: string): string | null {
  const openParenStack: number[] = []

  // 仅做轻量字符串跳过：避免字符串里的 '(' ')' 干扰判断
  let inQuote: "'" | '"' | '`' | null = null

  for (let i = 0; i < content.length; i++) {
    const ch = content[i]

    if (inQuote) {
      // 处理转义引号
      if (ch === inQuote && content[i - 1] !== '\\') {
        inQuote = null
      }
      continue
    }

    if (ch === "'" || ch === '"' || ch === '`') {
      inQuote = ch
      continue
    }

    if (ch === '(') {
      openParenStack.push(i)
      continue
    }

    if (ch === ')' && openParenStack.length) {
      openParenStack.pop()
    }
  }

  if (!openParenStack.length) {
    return null
  }

  const lastOpenParenIndex = openParenStack[openParenStack.length - 1]
  return content.slice(lastOpenParenIndex + 1)
}

const IS_TAIL_SYMBOL_ENDS_REGEX = /^\?|\?$/g

const PURE_VARIABLE_REGEX = /^[^\w$]+|[^\w$!]+$/g

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
const IS_MEMBER_CALL = /^(\.|\?\.|!\.|:)/

const PAIRED_STRING_MAP = {
  '"': '"',
  '`': '`',
  '/': '/',
  "'": "'",
}

const PAIRED_BRACKET_MAP = {
  '(': ')',
  '{': '}',
  '[': ']',
}

type PairedSymbolKeys = keyof typeof PAIRED_STRING_MAP

// 补全结尾缺失的括号
function completionBracket(content: string) {
  const matchedBracket =
    PAIRED_BRACKET_MAP[content[content.length - 1] as keyof typeof PAIRED_BRACKET_MAP]

  if (matchedBracket) {
    return content + matchedBracket
  }

  return content
}

// Find the correct character position at the beginning/end of the string
// 如果成对的符号没有正确闭合的话则继续查找正确的闭合位置
function ensureCorrectBracketPosition(text: string, start: number, char: string, reverse: boolean) {
  const searchMethod = reverse ? text.lastIndexOf.bind(text) : text.indexOf.bind(text)

  const offset = reverse ? -1 : 1

  let idx = searchMethod(char, start + offset)

  while (idx >= 0 && text[idx - 1] === '\\') {
    idx = searchMethod(char, idx + offset)
  }

  return reverse ? idx : idx + offset
}

// Get the word at the given position
function getCorrectVariableScope(
  document: TextDocument,
  anchorPosition: Position,
  text: string,
): string {
  let startAt = anchorPosition.character
  let endAt = text.indexOf(';', startAt)

  endAt = endAt === -1 ? anchorPosition.character : Math.min(endAt, text.length)

  // 读取自带的分词
  const word = document.getWordRangeAtPosition(anchorPosition)

  if (word) {
    startAt = word.start.character
    endAt = word.end.character
  }

  // 直到找到第一个隔断符或者到了行首
  while (startAt > 0 && !BREAK_CHARACTER.includes(text[startAt - 1])) {
    startAt--
  }

  // trim tail semicolon
  let content = text.slice(startAt, endAt)

  // js spread operator
  if (content.startsWith('...')) {
    return content.split(' ')[0].replace(PURE_VARIABLE_REGEX, '')
  }

  // 空文本，或者只有特殊字符，或者方法/属性调用的符号作为起始位置
  // e.g.: obj.value?.[0]?.test(  );
  //                           ^  ^
  if (startAt === endAt || IS_MEMBER_CALL.test(content)) {
    const whitespaceIndex = text.slice(0, startAt).lastIndexOf(' ') + 1
    content = text.slice(whitespaceIndex, endAt)

    // 上面直接截取到开头可能会得到这种结果：setSelectedImage(result.assets[0].uri)
    //                               ^                                   ^
    // 如果截取到的参数是未闭合的函数调用参数，则返回函数调用时的参数
    const unclosedCallArgsTail = getUnclosedCallArgsTail(content)
    if (unclosedCallArgsTail !== null) {
      return unclosedCallArgsTail
    }

    return content.replace(IS_SYMBOL_STARTS_WITH_REGEX, '$1')
  }

  // 只有特殊字符: '.', ')', ']' 时则返回空内容
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
    endAt = ensureCorrectBracketPosition(text, startAt, startPairedSymbol, false)

    return text.slice(startAt, endAt)
  } else if (!startPairedSymbol && endPairedSymbol) {
    startAt = ensureCorrectBracketPosition(text, startAt, endPairedSymbol, true)

    return text.slice(startAt, endAt)
  }

  return content.replace(IS_TAIL_SYMBOL_ENDS_REGEX, '')
}

// Get the completed variable(获取补全的变量名称)
export function getVariableCompletion(document: TextDocument, selection: Selection): string {
  const { isEmptyOrWhitespace, text } = document.lineAt(selection.start.line)

  // 空行时不进行补全
  if (isEmptyOrWhitespace) {
    return ''
  }

  // 没有选中内容时则以光标所在位置的变量作为补全内容
  if (selection.isEmpty) {
    const variableString = getCorrectVariableScope(document, selection.anchor, text)

    return completionBracket(variableString)
  }

  // 否则直接截取选中内容
  return text.slice(selection.start.character, selection.end.character)
}
