import ben, { searchfunc } from "./searchmodule.js"
const genreList = document.querySelectorAll(".sort-option input[type='checkbox']");
const sortList = document.querySelectorAll("genre-checkbox input[type='radio']");
const searchbtn = document.getElementById("search-btn");
const loadbtn = document.getElementById("load-more-btn");

let allMovies = [];
let sortBy = "relevance";
let genres = [];
let currentPage = 1;
const resultsPerPage = 12;
let query = "";

// Load movies when page loads
function onLoad() {
    loadMovies().then(() => {
        // Remove the event listener after loadMovies finishes
        document.removeEventListener('DOMContentLoaded', onLoad);
    });
}
document.addEventListener('DOMContentLoaded', onLoad);

function showMovieInfo(movieId) {
    window.open(`https://www.imdb.com/title/${movieId}`, '_blank');
}
function playMovie(movieId) {
    window.location.href = `Movie_Play.html?id=${movieId}`;
}

// Load movies from JSON file
async function loadMovies() {
        const response = await fetch('https://raw.githubusercontent.com/Bentelador/movie-bai/refs/heads/main/MDB.json');
        allMovies = await response.json();
        console.log(`Loaded ${allMovies.length} movies`);
    
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    const searchGenre = urlParams.getAll('genre');
    const searchSort = urlParams.get('sort');
    if (searchSort) {
       sortBy = searchSort
    }
    if (searchGenre) {
        searchGenre.forEach(element => {
            console.log(element)
            genres.push(element)
        })
        document.getElementById('searchInput').value = searchQuery;
        query = searchQuery
        const currentResults = await searchfunc(searchQuery.toLowerCase(),genres,sortBy,allMovies);
        currentPage = 1;
        displayResults(currentResults);
        updateResultsInfo(query, currentResults);
        updateActiveFiltersDisplay()
    } else{
        document.getElementById('searchInput').value = searchQuery;
        query = searchQuery
        const OutsideSearch = await ben(searchQuery.toLowerCase(), sortBy, allMovies,);
        displayResults(OutsideSearch);
        updateResultsInfo(searchQuery,OutsideSearch);
        updateActiveFiltersDisplay()
    }
}

function updateActiveFiltersDisplay() {
    const urlParams = new URLSearchParams(window.location.search);
    const selectedGenres = [];
    let sort = "";
    const checkedsort = urlParams.get('sort');

            document.querySelectorAll('.sort-option input[type="radio"]').forEach(cb => {
                 if (cb.checked) {
                    sort = cb
                }
            });

    document.querySelectorAll('.genre-checkbox input[type="checkbox"]').forEach(checkbox => {
        if (checkbox.checked){
        selectedGenres.push(checkbox.value);
        }});
    const activeFilters = document.getElementById('activeFilters');
    if (!activeFilters) return;
    
    if (selectedGenres.length === 0 && !query && !sort) {
        activeFilters.innerHTML = '';
        return;
    }
    
    let html = '<div class="active-filters-title">Active Filters:</div>';
    
    if (query) {
        html += `<span class="active-filter">Search: "${query}" 
                 <button class="remove-filter" data-type="search">×</button></span>`;
    }

    if (sort){
        html += `<span class="active-filter">Sort: ${sort.parentElement.querySelector('span').textContent} 
                 <button class="remove-filter" data-type="sort" data-value="${sort.value}">×</button></span>`;
    }
    
    selectedGenres.forEach(genre => {
        html += `<span class="active-filter">${genre} 
                 <button class="remove-filter" data-type="genre" data-value="${genre}">×</button></span>`;
    });
    
    activeFilters.innerHTML = html;
    
    // Add event listeners to remove buttons
    activeFilters.querySelectorAll('.remove-filter').forEach(button => {
        button.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            const value = this.getAttribute('data-value');
            
            if (type === 'search') {
                currentSearchTerm = '';
                document.getElementById('searchInput').value = '';
         
            }else if (type === 'genre') {
                selectedGenres = selectedGenres.filter(g => g !== value);
                const checkbox = document.querySelector(`.genre-checkbox input[value="${value}"]`);
                if (checkbox) checkbox.checked = false;
            } else if (type === 'sort') {
                // Clear selected sort
                const checkedRadio = document.querySelector('.sort-option input[type="radio"]:checked');
                if (checkedRadio) checkedRadio.checked = false;
                const relevance = document.querySelector('.sort-option input[value="relevance"]');
                if (relevance) relevance.checked = true;
}
            
            updateActiveFiltersDisplay();
        });
    });
}


