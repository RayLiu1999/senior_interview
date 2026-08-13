import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js/lib/common'

function normalizeLanguage(language: string) {
  return language.trim().toLowerCase().split(/\s+/)[0]?.replace(/[^a-z0-9_+.-]/g, '') ?? ''
}

function escapeHtml(source: string) {
  return source
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const markdown = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight(source: string, language: string): string {
    const languageName = normalizeLanguage(language)
    const languageClass = languageName ? ` language-${languageName}` : ''

    if (languageName && hljs.getLanguage(languageName)) {
      try {
        const highlighted = hljs.highlight(source, {
          language: languageName,
          ignoreIllegals: true,
        }).value
        return `<pre class="hljs${languageClass}"><code>${highlighted}</code></pre>`
      } catch {
        // Fall through to escaped plain text when a language definition rejects the input.
      }
    }

    return `<pre class="hljs${languageClass}"><code>${escapeHtml(source)}</code></pre>`
  },
})

export function renderMarkdown(source: string): string {
  return markdown.render(source || '')
}
