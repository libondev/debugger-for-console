// 转义正则表达式
export function escapeRegexp(string: string) {
  return string.replace(/[+^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s*')
}

// 以给定符号集合生成匹配行尾的正则
export function generateBlockRegexp(symbols: string[]) {
  const symbol = symbols.map((s) => escapeRegexp(s)).join('|')

  return new RegExp(`(?:${symbol})\\s*$`)
}
