const HASH_COMMENT_LANGUAGES = ['python', 'shellscript']

export function getComment(languageId: string) {
  return HASH_COMMENT_LANGUAGES.includes(languageId!)
    ? '#'
    : '//'
}
