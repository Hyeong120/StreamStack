import ben, { searchfunc } from "./searchmodule.js"
const genreList = document.querySelectorAll(".SortFilter2 input[type='checkbox']");
const sortList = document.querySelectorAll(".SortFilter input[type='radio']");
const searchbtn = document.getElementById("search-btn");
const loadbtn = document.getElementById("load-more-btn");

let allMovies = [];
let sortBy = "relevance";
let genres = [];
let currentPage = 1;
const resultsPerPage = 12;
let selectedMovie = null;
let query = "";

// Load movies when page loads
function onLoad() {
    loadMovies().then(() => {
        // Remove the event listener after loadMovies finishes
        document.removeEventListener('DOMContentLoaded', onLoad);
    });
}
document.addEventListener('DOMContentLoaded', onLoad);

// Load movies from JSON file
async function loadMovies() {
        const response = await fetch('https://raw.githubusercontent.com/Bentelador/movie-bai/refs/heads/main/MDB.json');
        allMovies = await response.json();
        console.log(`Loaded ${allMovies.length} movies`);
    
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    
    if (searchQuery) {
        document.getElementById('searchInput').value = searchQuery;
        query = searchQuery
        const OutsideSearch = await ben(searchQuery, "relevance", allMovies);
        displayResults(OutsideSearch);
        updateResultsInfo(searchQuery,OutsideSearch);
    }
}


// Perform search
async function performSearch() {
    query = document.getElementById('searchInput').value;
    const currentResults = await searchfunc(query,genres,sortBy,allMovies);
    currentPage = 1;
    displayResults(currentResults);
    updateResultsInfo(query, currentResults);
}

async function performSort() {
    const currentResults = await searchfunc(query,genres,sortBy,allMovies);
    displayResults(currentResults);
    updateResultsInfo(query, currentResults);
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
        clearMovieDetails();
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
    
    // Select first movie by default
    if (resultsToShow.length > 0 && !selectedMovie) {
        showMovieDetails(resultsToShow[0]);
    }
}

// Create movie card element
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.dataset.id = movie.id;
    
    // Format genres from array to string
    const genresText = movie.genre ? movie.genre.join(', ') : 'Unknown';
    
    card.innerHTML = `
        <div class="movie-poster">
            <img src="${movie.image}" alt="${movie.title}" onerror="this.src='🎬'; this.style.fontSize='4rem'; this.style.display='flex'; this.style.alignItems='center'; this.style.justifyContent='center';">
        </div>
        <div class="movie-info">
            <h3 class="movie-title">${movie.title}</h3>
            <div class="movie-meta">
                <span class="movie-year">${movie.year}</span>
                <span class="movie-rating">★ ${movie.rating || 'N/A'}</span>
                <span class="movie-votes">(${formatNumber(movie.votes || 0)} votes)</span>
            </div>
            <div class="movie-genres">${genresText}</div>
        </div>
    `;
    
    card.addEventListener('click', () => showMovieDetails(movie));
    
    return card;
}

// Show movie details in left panel
function showMovieDetails(movie) {
    selectedMovie = movie;
    const detailsPanel = document.getElementById('movieDetails');
    
    // Format runtime from seconds to hours/minutes
    const runtimeText = movie.runtime ? formatRuntime(movie.runtime) : 'Duration unknown';
    
    // Format genres from array
    const genresText = movie.genre ? movie.genre.join(' • ') : 'Unknown';
    
    detailsPanel.innerHTML = `
        <div class="selected-movie">
            <div class="selected-poster">
                <img src="${movie.image}" alt="${movie.title}" onerror="this.src='🎬'; this.style.fontSize='6rem'; this.style.display='flex'; this.style.alignItems='center'; this.style.justifyContent='center';">
            </div>
            <div class="selected-info">
                <h2>${movie.title}</h2>
                <div class="selected-meta">
                    <span>${movie.year}</span>
                    <span>★ ${movie.rating || 'N/A'}</span>
                    <span>${runtimeText}</span>
                    <span>${formatNumber(movie.votes || 0)} votes</span>
                </div>
                <div class="selected-genres">${genresText}</div>
                <p class="selected-description">${movie.synopsis || 'No synopsis available.'}</p>
                <div class="selected-actions">
                    <button class="play-btn" onclick="window.location.href='Movie_Play.html?id=${movie.id}'">▶ Play</button>
                    <button class="watchlist-btn">+ Watchlist</button>
                </div>
            </div>
        </div>
    `;
    const watchlistBtn = document.querySelector(".watchlist-btn").addEventListener("click", () => {
    addToWatchlist(movie.id, movie.title);
    });
    // Highlight selected card
    document.querySelectorAll('.movie-card').forEach(card => {
        card.classList.remove('selected');
        if (card.dataset.id === movie.id) {
            card.classList.add('selected');
        }
    });
}

// Clear movie details panel
function clearMovieDetails() {
    const detailsPanel = document.getElementById('movieDetails');
    detailsPanel.innerHTML = `
        <div class="details-placeholder">
            <h3>Select a movie to view details</h3>
            <p>Click on any movie poster to see its information here</p>
        </div>
    `;
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

function getSampleMovies() {
    return [
        {
            "id": "tt1312221",
            "title": "Frankenstein",
            "year": 2025,
            "synopsis": "Dr. Victor Frankenstein, a brilliant but egotistical scientist, brings a creature to life in a monstrous experiment...",
            "genre": ["Drama", "Fantasy", "Horror"],
            "runtime": 8940,
            "rating": 7.5,
            "votes": 155095,
            "image": "https://m.media-amazon.com/images/M/MV5BYzYzNDYxMTQtMTU4OS00MTdlLThhMTQtZjI4NGJmMTZmNmRiXkEyXkFqcGc@._V1_.jpg"
        },
        {
            "id": "tt19847976",
            "title": "Wicked: For Good",
            "year": 2025,
            "synopsis": "Elphaba, the future Wicked Witch of the West and her relationship with Glinda, the Good Witch of the North...",
            "genre": ["Family", "Fantasy", "Musical"],
            "runtime": 8220,
            "rating": 7.1,
            "votes": 22097,
            "image": "https://m.media-amazon.com/images/M/MV5BNzRhNTE4ZTYtNTM0Mi00MzU3LTk4MTktYWE3MzQ2NTU0MDNlXkEyXkFqcGc@._V1_.jpg"
        }
    ];
}

// Play movie function
function playMovie(title) {
    alert(`Now playing: ${title}`);
}

// Add to watchlist function
function addToWatchlist(movieId, movieTitle) {
    // Get existing watchlist
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
// Handle search input Enter key
document.getElementById('searchInput').addEventListener('keydown', function(k) {
    if (k.key == 'Enter') {
        performSearch();
    }
});

