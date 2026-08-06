import type { TextDocument } from 'vscode'

import { tabSizeConfig } from '../config'

type ScopeSymbol = '{' | '[' | '('
type StringDelimiter = '"' | "'" | '`'

interface Scope {
  symbol: ScopeSymbol
  line: number
  column: number
  isStatementBoundary: boolean
  closeLine?: number
}

interface ScopeScanResult {
  activeScopes: Scope[]
}

const closeToOpenSymbol: Record<'}' | ']' | ')', ScopeSymbol> = {
  '}': '{',
  ']': '[',
  ')': '(',
}

const statementParenRegexp = /\b(?:if|for|while|switch|catch|with|function|def|fn)\s*(?:[\w$]+\s*)?$/
const statementBlockRegexp = /(?:=>|\)|\b(?:else|try|finally|do|class|interface|struct|enum|namespace|union|impl|match|select))\s*$/
const insertIndentRegexp = /[{[(:]\s*$/

function getLineIndent(document: TextDocument, line: number) {
  const { text, firstNonWhitespaceCharacterIndex } = document.lineAt(line)

  return text.slice(0, firstNonWhitespaceCharacterIndex)
}

function getIndentUnit(indent: string) {
  return indent.includes('\t') ? '\t' : ' '.repeat(tabSizeConfig.value)
}

function isStatementBoundary(
  symbol: ScopeSymbol,
  text: string,
  line: number,
  document: TextDocument,
) {
  const currentPrefix = text.trimEnd()
  const previousLine = line > 0 ? document.lineAt(line - 1).text.trimEnd() : ''
  const prefix = `${previousLine} ${currentPrefix}`.trim()

  if (symbol === '(') {
    return statementParenRegexp.test(prefix)
  }

  return symbol === '{' && statementBlockRegexp.test(prefix)
}

function scanScopes(document: TextDocument, targetLine: number): ScopeScanResult {
  const stack: Scope[] = []
  let activeScopes: Scope[] = []
  let stringDelimiter: StringDelimiter | undefined
  let isBlockComment = false

  for (let line = 0; line < document.lineCount; line += 1) {
    const text = document.lineAt(line).text

    for (let column = 0; column < text.length; column += 1) {
      const char = text[column]
      const nextChar = text[column + 1]

      if (isBlockComment) {
        if (char === '*' && nextChar === '/') {
          isBlockComment = false
          column += 1
        }
        continue
      }

      if (stringDelimiter) {
        if (char === '\\') {
          column += 1
        } else if (char === stringDelimiter) {
          stringDelimiter = undefined
        }
        continue
      }

      if (char === '/' && nextChar === '/') {
        break
      }

      if (char === '/' && nextChar === '*') {
        isBlockComment = true
        column += 1
        continue
      }

      if (char === '"' || char === "'" || char === '`') {
        stringDelimiter = char
        continue
      }

      if (char === '{' || char === '[' || char === '(') {
        stack.push({
          symbol: char,
          line,
          column,
          isStatementBoundary: isStatementBoundary(char, text.slice(0, column), line, document),
        })
        continue
      }

      if (char === '}' || char === ']' || char === ')') {
        const scope = stack.at(-1)
        if (scope?.symbol === closeToOpenSymbol[char]) {
          scope.closeLine = line
          stack.pop()
        }
      }
    }

    if (line === targetLine) {
      activeScopes = [...stack]
    }
  }

  return { activeScopes }
}

function getExpressionScope(activeScopes: Scope[]) {
  let expressionScope: Scope | undefined

  for (const scope of activeScopes) {
    if (scope.isStatementBoundary) {
      expressionScope = undefined
    } else if (!expressionScope) {
      expressionScope = scope
    }
  }

  return expressionScope
}

function getDirectInsertIndent(document: TextDocument, line: number, isCreatingAfter: boolean) {
  const indent = getLineIndent(document, line)
  const text = document.lineAt(line).text

  return isCreatingAfter && insertIndentRegexp.test(text) ? `${indent}${getIndentUnit(indent)}` : indent
}

// 获取作用域结束或开始的边界行和最终创建时的缩进
export function getBlockBoundaryLineWithIndent(
  document: TextDocument,
  line: number,
  offset: number,
) {
  const currentLine = document.lineAt(line)
  const isCreatingAfter = offset > 0

  // 如果当前行是空行则直接返回当前行
  if (currentLine.isEmptyOrWhitespace) {
    return {
      line: line + offset,
      indents: '',
    }
  }

  const { activeScopes } = scanScopes(document, line)
  const expressionScope = getExpressionScope(activeScopes)

  if (expressionScope?.closeLine !== undefined) {
    const boundaryLine = isCreatingAfter ? expressionScope.closeLine + 1 : expressionScope.line

    return {
      line: boundaryLine,
      indents: getLineIndent(document, isCreatingAfter ? expressionScope.closeLine : boundaryLine),
    }
  }

  return {
    line: line + offset,
    indents: getDirectInsertIndent(document, line, isCreatingAfter),
  }
}
