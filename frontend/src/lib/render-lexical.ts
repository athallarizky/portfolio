import type { LexicalRoot, LexicalNode, LexicalText } from './api-types';
import { API_ORIGIN } from './api';

const FORMAT_BOLD = 1;
const FORMAT_ITALIC = 2;
const FORMAT_STRIKETHROUGH = 4;
const FORMAT_UNDERLINE = 8;
const FORMAT_CODE = 16;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderText(node: LexicalText): string {
  let html = escapeHtml(node.text);
  if (node.format & FORMAT_BOLD) html = `<strong>${html}</strong>`;
  if (node.format & FORMAT_ITALIC) html = `<em>${html}</em>`;
  if (node.format & FORMAT_UNDERLINE) html = `<u>${html}</u>`;
  if (node.format & FORMAT_STRIKETHROUGH) html = `<del>${html}</del>`;
  if (node.format & FORMAT_CODE) html = `<code>${html}</code>`;
  return html;
}

function renderNode(node: LexicalNode): string {
  switch (node.type) {
    case 'paragraph':
      return `<p>${node.children.map(renderText).join('')}</p>`;
    case 'heading': {
      const tag = node.tag;
      return `<${tag}>${node.children.map(renderText).join('')}</${tag}>`;
    }
    case 'code':
      return `<pre><code${node.language ? ` class="language-${node.language}"` : ''}>${escapeHtml(node.children.map(t => t.text).join(''))}</code></pre>`;
    case 'quote':
      return `<blockquote>${node.children.map(renderNode).join('')}</blockquote>`;
    case 'list': {
      const tag = node.listType === 'number' ? 'ol' : 'ul';
      return `<${tag}>${node.children.map(renderNode).join('')}</${tag}>`;
    }
    case 'listitem':
      return `<li>${node.children.map(renderNode).join('')}</li>`;
    case 'upload': {
      const uploadNode = node as { type: 'upload'; value: { id: number }; fields: null; relationTo: string; version: number };
      if (!uploadNode.value?.id) return '';
      const mediaData = uploadNode.value as Record<string, any> | null;
      const filename = mediaData?.filename as string | undefined;
      const alt = (mediaData as any)?.alt ?? '';
      if (!filename) return '';
      // Payload's url is relative (/api/media/file/...) — prepend origin so browsers on different ports can load it.
      const url = (mediaData as any)?.url ? `${API_ORIGIN}${(mediaData as any).url}` : null;
      if (!url) return '';
      return `<img src="${url}" alt="${escapeHtml(alt)}" loading="lazy" />`;
    }
    default:
      return '';
  }
}

export function renderLexical(root: LexicalRoot): string {
  return root.root.children.map(renderNode).join('\n');
}
