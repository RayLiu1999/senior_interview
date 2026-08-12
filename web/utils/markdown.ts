import MarkdownIt from 'markdown-it'

const markdown = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

export function renderMarkdown(source: string): string {
  return markdown.render(source || '')
}
