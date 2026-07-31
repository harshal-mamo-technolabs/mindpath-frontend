/* ===== book blocks =====
   Chapter bodies are stored as the plain-text block format the ebook generation
   prompts define (scripts/content/prompts/*.txt in the backend): plain paragraphs
   plus SECTION / QUOTE / BOX / TABLE / IMAGE markers. toBlocks() turns that text
   into blocks; ChapterBody renders them in the reader and chapterHtml() renders the
   same blocks for the print-to-PDF export, so the two never drift apart. */

const WRAPPED = { 'BOX:': 'END BOX', 'TABLE:': 'END TABLE', 'IMAGE:': 'END IMAGE' }

/* Image art lives in the frontend's own public folder, one directory per book. */
export const artUrl = (slug, file) => `/ebook-art/${slug}/${file}`

/* Reads "ALT: ..." out of an IMAGE block, following indented continuation lines. */
const field = (lines, name) => {
  const at = lines.findIndex((l) => l.trim().startsWith(`${name}:`))
  if (at === -1) return ''
  const parts = [
    lines[at]
      .trim()
      .slice(name.length + 1)
      .trim(),
  ]
  for (let i = at + 1; i < lines.length && !/^[A-Z]+:/.test(lines[i].trim()); i += 1) {
    if (lines[i].trim()) parts.push(lines[i].trim())
  }
  return parts.join(' ')
}

const wrappedBlock = (kind, head, inner) => {
  if (kind === 'BOX') return { type: 'box', label: head, blocks: toBlocks(inner.join('\n')) }

  if (kind === 'TABLE') {
    const rows = inner
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => l.split('|').map((c) => c.trim()))
    return { type: 'table', caption: head, head: rows[0] || [], rows: rows.slice(1) }
  }

  return { type: 'image', file: head, alt: field(inner, 'ALT'), caption: field(inner, 'CAPTION') }
}

export const toBlocks = (body) => {
  const lines = String(body || '').split('\n')
  const out = []
  let para = []
  let list = null

  const endPara = () => {
    if (para.length) out.push({ type: 'p', text: para.join(' ') })
    para = []
  }
  const endList = () => {
    if (list) out.push(list)
    list = null
  }
  const flush = () => {
    endPara()
    endList()
  }

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim()

    if (!line) {
      flush()
    } else if (line.startsWith('SECTION:')) {
      flush()
      out.push({ type: 'section', text: line.slice(8).trim() })
    } else if (line.startsWith('QUOTE:')) {
      flush()
      out.push({ type: 'quote', text: line.slice(6).trim() })
    } else if (WRAPPED[`${line.split(':')[0]}:`]) {
      flush()
      const kind = line.slice(0, line.indexOf(':'))
      const inner = []
      i += 1
      while (i < lines.length && lines[i].trim() !== `END ${kind}`) {
        inner.push(lines[i])
        i += 1
      }
      out.push(wrappedBlock(kind, line.slice(kind.length + 1).trim(), inner))
    } else if (/^-\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      const type = line.startsWith('-') ? 'ul' : 'ol'
      endPara()
      if (list && list.type !== type) endList()
      if (!list) list = { type, items: [] }
      list.items.push(line.replace(/^(-|\d+\.)\s+/, ''))
    } else {
      endList()
      para.push(line)
    }
  }

  flush()
  return out
}

/* ===== html rendering (the print-to-PDF export) ===== */

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const blockHtml = (block, slug) => {
  switch (block.type) {
    case 'section':
      return `<h3>${esc(block.text)}</h3>`
    case 'quote':
      return `<blockquote>${esc(block.text)}</blockquote>`
    case 'ul':
    case 'ol':
      return `<${block.type}>${block.items.map((i) => `<li>${esc(i)}</li>`).join('')}</${block.type}>`
    case 'box':
      return `<aside class="box"><span class="box-label">${esc(block.label)}</span>${block.blocks
        .map((b) => blockHtml(b, slug))
        .join('')}</aside>`
    case 'table':
      return `<figure class="tbl">${block.caption ? `<figcaption>${esc(block.caption)}</figcaption>` : ''}<table><thead><tr>${block.head
        .map((c) => `<th>${esc(c)}</th>`)
        .join('')}</tr></thead><tbody>${block.rows
        .map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`)
        .join('')}</tbody></table></figure>`
    case 'image':
      return `<figure class="fig"><img src="${esc(artUrl(slug, block.file))}" alt="${esc(block.alt)}" />${
        block.caption ? `<figcaption>${esc(block.caption)}</figcaption>` : ''
      }</figure>`
    default:
      return `<p>${esc(block.text)}</p>`
  }
}

export const chapterHtml = (body, slug) =>
  toBlocks(body)
    .map((b) => blockHtml(b, slug))
    .join('\n')
