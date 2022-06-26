import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import axios from 'axios';

const searchContainer = document.querySelector('.search-container');
const searchQuery = document.querySelector('input[name="searchQuery"]');
const searchButton = document.querySelector('.searchButton');
const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const moreButton = document.querySelector('.moreButton');

const baseURL = 'https://pixabay.com/api/';
const key = '28283437-0d7800fe05e73ad7fc46b44e3';
let perPage = 40;
let page = 0;
let name = searchQuery.value;

moreButton.style.display = 'none';

async function fetchImg(name, page) {
  try {
    const response = await axios.get(
      `${baseURL}?key=${key}&q=${name}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`
    );
    return response.data;
  } catch (error) {
    console.log('ERROR: ' + error);
  }
}

async function eventHandler(e) {
  e.preventDefault();
  gallery.innerHTML = '';

  page = 1;
  name = searchQuery.value;

  fetchImg(name, page)
    .then(name => {
      let pages = name.totalHits / perPage;

      if (name.hits.length > 0) {
        Notiflix.Notify.success(`Hooray! We found ${name.totalHits} images.`);
        searchGallery(name);
        new SimpleLightbox('.gallery a');
        searchButton.addEventListener('click', () => {
          searchContainer.scrollIntoView({
            behavior: 'smooth',
          });
        });

        if (page < pages) {
          moreButton.style.display = 'block';
        } else {
          //loadBtn.style.display = 'none';
          Notiflix.Notify.info(
            "We're sorry, but you've reached the end of search results."
          );
        }
      } else {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        gallery.innerHTML = '';
      }
    })
    .catch(error => console.log('ERROR: ' + error));
}

searchForm.addEventListener('submit', eventHandler);

function searchGallery(name) {
  const markup = name.hits
    .map(hit => {
        return `
      <div class="gallery__container">
        <div class="gallery__card">
        <a class="gallery__item" href="${hit.largeImageURL}">
          <img
            class="gallery__image"
            src="${hit.webformatURL}"
            alt="${hit.tags}"
            loading="lazy"
        /></a>
        <div class="info">
          <div class="info__box">
            <p class="info__title">likes</p>
            <p class="info__numbers">${hit.likes}</p>
          </div>
          <div class="info__box">
            <p class="info__title">views</p>
            <p class="info__numbers">${hit.views}</p>
          </div>
          <div class="info__box">
            <p class="info__title">comments</p>
            <p class="info__numbers">${hit.comments}</p>
          </div>
          <div class="info__box">
            <p class="info__title">downloads</p>
            <p class="info__numbers">${hit.downloads}</p>
          </div>
        </div>
      </div></div>`;
    })
    .join('');
  gallery.insertAdjacentHTML('beforeend', markup);
}

moreButton.addEventListener(
  'click',
  () => {
    name = searchQuery.value;
    page += 1;
    fetchImg(name, page).then(name => {
      let pages = name.totalHits / perPage;
      searchGallery(name);
      new SimpleLightbox('.gallery a');
      if (page >= pages) {
        moreButton.style.display = 'none';
        Notiflix.Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
      }
    });
  },
  true
)