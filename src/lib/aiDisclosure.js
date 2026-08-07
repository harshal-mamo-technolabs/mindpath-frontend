/**
 * Machine-readable AI labels for the content we generate (ebooks, voice audio).
 *
 * `trainedAlgorithmicMedia` is the IPTC digital-source-type term for "made by a
 * generative model" — the same vocabulary C2PA and schema.org consumers already read,
 * so one constant covers every surface.
 *
 * Scope: this labels what the browser renders and exports. Marking the *files*
 * themselves (ID3/XMP on the mp3s, XMP in a PDF) has to happen where they're
 * generated — backend.
 */
export const AI_SOURCE_TYPE =
  'http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia'

/** Spread onto a generated media element so the DOM itself carries the label. */
export const AI_MEDIA_ATTRS = {
  'data-ai-generated': 'true',
  'data-digital-source-type': AI_SOURCE_TYPE,
}

/** JSON-LD for a generated work — for documents that leave the app (the ebook export).
    `additionalProperty` is how a non-schema.org vocabulary (IPTC) rides along legally. */
export const aiJsonLd = (work) =>
  JSON.stringify({
    '@context': 'https://schema.org',
    ...work,
    additionalProperty: {
      '@type': 'PropertyValue',
      propertyID: 'http://cv.iptc.org/newscodes/digitalsourcetype/',
      value: AI_SOURCE_TYPE,
    },
    // escaped so a title containing "</script>" can't break out of the embedding tag
  }).replace(/</g, '\\u003c')
