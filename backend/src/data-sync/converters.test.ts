// Fenced-code handling for markdown bodies (sprint-26 fix): the stock Payload
// markdown transformers leak ``` fences as literal paragraph text, so bodies are
// pre-split and code blocks become hand-built `code` nodes.

import { test } from 'node:test'
import assert from 'node:assert/strict'

import { splitMarkdownFences } from './converters'

// ---- splitMarkdownFences ----

test('splitMarkdownFences: plain prose → one md segment', () => {
  assert.deepEqual(splitMarkdownFences('## Hi\n\njust text\n'), [
    { kind: 'md', text: '## Hi\n\njust text\n' },
  ])
})

test('splitMarkdownFences: prose + fenced code + prose, language captured', () => {
  const md = 'before\n\n```typescript\nconst a = 1\nconst b = 2\n```\n\nafter'
  assert.deepEqual(splitMarkdownFences(md), [
    { kind: 'md', text: 'before\n\n' },
    { kind: 'code', text: 'const a = 1\nconst b = 2', lang: 'typescript' },
    { kind: 'md', text: '\n\nafter' },
  ])
})

test('splitMarkdownFences: bare fence (no language)', () => {
  const md = '```\nline one\n  indented two\n```'
  assert.deepEqual(splitMarkdownFences(md), [
    { kind: 'code', text: 'line one\n  indented two', lang: '' },
  ])
})

test('splitMarkdownFences: box-drawing diagrams keep every line and leading spaces', () => {
  const diagram = '```\nuser turn ──▶ history[] ──▶ ask()\n        ▲               │\n        └──── loop ─────┘\n```'
  const [seg] = splitMarkdownFences(diagram)
  assert.equal(seg.kind, 'code')
  assert.equal(seg.text.split('\n').length, 3, 'all lines preserved')
  assert.ok(seg.text.includes('        ▲'), 'leading alignment spaces preserved')
})

test('splitMarkdownFences: unterminated fence swallows the rest as code', () => {
  const md = 'intro\n\n```python\nprint(1)'
  const segs = splitMarkdownFences(md)
  assert.deepEqual(segs, [
    { kind: 'md', text: 'intro\n\n' },
    { kind: 'code', text: 'print(1)', lang: 'python' },
  ])
})

test('splitMarkdownFences: multiple fences in order', () => {
  const md = 'a\n\n```\none\n```\n\nmid\n\n```go\nfmt.Println(2)\n```\n\nb'
  assert.deepEqual(
    splitMarkdownFences(md).map((s) => s.kind),
    ['md', 'code', 'md', 'code', 'md'],
  )
})
