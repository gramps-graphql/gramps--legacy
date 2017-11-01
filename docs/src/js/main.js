import linkHeadings from './lib/link-headings';
import docsLightbox from './lib/docs-lightbox';

linkHeadings({
  limitToScope: '.content__body-text',
  limitToDirectDescendants: true,
});

docsLightbox();