// Perform search
async function performSearch() {
    query = document.getElementById('searchInput').value;
    const currentResults = await searchfunc(query.toLowerCase(),genres,sortBy,allMovies);
    currentPage = 1;
    displayResults(currentResults);
    updateResultsInfo(query, currentResults);
    updateActiveFiltersDisplay();
}

async function performSort() {
    const currentResults = await searchfunc(query.toLowerCase(),genres,sortBy,allMovies);
    displayResults(currentResults);
    updateResultsInfo(query, currentResults);
    updateActiveFiltersDisplay();
}

// Display results
function displayResults(currentResults) {
    const resultsGrid = document.getElementById('resultsGrid');
    const loadMoreBtn = document.getElementById('loadMore');
    if (currentResults.length === 0) {
        resultsGrid.innerHTML = `
            <div class="no-results">
                <h3>No movies found</h3>
                <p>Try a different search term</p>
            </div>
        `;
        loadMoreBtn.style.display = 'none';
        return;
    }
    
    const startIndex = 0;
    const endIndex = currentPage * resultsPerPage;
    const resultsToShow = currentResults.slice(startIndex, endIndex);
    const reslength = currentResults.length;
    currentResults = null;
    
    // Clear previous results
    resultsGrid.innerHTML = '';
    
    // Display results
    resultsToShow.forEach(movie => {
        const movieCard = createMovieCard(movie);
        resultsGrid.appendChild(movieCard);
    });
    
    // Show/hide load more button
    if (endIndex < reslength) {
        loadMoreBtn.style.display = 'block';
    } else {
        loadMoreBtn.style.display = 'none';
    }
}

// Create movie card element
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.dataset.id = movie.id;
    
    // Format genres from array to string
    let isInWatchlist = false;
    try {
        const userWatchlist = JSON.parse(localStorage.getItem('userWatchlist') || '[]');
        isInWatchlist = userWatchlist.some(item => item.id === movie.id);
    } catch (e) {
        console.error('Error checking watchlist:', e);
    }
    
    card.innerHTML = `
    <div class="movie-card" data-movie-id="${movie.id}">
        <div class="movie-poster" onclick="playMovie('${movie.id}')">
            <img src="${movie.image}" 
                 alt="${movie.title || 'Movie'}"
                 loading="lazy"
                 onerror="this.src='🎬'>
            <div class="play-overlay"></div>
        </div>
        <div class="movie-info">
            <h3 class="movie-title" title="${movie.title || 'Unknown'}">${movie.title || 'Unknown'}</h3>
            <div class="movie-meta">
                <span class="movie-year">${movie.year}</span>
                <span class="movie-rating">${movie.rating}</span>
            </div>
            <div class="movie-genres" title="${movie.genre}">${movie.genre}</div>
            <div class="movie-synopsis" title="${movie.synopsis}">${movie.synopsis}</div>
            <div class="movie-actions">
               <button id="watchlist-btn${movie.id}"
                        class="watchlist-btn ${isInWatchlist ? 'added' : ''}"
                        data-movie-id="${movie.id}"
                        data-movie-title="${movie.title}"
                        data-in-watchlist="${isInWatchlist}"
                        title="${isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}">
                    ${isInWatchlist ? '✓ In Watchlist' : '+ Watchlist'}
                </button>
                <button id="info-btn" class="info-btn" onclick="showMovieInfo('${movie.id}')" title="More Info">
                    Info
                </button>
                <button id="play-btn" class="play-btn" onclick="playMovie('${movie.id}')" title="Play Movie">
                    Play
                </button>
            </div>
        </div>
    </div>
    `;

    const btn = card.querySelector(`#watchlist-btn${movie.id}`);
    btn.addEventListener('click', function() {
            const movieId = this.dataset.movieId;
            const movieTitle = this.dataset.movieTitle;
            let isInWatchlist = this.dataset.inWatchlist === 'true';
        console.log(isInWatchlist);

            if (isInWatchlist) {
                removeFromWatchlist(movieId, movieTitle, this, isInWatchlist);
                this.textContent = "✓ In Watchlist";
                this.dataset.inWatchlist = "false";
                this.classList.add('added');
            } else {
                addToWatchlist(movieId, movieTitle, this);
                this.dataset.inWatchlist = 'true';
                this.textContent = "+ Watchlist";
                btn.classList.remove('added');
            }
        });
    
    return card;
}

