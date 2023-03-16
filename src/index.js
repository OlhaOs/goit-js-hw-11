import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

Notify.init({ position: 'center-top', distance: '50px' });

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '34373516-b73f95caf1f569d1c97db55cd';
const PER_PAGE = 40;

const refs = {
  buttonEl: document.querySelector('.js-button'),
  formEl: document.querySelector('.search-form'),
  inputEl: document.querySelector('input'),
  galleryEl: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

refs.loadMoreBtn.hidden = true;

let searchQuery = '';
let page;

refs.formEl.addEventListener('submit', onSearchBtnClick);
refs.loadMoreBtn.addEventListener('click', onLoadMoreClick);
refs.galleryEl.addEventListener('click', onGalleryImemClick);

function onSearchBtnClick(e) {
  e.preventDefault();
  page = 1;
  refs.loadMoreBtn.hidden = true;
  clearGallery();
  searchQuery = e.target.elements.searchQuery.value;

  fetchApi(searchQuery)
    .then(data => {
      if (data.hits.length !== 0) {
        refs.loadMoreBtn.style = 'display:flex';
        insertMarkUp(data.hits);
        Notify.info(`Hooray! We found ${data.totalHits} images.`);

        // const { height: cardHeight } = document
        //   .querySelector('.gallery')
        //   .firstElementChild.getBoundingClientRect();

        // window.scrollBy({
        //   top: cardHeight * PER_PAGE,
        //   behavior: 'smooth',
        // });
      } else {
        refs.loadMoreBtn.style = 'display:none';
        Notify.info(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }
    })
    .catch(x => console.log('Error', x));
}

function onLoadMoreClick() {
  page += 1;
  openGallery().refresh;
  return fetchApi(searchQuery).then(data => {
    checkTotal(data.totalHits);
    insertMarkUp(data.hits);
  });
}

function checkTotal(total) {
  if (total < page * PER_PAGE) {
    Notify.info("We're sorry, but you've reached the end of search results.");
    refs.loadMoreBtn.style = 'display:none';
    return;
  }
}

function fetchApi(query) {
  return fetch(
    `${BASE_URL}?key=${API_KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${PER_PAGE}`
  ).then(response => response.json());
}

function insertMarkUp(array) {
  const result = generateMarkUp(array);
  refs.galleryEl.insertAdjacentHTML('beforeend', result);
}
function generateMarkUp(array) {
  return array.reduce((acc, item) => acc + markUp(item), '');
}

function markUp({
  largeImageURL,
  webformatURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) {
  return `<div class="photo-card">
  <a href=${largeImageURL}>
      <img src="${webformatURL}" class="gallery-image"  alt="${tags}" loading="lazy" /> </a>
      <div class="info">
        <p class="info-item">
          <b>Likes </b>${likes}
        </p>
        <p class="info-item">
          <b>Views</b>${views}
        </p>
        <p class="info-item">
          <b>Comments</b>${comments}
        </p>
        <p class="info-item">
          <b>Downloads</b>${downloads}
        </p>
      </div>
    </div>`;
}
function clearGallery() {
  refs.galleryEl.innerHTML = '';
}
function openGallery() {
  return new SimpleLightbox('.gallery .photo-card a', {
    captionDelay: 250,
    fadeSpeed: 700,
  });
}
function onGalleryImemClick(e) {
  e.preventDefault();
  const isImageClick = e.target.classList.contains('gallery-image');

  if (!isImageClick) {
    return;
  }
  openGallery().open(e.target);
}
