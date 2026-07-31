import { artUrl, toBlocks } from '../lib/bookBlocks.js'

/* Renders one ebook chapter from the plain-text block format — see lib/bookBlocks.js. */

/* A missing PNG must not leave a broken-image icon in the middle of a chapter — but it
   must say so in the console, or a misnamed file looks exactly like a chapter with no art. */
const hideFigure = (e) => {
  console.warn(`[ebook] chapter art not found: ${e.currentTarget.getAttribute('src')}`)
  const figure = e.currentTarget.closest('figure')
  if (figure) figure.style.display = 'none'
}

const renderBlock = (block, slug, key) => {
  switch (block.type) {
    case 'section':
      return (
        <h3 key={key} className="eb-h3">
          {block.text}
        </h3>
      )

    case 'quote':
      return (
        <blockquote key={key} className="eb-pull">
          {block.text}
        </blockquote>
      )

    case 'ul':
      return (
        <ul key={key} className="eb-list">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )

    case 'ol':
      return (
        <ol key={key} className="eb-list">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      )

    case 'box':
      return (
        <aside key={key} className="eb-box">
          <span className="eb-box-label">{block.label}</span>
          {block.blocks.map((b, i) => renderBlock(b, slug, i))}
        </aside>
      )

    case 'table':
      return (
        <figure key={key} className="eb-table">
          {block.caption && <figcaption>{block.caption}</figcaption>}
          <div className="eb-table-scroll">
            <table>
              <thead>
                <tr>
                  {block.head.map((c, i) => (
                    <th key={i}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((c, j) => (
                      <td key={j}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </figure>
      )

    case 'image':
      return (
        <figure key={key} className="eb-fig">
          <img src={artUrl(slug, block.file)} alt={block.alt} loading="lazy" onError={hideFigure} />
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      )

    default:
      return <p key={key}>{block.text}</p>
  }
}

const ChapterBody = ({ body, slug }) =>
  toBlocks(body).map((block, i) => renderBlock(block, slug, i))

export default ChapterBody
