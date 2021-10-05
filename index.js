const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12
let page = 1

const movies = []
let filterMovies = []
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const modeControl = document.querySelector('#mode-control')
let favoriteHTML =''


/////function group/////
//render movie in list mode
function renderMovieList(data) {
  //set a className for future use
  dataPanel.className = 'justify-content-between list-mode'
  let rawHTML =''
  rawHTML += '<ul class="list-group list-group-flush">'
  data.forEach(item => {
    rawHTML +=`
    <li class="list-group-item align-items-center">${item.title}
      <span class="list-btn">
        <button class="btn btn-primary btn-show-movie" data-id="${item.id}" data-toggle="modal"
          data-target="#movie-modal">More</button>
        <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
      </span>
    </li>
    `
  })
  rawHTML += '</ul>'
  dataPanel.innerHTML = rawHTML
}

//render movie in card mode
function renderMovieCard(data) {
  //set a className for future use
  dataPanel.className = 'row card-mode'
  let rawHTML = ""
  data.forEach(item => {
    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie " data-toggle="modal" data-id="${item.id}" data-target="#movie-modal">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

//get the data by page
function getMoviesByPage(page) {
  const data = filterMovies.length ? filterMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

//render paginator by total amount
function renderPaginator(amount) {
  const numberOfPage = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ""
  for (let page = 1; page <= numberOfPage; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

//show movie info in modal
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data.results
      modalTitle.innerText = data.title
      modalImage.innerHTML = `
    <img src="${POSTER_URL + data.image}" alt="Movie Poster" class="image-fluid">
    `
      modalDate.innerText = 'Release data: ' + data.release_date
      modalDescription.innerText = data.description
    })
}

//add movie to favorite
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert ('This movie has been added to your favorite list!')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

//change the way of rendering movie
function renderMovieInMode(page) {
  if (dataPanel.matches('.card-mode')) {
    renderMovieCard(getMoviesByPage(page))
  } else if (dataPanel.matches('.list-mode')) {
    renderMovieList(getMoviesByPage(page))
  }
}

////addEventListener group////
//to see more info in modal or add movie to favorite
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

//get the searching keyword and render searching outcome by page by mode
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  page = 1

  if(!keyword.length) {
    alert('Please enter a valid string.')
    filterMovies = []
    renderPaginator(movies.length)
    renderMovieInMode(1)
    return
  }

  filterMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))

  if (filterMovies.length === 0) {
    alert('Can not find movie with keyword: ' + keyword)
    renderPaginator(movies.length)
    renderMovieInMode(1)
    return
  }

  renderPaginator(filterMovies.length)
  renderMovieInMode(1)

})

//render the specific page by mode
paginator.addEventListener('click', function onPageClicked(event) {
  if (event.target.tagName !== 'A') return
  page = Number(event.target.dataset.page)
  renderMovieInMode(page)
  
})

//change different mode when clicked
modeControl.addEventListener('click', function onModeClicked(event) {
  if(event.target.matches('.card-mode')) {
    renderMovieCard(getMoviesByPage(page))
  } else if (event.target.matches('.list-mode')) {
    renderMovieList(getMoviesByPage(page))
  }
})

//default status
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieCard(getMoviesByPage(1))

  })
  .catch((err) => console.log(err))
