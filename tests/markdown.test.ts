import { describe, expect, it } from 'vitest'

import { renderMarkdown } from '../web/utils/markdown'

describe('markdown code rendering', () => {
  it('highlights recognized fenced languages and escapes code text', () => {
    const html = renderMarkdown('```go\npackage main\n\nfunc main() {}\n```')

    expect(html).toContain('<pre class="hljs language-go"><code>')
    expect(html).toContain('class="hljs-keyword"')
    expect(html).toContain('<span class="hljs-keyword">package</span>')
  })

  it('keeps unknown languages readable without injecting raw HTML', () => {
    const html = renderMarkdown('```unknown\n<script>alert(1)</script>\n```')

    expect(html).toContain('<pre class="hljs language-unknown"><code>')
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).not.toContain('<script>alert(1)</script>')
  })
})
