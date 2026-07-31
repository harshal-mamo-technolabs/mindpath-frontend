/* Run with: node --test src/lib/bookBlocks.test.js
   The block format is written by an LLM and parsed at read time, so a drift in the
   parser silently turns a chapter into a wall of "BOX:" text. */

import assert from 'node:assert/strict'
import test from 'node:test'

import { chapterHtml, toBlocks } from './bookBlocks.js'

const CHAPTER = `An opening paragraph
that wraps across two source lines.

SECTION: A Section Heading

QUOTE: A single line worth pulling out.

- first bullet
- second bullet

1. first step
2. second step

BOX: Try this
Inside the box.
- a bullet inside the box
END BOX

TABLE: A caption
Header | Other header
Cell | Other cell

IMAGE: chapter-01-thing.png
ALT: A description of the picture
  that wraps onto a second line.
CAPTION: The caption under it.
PROMPT: Never shown to the reader.
END IMAGE`

test('parses every block type', () => {
  const blocks = toBlocks(CHAPTER.replace('Cell | Other cell', 'Cell | Other cell\nEND TABLE'))
  assert.deepEqual(
    blocks.map((b) => b.type),
    ['p', 'section', 'quote', 'ul', 'ol', 'box', 'table', 'image'],
  )

  const [para, , quote, ul, ol, box, table, image] = blocks
  assert.equal(para.text, 'An opening paragraph that wraps across two source lines.')
  assert.equal(quote.text, 'A single line worth pulling out.')
  assert.deepEqual(ul.items, ['first bullet', 'second bullet'])
  assert.deepEqual(ol.items, ['first step', 'second step'])

  assert.equal(box.label, 'Try this')
  assert.deepEqual(
    box.blocks.map((b) => b.type),
    ['p', 'ul'],
  )

  assert.deepEqual(table.head, ['Header', 'Other header'])
  assert.deepEqual(table.rows, [['Cell', 'Other cell']])

  assert.equal(image.file, 'chapter-01-thing.png')
  assert.equal(image.alt, 'A description of the picture that wraps onto a second line.')
  assert.equal(image.caption, 'The caption under it.')
})

test('never leaks a marker or an image prompt into the rendered output', () => {
  const html = chapterHtml(
    CHAPTER.replace('Cell | Other cell', 'Cell | Other cell\nEND TABLE'),
    'a-book',
  )
  for (const marker of ['SECTION:', 'QUOTE:', 'BOX:', 'TABLE:', 'END BOX', 'PROMPT:']) {
    assert.equal(html.includes(marker), false, `leaked ${marker}`)
  }
  assert.match(html, /src="\/ebook-art\/a-book\/chapter-01-thing\.png"/)
})

test('escapes html in the source text', () => {
  assert.equal(chapterHtml('5 < 6 & <script>', 'x'), '<p>5 &lt; 6 &amp; &lt;script&gt;</p>')
})
