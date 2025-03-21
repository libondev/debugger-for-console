const HASH_COMMENT_LANGUAGES = ['python', 'shellscript']

export function getCommentSymbol(languageId: string) {
  return HASH_COMMENT_LANGUAGES.includes(languageId!)
    ? '#'
    : '//'
}
