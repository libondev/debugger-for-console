import type { Range, TextDocument, TextLine } from 'vscode'

import { VARIABLE_PLACEHOLDER_REGEX, getLanguageStatement } from './language'

// 获取多行语句的开始/结束行
function getMultiLineStatement(document: TextDocument, line: TextLine) {
  let nextLine = document.lineAt(line.lineNumber + 1)
  let count = 1

  while (count > 0) {
    if (nextLine.text.includes('(')) {
      count++
    }

    if (nextLine.text.includes(')')) {
      count--
    }

    if (count) {
      nextLine = document.lineAt(nextLine.lineNumber + 1)
    }
  }

  return { start: line.range.start.line, end: nextLine.range.end.line }
}

// 获取文档中所有已插入语句的行范围（供删除/注释命令使用）
export function getAllStatementRanges(document: TextDocument, symbols: string) {
  const text = document.getText()

  if (!text.trim()) {
    return []
  }

  const matchRegexp = new RegExp(
    `^[ \t]*[${symbols}[ \t]*]*${getLanguageStatement(document)
      .replace(VARIABLE_PLACEHOLDER_REGEX, '.*?')
      .replace(/[()[\]{}]/g, '\\$&')}`,
    'gms',
  )

  const matchedResults = [...text.matchAll(matchRegexp)]

  if (!matchedResults.length) {
    return []
  }

  const singleLineRegexp = /\(.*\)/

  let line: TextLine
  const statements = matchedResults.reduce<Range[]>((acc, match) => {
    line = document.lineAt(document.positionAt(match.index!).line)

    // 没有 '(' 或是一个单行语句。例如：debugger
    if (singleLineRegexp.test(line.text) || !line.text.includes('(')) {
      acc.push(line.range)
    } else {
      const { start, end } = getMultiLineStatement(document, line)

      for (let i = start; i <= end; i++) {
        acc.push(document.lineAt(i).range)
      }
    }

    return acc
  }, [])

  return statements
}
