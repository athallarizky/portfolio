// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface WithIndex extends Record<string, unknown> {}

export interface LexicalText extends WithIndex {
  type: 'text'
  text: string
  format: number
  detail: number
  mode: string
  style: string
  textStyle: string
}

export interface LexicalParagraph extends WithIndex {
  type: 'paragraph'
  children: LexicalText[]
  direction: 'ltr' | 'rtl'
  format: string
  indent: number
  version: number
}

export interface LexicalHeading extends WithIndex {
  type: 'heading'
  tag: 'h2' | 'h3'
  children: LexicalText[]
  direction: 'ltr' | 'rtl'
  format: string
  indent: number
  version: number
}

export interface LexicalCode extends WithIndex {
  type: 'code'
  children: LexicalText[]
  direction: 'ltr' | 'rtl'
  format: string
  indent: number
  version: number
  language: string
}

export type LexicalNode = LexicalParagraph | LexicalHeading | LexicalCode

export interface LexicalRoot {
  root: {
    type: 'root'
    children: LexicalNode[]
    direction: string
    format: string
    indent: number
    version: number
  }
}

export function lexicalText(text: string): LexicalText {
  return { type: 'text', text, format: 0, detail: 0, mode: 'normal', style: '', textStyle: '' }
}

export function lexicalParagraph(text: string): LexicalParagraph {
  return { type: 'paragraph', children: [lexicalText(text)], direction: 'ltr', format: '', indent: 0, version: 1 }
}

export function lexicalHeading(text: string, tag: 'h2' | 'h3'): LexicalHeading {
  return { type: 'heading', tag, children: [lexicalText(text)], direction: 'ltr', format: '', indent: 0, version: 1 }
}

export function lexicalCode(code: string): LexicalCode {
  return { type: 'code', children: [lexicalText(code)], direction: 'ltr', format: '', indent: 0, version: 1, language: 'plaintext' }
}

export function lexicalBody(children: LexicalNode[]): LexicalRoot {
  return { root: { type: 'root', children, direction: 'ltr', format: '', indent: 0, version: 1 } }
}
