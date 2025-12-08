import ben, { searchfunc } from "./searchmodule.js"
let allMovies = [];
let currentResults = [];
let currentPage = 1;
const resultsPerPage = 12;
let selectedMovie = null;

// Load movies when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadMovies();
});

// Load movies from JSON file
async function loadMovies() {
        const response = await fetch('https://raw.githubusercontent.com/Bentelador/movie-bai/refs/heads/main/MDB.json');
        allMovies = await response.json();
        console.log(`Loaded ${allMovies.length} movies`);
    
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    console.log(searchQuery);
    
    if (searchQuery) {
        console.log("a");
        document.getElementById('searchInput').value = searchQuery;
        const OutsideSearch = await ben(searchQuery, "relevance");
        console.log(OutsideSearch);
        displayResults(OutsideSearch);
        updateResultsInfo(searchQuery);
    }
}


// Perform search
function performSearch(searchTerm = "") {
    const query = searchTerm || document.getElementById('searchInput').value.trim();
    
    // Update URL without reloading page
    //window.history.replaceState({}, '', `search-results.html?q=${encodeURIComponent(query)}`);
    //deprecate na needed only for loading into the search from the main pages, so planning on adding a load movies when loading into the search page
    
    // Filter movies based on search query
    currentResults = allMovies.filter(movie => {
        const searchLower = query.toLowerCase();
        const titleMatch = movie.title.toLowerCase().includes(searchLower);
        
        // Check genres (array)
        let genreMatch = false; 
        if (movie.genre && Array.isArray(movie.genre)) {
            genreMatch = movie.genre.some(genre => 
                genre.toLowerCase().includes(searchLower)
            );
        }
        
        // Check synopsis
        const synopsisMatch = movie.synopsis && 
            movie.synopsis.toLowerCase().includes(searchLower);
        
        return titleMatch || genreMatch || synopsisMatch;
    });
    currentPage = 1;
    displayResults();
    updateResultsInfo(query);
}

// Display results
function displayResults() {
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
    
    // Calculate which results to show (pagination)
    const startIndex = 0;
    const endIndex = currentPage * resultsPerPage;
    const resultsToShow = currentResults.slice(startIndex, endIndex);
    
    // Clear previous results
    resultsGrid.innerHTML = '';
    
    // Display results
    resultsToShow.forEach(movie => {
        const movieCard = createMovieCard(movie);
        resultsGrid.appendChild(movieCard);
    });
    
    // Show/hide load more button
    if (endIndex < currentResults.length) {
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
                    <button class="play-btn" onclick="playMovie('${movie.title}')">▶ Play</button>
                    <button class="watchlist-btn" onclick="addToWatchlist('${movie.id}', '${movie.title}')">+ Watchlist</button>
                </div>
            </div>
        </div>
    `;
    
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
function sortResults(rad) {
    if (rad.checked) {
        const sortBy = rad.value
        switch(sortBy) {
        case 'year':
            currentResults.sort((a, b) => (b.year || 0) - (a.year || 0));
            break;
        case 'year_old':
            currentResults.sort((a, b) => (a.year || 0) - (b.year || 0));
            break;
        case 'rating':
            currentResults.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
        case 'title':
            currentResults.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'relevance':
        default:
            // Keep search relevance order
            break;
    }
    
    currentPage = 1;
    displayResults();
    }
}

// Filter by genre
function filterResults() {
    const selectedGenre = document.getElementById('genreSelect').value;
    
    if (selectedGenre === 'all') {
        // Reset to all search results
        const query = document.getElementById('searchInput').value;
        performSearch(query);
        return;
    }
    
    // Filter current results by genre
    const filteredResults = allMovies.filter(movie => 
        movie.genre && Array.isArray(movie.genre) && 
        movie.genre.some(g => g.toLowerCase() === selectedGenre.toLowerCase())
    );
    
    // Also apply search query if exists
    const query = document.getElementById('searchInput').value;
    if (query) {
        currentResults = filteredResults.filter(movie => 
            movie.title.toLowerCase().includes(query.toLowerCase()) ||
            (movie.synopsis && movie.synopsis.toLowerCase().includes(query.toLowerCase()))
        );
    } else {
        currentResults = filteredResults;
    }
    
    currentPage = 1;
    displayResults();
    updateResultsInfo(query || 'All Movies', selectedGenre);
}

// Load more results (pagination)
function loadMoreResults() {
    currentPage++;
    displayResults();
}

// Update results info text
function updateResultsInfo(query, genre = null) {
    const resultsCount = document.getElementById('resultsCount');
    let text = '';
    
    if (currentResults.length === 0) {
        text = `No results found for "${query}"`;
    } else if (query) {
        text = `${currentResults.length} results for "${query}"`;
        if (genre && genre !== 'all') {
            text += ` in ${genre}`;
        }
    } else if (genre && genre !== 'all') {
        text = `${currentResults.length} ${genre} movies`;
    } else {
        text = `${currentResults.length} movies`;
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

// Handle search input Enter key
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        performSearch();
    }
});
