// Lexical ↔ Markdown bridge, using the built-in @payloadcms/richtext-lexical converters.
// The editorConfig is derived from the Payload config (it defines the available Lexical
// features) and is expensive to build, so it is cached per process.

import type { Payload } from 'payload'
import { convertLexicalToMarkdown, convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'

export type EditorConfig = Awaited<ReturnType<typeof editorConfigFactory.default>>

let cachedEditorConfig: EditorConfig | null = null

export async function getEditorConfig(payload: Payload): Promise<EditorConfig> {
  if (!cachedEditorConfig) {
    cachedEditorConfig = await editorConfigFactory.default({ config: payload.config })
  }
  return cachedEditorConfig
}

/** Lexical SerializedEditorState → Markdown string. Empty/absent bodies → ''. */
export function lexicalToMd(data: unknown, editorConfig: EditorConfig): string {
  if (!data || typeof data !== 'object') return ''
  return convertLexicalToMarkdown({ data: data as any, editorConfig })
}

/** Markdown string → Lexical SerializedEditorState. */
export function mdToLexical(markdown: string, editorConfig: EditorConfig) {
  return convertMarkdownToLexical({ markdown, editorConfig })
}

// ---- Fenced code blocks (fix: the stock markdown transformers convert ``` fences
// into plain paragraphs with the backticks leaking as literal text — verified against
// Payload 3.85; only text-format transformers get registered). mdBodyToLexical splits
// the body on fences, converts the prose segments with the stock converter (headings,
// lists and quotes work there), and stitches hand-built `code` nodes in between.

export interface MdSegment {
  kind: 'md' | 'code'
  text: string
  /** fence info string (```typescript) — '' when absent */
  lang?: string
}

// Fence opener must sit at a line start (^|\n, offset-adjusted in the loop) and the
// closer is ``` or true end-of-string. NB: a bare `$` would be wrong here — with the
// `g` flag it still matches every line end, letting the lazy body stop after line 1.
const FENCE_RE = /(^|\n)```([^\n`]*)\n([\s\S]*?)(?:\n?```|(?![\s\S]))/g

/** Split a markdown body into prose and fenced-code segments (order preserved).
 *  An unterminated fence swallows the rest of the body as code. */
export function splitMarkdownFences(md: string): MdSegment[] {
  const segments: MdSegment[] = []
  let last = 0
  FENCE_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = FENCE_RE.exec(md)) !== null) {
    const start = m.index + m[1].length // skip the captured line-start anchor
    if (start > last) segments.push({ kind: 'md', text: md.slice(last, start) })
    segments.push({ kind: 'code', text: m[3], lang: m[2].trim() })
    last = m.index + m[0].length
  }
  if (last < md.length) segments.push({ kind: 'md', text: md.slice(last) })
  return segments
}

function makeCodeNode(lang: string, code: string): Record<string, any> {
  return {
    type: 'code',
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    language: lang || 'plaintext',
    children: [
      {
        type: 'text',
        detail: 0,
        format: 0,
        mode: 'normal',
        style: '',
        textStyle: '',
        version: 1,
        text: code,
      },
    ],
  }
}

function rootNode(children: Record<string, any>[]): Record<string, any> {
  return { root: { type: 'root', direction: 'ltr', format: '', indent: 0, version: 1, children } }
}

/** Markdown body → Lexical SerializedEditorState with real `code` nodes for fenced
 *  blocks. Prose segments go through the stock converter; empty segments are dropped. */
export function mdBodyToLexical(markdown: string, editorConfig: EditorConfig): Record<string, any> {
  const segments = splitMarkdownFences(markdown)
  // No fences at all → stock conversion, byte-for-byte the legacy behavior.
  if (!segments.some((s) => s.kind === 'code')) {
    return mdToLexical(markdown, editorConfig) as Record<string, any>
  }
  const children: Record<string, any>[] = []
  for (const seg of segments) {
    if (seg.kind === 'code') {
      children.push(makeCodeNode(seg.lang ?? '', seg.text))
      continue
    }
    if (!seg.text.trim()) continue
    const converted = mdToLexical(seg.text, editorConfig) as any
    children.push(...(converted.root.children ?? []))
  }
  return rootNode(children)
}
