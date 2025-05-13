import type { TextDocument } from 'vscode'
import { tabSizeConfig } from '../commands/create'
import {
  generateBlockRegexp,
  getIndentCount,
  getIndentString,
  getIndentType,
} from './index'

// 向下创建的时候以这些符号作为结尾时，表示处于作用域内部
const insideBlockRegexpNext = generateBlockRegexp([
  '= {',
  '= [',
  '({',
  '([',
  '(',
  ',',
])

// 向上创建时只要以 , 结尾就表示处于作用域内部，不考虑对象函数的形式
const insideBlockRegexpPrev = generateBlockRegexp([
  ',',
])

const blockStartSymbolRegexp = generateBlockRegexp([
  '{',
  '[',
  '[',
  '(',
])

const blockEndSymbolRegexp = generateBlockRegexp([
  '});?',
  ']);?',
  '};?',
  '];?',
  ');?',
  ' as .*;?',
  ' satisfies .*;?',
])

const insertIndentRegexp = generateBlockRegexp([
  '{',
  '(',
  '[',
  ':',
])

// 获取作用域结束或开始的边界行和最终创建时的缩进
export function getBlockBoundaryLineWithIndent(document: TextDocument, line: number, offset: number) {
  const {
    text,
    isEmptyOrWhitespace,
    firstNonWhitespaceCharacterIndex,
  } = document.lineAt(line)

  const documentMaxRows = document.lineCount
  const indentsType = getIndentType(firstNonWhitespaceCharacterIndex, text)
  let indentsCount = getIndentCount(
    documentMaxRows,
    line + offset,
    firstNonWhitespaceCharacterIndex,
  )

  // 如果当前行是空行则直接返回当前行
  if (isEmptyOrWhitespace) {
    return {
      line: line + offset,
      indents: '',
    }
  }

  const insideBlockRegexp = offset ? insideBlockRegexpNext : insideBlockRegexpPrev

  // 如果不是以作用域符号结尾则表示处于作用域外部，不需要进一步查找
  const isInsideBlock = insideBlockRegexp.test(text)

  // 如果当前行的最后一个字符是 { ( : 并且是向下创建，则需要增加一次缩进
  if (offset && insertIndentRegexp.test(text)) {
    indentsCount += tabSizeConfig.value
  }

  const indentsString = getIndentString(indentsCount, indentsType)

  if (!isInsideBlock) {
    return {
      line: line + offset,
      indents: indentsString,
    }
  }

  // 如果 offset === 0 则表示向上创建，否则是向下创建
  const offsetLineSize = offset ? 1 : -1
  let targetLine = line + offsetLineSize
  const boundaryRegexp = offset ? blockEndSymbolRegexp : blockStartSymbolRegexp

  // 逐行向上或向下查找开始/结束符号
  while (true) {
    // TODO: 支持查找嵌套作用域
    const {
      text,
      isEmptyOrWhitespace,
      firstNonWhitespaceCharacterIndex: targetLineIndent,
    } = document.lineAt(targetLine)

    // 如果目标行超出范围，或者目标行不是空行且以开始/结束符号结尾，则表示找到目标行
    if (
      targetLine < 0 ||
      targetLine > documentMaxRows ||
      (!isEmptyOrWhitespace && boundaryRegexp.test(text))
    ) {
      // 找到目标行以后，将目标行的缩进字符串作为最终的缩进字符串
      indentsCount = targetLineIndent
      break
    }

    targetLine += offsetLineSize
  }

  return {
    line: offset ? targetLine + offsetLineSize : targetLine,
    indents: getIndentString(indentsCount, indentsType),
  }
}
