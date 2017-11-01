import bemmit from 'bemmit';

const getClass = bemmit('docs-lightbox');
const contentArea = document.querySelector('.content');
const docsLightbox = document.querySelector('.docs-lightbox');

export default () => {
  contentArea.addEventListener('click', event => {
    if (event.target.classList.contains('figure__image--lightbox')) {
      const imgSrc = event.target.src;
      docsLightbox.querySelector(`.${getClass('image')}`).src = imgSrc;

      // The timeout prevents a flicker of the images changing while fading in
      setTimeout(() => {
        docsLightbox.classList.remove(`${getClass()}--disabled`);
      }, 50);
    }
  });

  docsLightbox
    .querySelector(`.${getClass()}__close-btn`)
    .addEventListener('click', event => {
      event.preventDefault();
      docsLightbox.classList.add(`${getClass()}--disabled`);
    });
};