function removeFromWatchlist(movieId, movieTitle) {
    
    let userWatchlist = JSON.parse(localStorage.getItem('userWatchlist') || '[]');
    const movieIndex = userWatchlist.findIndex(item => item.id === movieId);
    
    if (movieIndex !== -1) {
        const movieTitle = userWatchlist[movieIndex].title;
        userWatchlist.splice(movieIndex, 1);
        localStorage.setItem('userWatchlist', JSON.stringify(userWatchlist));
    }
}

// Sort results
function sortResults(rad,value) {
    if (rad.checked && value == "sort") {
        sortBy = rad.value;
    }
    if (value == "genre") {
        if (rad.checked) {
        genres.push(rad.value);
        } else {
            genres = genres.filter(item => item !== rad.value);
        }
    }
    
    currentPage = 1;
    performSort();
}

function loadMoreResults() {
    currentPage++;
    performSort();
}

// Update results info text
function updateResultsInfo(query, currentResults) {
    const resultsCount = document.getElementById('resultsCount');
    let text = '';
    let reslength = currentResults.length;
    currentResults = null;
    
    
    if (reslength === 0) {
        text = `No results found for "${query}"`;
    } else if (query) {
        text = `${reslength} results for "${query}"`;
        if (genres && genres.length !== 0) {
            text += ` in ${genres}`;
        }
    } else if (genres && genres.length !== 0) {
        text = `${reslength} ${genres} movies`;
    } else {
        text = `${reslength} movies`;
    }
    
    resultsCount.textContent = text;
}

// Helper functions
function formatRuntime(seconds) {
    if (!seconds) return 'Duration unknown';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Add to watchlist function
function addToWatchlist(movieId, movieTitle) {
    
    let watchlist = JSON.parse(localStorage.getItem('userWatchlist') || '[]');
    
    // Check if already in watchlist
    if (!watchlist.some(item => item.id === movieId)) {
        // Find movie in allMovies
        const movie = allMovies.find(m => m.id === movieId);
        
        if (movie) {
            watchlist.push({
                ...movie,
                status: 'plan-to-watch',
                addedDate: new Date().toISOString()
            });
            
            localStorage.setItem('userWatchlist', JSON.stringify(watchlist));
            alert(`Added "${movieTitle}" to watchlist!`);
        }
    } else {
        alert(`"${movieTitle}" is already in your watchlist!`);
    }
}
genreList.forEach(checkbox => {
    checkbox.addEventListener("change", (event) => {
        sortResults(event.target,"genre");
    });
})

sortList.forEach(checkbox => {
    checkbox.addEventListener("change", (event) => {
        sortResults(event.target,"sort");
    });
})

searchbtn.addEventListener("click", function() {
    performSearch();
})


loadbtn.addEventListener("click", function() {
    loadMoreResults();
})
const filterToggleBtn = document.getElementById('filterToggleBtn');
    if (filterToggleBtn) {
        filterToggleBtn.addEventListener('click', function() {
            const panel = document.getElementById('filterSortPanel');
            panel.classList.toggle('active');
        });
    }
// Handle search input Enter key
document.getElementById('searchInput').addEventListener('keydown', function(k) {
    if (k.key == 'Enter') {
        performSearch();
    }
});

