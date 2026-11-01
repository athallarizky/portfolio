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
 *  blocks and real `table` nodes for pipe tables. Prose goes through the stock
 *  converter; empty segments are dropped. */
export function mdBodyToLexical(markdown: string, editorConfig: EditorConfig): Record<string, any> {
  const children: Record<string, any>[] = []
  const inlineChildren = (md: string): Record<string, any>[] => {
    const converted = mdToLexical(md, editorConfig) as any
    return converted.root.children ?? []
  }
  for (const seg of splitMarkdownFences(markdown)) {
    if (seg.kind === 'code') {
      children.push(makeCodeNode(seg.lang ?? '', seg.text))
      continue
    }
    for (const t of splitMarkdownTables(seg.text)) {
      if (t.kind === 'table') {
        children.push(makeTableNode(t.rows ?? [], inlineChildren))
        continue
      }
      if (!t.text.trim()) continue
      children.push(...inlineChildren(t.text))
    }
  }
  return rootNode(children)
}

// ---- Markdown tables (sprint-30 follow-up): same story as the fences above — the
// stock transformers have no table support, so pipe rows collapsed into paragraph
// soup with literal `|` text. Bodies are pre-split on table blocks and each becomes
// a hand-built table/table-row/table-cell node; cell content goes through the stock
// inline converter so **bold**, links etc. keep working inside cells.

export interface TableSegment {
  kind: 'md' | 'table'
  text: string
  /** parsed rows (header first) — table segments only */
  rows?: string[][]
}

/** `|---|---|` / `:---:` — pipes/colons/dashes/spaces with at least one dash run. */
const isSeparatorRow = (line: string) => /^[\s|:-]+$/.test(line) && line.includes('-')

/** `| a | b |` → ['a','b'] (outer pipes optional, cells trimmed). Escaped pipes
 * (`\|`) inside cells are not handled — write around them. */
export function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim())
}

/** Split a prose segment into md/table segments (order preserved). A table starts
 * at a pipe-line whose next line is a separator row, and ends at the first
 * non-pipe line. */
export function splitMarkdownTables(md: string): TableSegment[] {
  const lines = md.split('\n')
  const segments: TableSegment[] = []
  let buf: string[] = []
  const flush = () => {
    if (buf.length) segments.push({ kind: 'md', text: buf.join('\n') })
    buf = []
  }
  const isRow = (l: string) => l.includes('|') && l.trim() !== ''
  let i = 0
  while (i < lines.length) {
    if (isRow(lines[i]) && isSeparatorRow(lines[i + 1] ?? '')) {
      flush()
      const rows = [parseTableRow(lines[i])]
      i += 2
      while (i < lines.length && isRow(lines[i])) {
        rows.push(parseTableRow(lines[i]))
        i++
      }
      segments.push({ kind: 'table', text: '', rows })
    } else {
      buf.push(lines[i])
      i++
    }
  }
  flush()
  return segments
}

function makeTableNode(
  rows: string[][],
  inlineChildren: (md: string) => Record<string, any>[],
): Record<string, any> {
  return {
    type: 'table',
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    children: rows.map((cells, r) => ({
      type: 'table-row',
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
      children: cells.map((cell) => ({
        type: 'table-cell',
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        colSpan: 1,
        rowSpan: 1,
        // headerState 3 = row+column header (Lexical TableCellHeaderState.BOTH)
        headerState: r === 0 ? 3 : 0,
        children: inlineChildren(cell).length ? inlineChildren(cell) : [paragraphNode(cell)],
      })),
    })),
  }
}

function paragraphNode(text: string): Record<string, any> {
  return {
    type: 'paragraph',
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    children: [
      { type: 'text', detail: 0, format: 0, mode: 'normal', style: '', textStyle: '', version: 1, text },
    ],
  }
}
