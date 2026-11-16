/* eslint-disable */
/* global WebImporter */

/**
 * search parser.
 * Source: the AEM quick-search component (.cmp-search) that the cleanup transformer moves into
 * the page for the search-results template (on the source it sits in the footer; the /search
 * page itself only shows results).
 * Output (Search convention): one row, one cell with the absolute URL of the site's query index,
 * which the EDS search block reads. The block takes the search term from ?q= (the header search
 * form submits q to /search).
 */
const QUERY_INDEX = 'https://main--granddesignrv--ynaka-adobe.aem.live/query-index.json';

export default function parse(element, { document }) {
  const link = document.createElement('a');
  link.href = QUERY_INDEX;
  link.textContent = QUERY_INDEX;
  const block = WebImporter.Blocks.createBlock(document, { name: 'search', cells: [[link]] });
  element.replaceWith(block);
}
