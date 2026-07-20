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
