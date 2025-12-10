// Panel toggle functions
let selectedGenres = [];
const mainMovs = [{titleimg: "https://upload.wikimedia.org/wikipedia/commons/4/44/Dune_2021_transparent_logo.png",id: "tt1160419", "title": "Dune: Part One", "year": 2021, "synopsis": "Paul Atreides arrives on Arrakis after his father accepts the stewardship of the dangerous planet. However, chaos ensues after a betrayal as forces clash to control melange, a precious resource.", "genre": ["Action", "Adventure", "Drama"], "runtime": 9300, "rating": 8, "image": "https://m.media-amazon.com/images/M/MV5BOTEwYWFjYmItZWJmNi00MGExLWI1MjktYzRiYjJkNzhiMWIxXkEyXkFqcGdeQXNuZXNodQ@@._V1_.jpg"}];
function toggleFilterPanel() {
    const filterPanel = document.getElementById('filterPanel');
    const overlay = document.querySelector('.overlay') || createOverlay();
    
    filterPanel.classList.toggle('active');
    overlay.classList.toggle('active');
}

function toggleProfilePanel() {
    const profilePanel = document.getElementById('profilePanel');
    const overlay = document.querySelector('.overlay') || createOverlay();
    
    profilePanel.classList.toggle('active');
    overlay.classList.toggle('active');
}

function createOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.onclick = closeAllPanels;
    document.body.appendChild(overlay);
    return overlay;
}

function closeAllPanels() {
    document.getElementById('filterPanel').classList.remove('active');
    document.getElementById('profilePanel').classList.remove('active');
    document.querySelector('.overlay').classList.remove('active');
    hideSearchSuggestions();
}

// Movie row sliding functionality
function slideRow(button, direction) {
    const rowContainer = button.closest('.section-header').nextElementSibling;
    const movieRow = rowContainer.querySelector('.movie-row');
    const currentSlide = parseInt(movieRow.getAttribute('data-slide')) || 0;
    const maxSlides = 2;
    
    let newSlide = currentSlide + direction;
    
    if (newSlide < 0) newSlide = 0;
    if (newSlide > maxSlides) newSlide = maxSlides;
    
    const translateX = -(newSlide * (5 * 215));
    movieRow.style.transform = `translateX(${translateX}px)`;
    movieRow.setAttribute('data-slide', newSlide);
    
    updateArrowStates(movieRow, newSlide, maxSlides);
}

function updateArrowStates(row, currentSlide, maxSlides) {
    const arrows = row.closest('.content-section').querySelectorAll('.nav-arrow');
    arrows[0].disabled = currentSlide === 0;
    arrows[1].disabled = currentSlide === maxSlides;
}

// Filter functionality
function applyGenreFilter() {
    selectedGenres = [];
    const checkboxes = document.querySelectorAll('.genre-checkbox input:checked');
    
    checkboxes.forEach(checkbox => {
        selectedGenres.push(checkbox.value);
    });
    
    if (selectedGenres.length === 0) {
        alert('Please select at least one genre');
        return;
    }
    
    console.log('Filtering by genres:', selectedGenres);
    alert(`Filtering movies by: ${selectedGenres.join(', ')}`);
    closeAllPanels();
}

// See More functionality
function seeMore(category) {
    window.location.href = 'Search.html'+category
}

// Movie player functions
function playMovie(movieid) {
    console.log(movieid);
    window.location.href = 'Movie_Play.html?id='+ movieid;
}

function showMovieInfo(movieid) {
    window.location.href = 'https://www.imdb.com/title/'+movieid
}

// Logout function
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    window.location.href = 'Log in.html';
}

// ===== MOVIE DISPLAY FUNCTIONALITY =====

// Display movies with genre-based rows
function displayMovies() {
    // Update featured movie
    const featuredMovie = allMovies.find(movie => movie.featured) || allMovies[0];
    if (featuredMovie) {
        updateHeroSection(featuredMovie);
    }

    // Update movie rows with popular genres
    updateMovieRow('Popular Movies', allMovies.slice(0, 8));
    updateMovieRow('Action & Adventure', allMovies.filter(movie => 
        movie.genre.includes('Action') || movie.genre.includes('Adventure')
    ).slice(0, 8));
    updateMovieRow('Drama', allMovies.filter(movie => 
        movie.genre.includes('Drama')
    ).slice(0, 8));
    updateMovieRow('Comedy', allMovies.filter(movie => 
        movie.genre.includes('Comedy')
    ).slice(0, 8));
    updateMovieRow('Sci-Fi & Fantasy', allMovies.filter(movie => 
        movie.genre.includes('Sci-Fi') || movie.genre.includes('Fantasy')
    ).slice(0, 8));
    updateMovieRow('Thriller & Horror', allMovies.filter(movie => 
        movie.genre.includes('Thriller') || movie.genre.includes('Horror')
    ).slice(0, 8));
}

// ===== SEARCH SUGGESTIONS FUNCTIONALITY =====

let allMovies = [];
let searchTimeout;

// Load movies for search suggestions
async function loadMoviesForSearch() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/Bentelador/movie-bai/refs/heads/main/MDB.json');
        allMovies = await response.json();
    } catch (error) {
        console.error('Error loading movies for search:', error);
        // Fallback to placeholder movies
        allMovies = [
            { id: 1, title: "Inception", year: "2010", genre: "Action, Sci-Fi", image: "🎬" },
            { id: 2, title: "The Dark Knight", year: "2008", genre: "Action, Crime", image: "🎬" },
            { id: 3, title: "Pulp Fiction", year: "1994", genre: "Crime, Drama", image: "🎬" }
        ];
    }
}

function matching(result, ss) {
    const MA = result.toLowerCase()
    const ser = ss.toLowerCase()
    let matches = 0
   if (MA === ser) {
        matches += 3;
    }
    else if (MA.startsWith(ser)) {
        matches += 2;
    }
    else if (MA.includes(ser)) {
        matches += 1;
    }

    return matches;
}
// Show search suggestions
function showSearchSuggestions(query) {
    const suggestionsContainer = document.getElementById('searchSuggestions');
    
    if (!query.trim()) {
        hideSearchSuggestions();
        return;
    }
    
    const result = allMovies.filter(movie =>
        movie.title.toLowerCase().includes(query.toLowerCase())
    );
    
    const filteredMovies = result.sort((a,b) => {
      return matching(b.title,query) - matching(a.title,query);
    }).slice(0,5);
    
    if (filteredMovies.length === 0) {
        suggestionsContainer.innerHTML = `
            <div class="search-suggestion">
                <div class="suggestion-info">
                    <div class="suggestion-title">No results found</div>
                    <div class="suggestion-details">Press Enter to search for "${query}"</div>
                </div>
            </div>
        `;
    } else {
        suggestionsContainer.innerHTML = filteredMovies.map(movie => `
            <div class="search-suggestion" onclick="selectSuggestion('${movie.title}','${movie.id}')">
                <image class="suggestion-poster" src="${movie.image}"></image>
                <div class="suggestion-info">
                    <div class="suggestion-title">${movie.title}</div>
                    <div class="suggestion-details">${movie.year} • ${movie.genre}</div>
                </div>
            </div>
        `).join('');
    }
    
    suggestionsContainer.classList.add('active');
}

// Hide search suggestions
function hideSearchSuggestions() {
    const suggestionsContainer = document.getElementById('searchSuggestions');
    suggestionsContainer.classList.remove('active');
}

// Select a search suggestion
function selectSuggestion(movieTitle,movieid) {
    window.location.href = 'Movie_Play.html?id='+ movieid;
}

// Perform search (redirect to search results)
function performSearch(movieid) {
    const searchQuery = document.getElementById('mainSearchInput').value.trim();

    if (!searchQuery) {
        alert('Please enter a search term');
        return;
    }
    let val = 'Search.html?search='+searchQuery;
    selectedGenres.forEach(element => {
        val += '&genre='+element
    })
    window.location.href = val
}

// Initialize search functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load movies for search suggestions
    loadMoviesForSearch();
    
    const searchInput = document.getElementById('mainSearchInput');
    if (searchInput) {
        // Show suggestions on input
        searchInput.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                showSearchSuggestions(e.target.value);
            }, 300);
        });
        
        // Hide suggestions when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.search-container')) {
                hideSearchSuggestions();
            }
        });
        
        // Handle Enter key
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                hideSearchSuggestions();
                performSearch();
            }
        });
        
        // Handle Escape key
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                hideSearchSuggestions();
            }
        });
    }
    
    // Filter option selection
    const filterOptions = document.querySelectorAll('.filter-option');
    filterOptions.forEach(option => {
        option.addEventListener('click', function() {
            filterOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Close panels with ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllPanels();
        }
    });
});

// Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('.main-header');
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Enhanced watchlist function with status options
function toggleWatchlist(movieId, movieTitle, button) {
    if (button.classList.contains('added')) {
        // If already added, open status options modal
        openWatchlistOptions(movieId, movieTitle);
    } else {
        // Add to watchlist with default status
        addToWatchlist(movieId, movieTitle, 'plan-to-watch');
        button.classList.add('added');
        button.innerHTML = '✓';
    }
}

// Add to watchlist with status
function addToWatchlist(movieId, movieTitle, status = 'plan-to-watch') {
    const movie = allMovies.find(m => m.id === movieId);
    if (!movie) return;

    let userWatchlist = JSON.parse(localStorage.getItem('userWatchlist') || '[]');
    
    // Check if movie already in watchlist
    const existingIndex = userWatchlist.findIndex(item => item.id === movieId);
    
    if (existingIndex === -1) {
        // Add new movie to watchlist
        userWatchlist.push({
            ...movie,
            status: status,
            progress: status === 'completed' ? 100 : 0,
            addedDate: new Date().toISOString()
        });
    } else {
        // Update existing movie status
        userWatchlist[existingIndex].status = status;
        if (status === 'completed') {
            userWatchlist[existingIndex].progress = 100;
        }
    }
    
    localStorage.setItem('userWatchlist', JSON.stringify(userWatchlist));
    updateWatchlistStats();
    
    // Show status confirmation
    const statusText = getStatusText(status);
    showStatusToast(`${movieTitle} added as ${statusText}`);
}

// Open status selection modal
function openWatchlistOptions(movieId, movieTitle) {
    const modal = document.createElement('div');
    modal.className = 'watchlist-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>Update Status for</h3>
                <p>${movieTitle}</p>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="status-options">
                <div class="status-option" onclick="updateMovieStatus(${movieId}, 'watching')">
                    <span class="status-dot watching"></span>
                    <span class="status-text">Watching</span>
                    <span class="status-desc">Currently watching</span>
                </div>
                <div class="status-option" onclick="updateMovieStatus(${movieId}, 'completed')">
                    <span class="status-dot completed"></span>
                    <span class="status-text">Completed</span>
                    <span class="status-desc">Finished watching</span>
                </div>
                <div class="status-option" onclick="updateMovieStatus(${movieId}, 'on-hold')">
                    <span class="status-dot on-hold"></span>
                    <span class="status-text">On Hold</span>
                    <span class="status-desc">Paused watching</span>
                </div>
                <div class="status-option" onclick="updateMovieStatus(${movieId}, 'plan-to-watch')">
                    <span class="status-dot plan-to-watch"></span>
                    <span class="status-text">Plan to Watch</span>
                    <span class="status-desc">Want to watch later</span>
                </div>
                <div class="status-option" onclick="updateMovieStatus(${movieId}, 'dropped')">
                    <span class="status-dot dropped"></span>
                    <span class="status-text">Dropped</span>
                    <span class="status-desc">Stopped watching</span>
                </div>
            </div>
            <div class="modal-actions">
                <button class="remove-btn" onclick="removeFromWatchlist(${movieId})">Remove from Watchlist</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Update movie status
function updateMovieStatus(movieId, newStatus) {
    let userWatchlist = JSON.parse(localStorage.getItem('userWatchlist') || '[]');
    const movieIndex = userWatchlist.findIndex(item => item.id === movieId);
    
    if (movieIndex !== -1) {
        userWatchlist[movieIndex].status = newStatus;
        if (newStatus === 'completed') {
            userWatchlist[movieIndex].progress = 100;
        }
        localStorage.setItem('userWatchlist', JSON.stringify(userWatchlist));
        updateWatchlistStats();
        
        const movieTitle = userWatchlist[movieIndex].title;
        showStatusToast(`${movieTitle} status updated to ${getStatusText(newStatus)}`);
    }
    
    closeModal();
}

// Remove from watchlist
function removeFromWatchlist(movieId) {
    let userWatchlist = JSON.parse(localStorage.getItem('userWatchlist') || '[]');
    const movieIndex = userWatchlist.findIndex(item => item.id === movieId);
    
    if (movieIndex !== -1) {
        const movieTitle = userWatchlist[movieIndex].title;
        userWatchlist.splice(movieIndex, 1);
        localStorage.setItem('userWatchlist', JSON.stringify(userWatchlist));
        updateWatchlistStats();
        showStatusToast(`${movieTitle} removed from watchlist`);
    }
    
    closeModal();
}

// Helper functions
function closeModal() {
    const modal = document.querySelector('.watchlist-modal');
    if (modal) modal.remove();
}

function getStatusText(status) {
    const statusMap = {
        'watching': 'Watching',
        'completed': 'Completed',
        'on-hold': 'On Hold',
        'plan-to-watch': 'Plan to Watch',
        'dropped': 'Dropped'
    };
    return statusMap[status] || status;
}

function showStatusToast(message) {
    // Create a toast notification
    const toast = document.createElement('div');
    toast.className = 'status-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function updateWatchlistStats() {
    // Update the watchlist count for profile page
    const userWatchlist = JSON.parse(localStorage.getItem('userWatchlist') || '[]');
    localStorage.setItem('watchlistCount', userWatchlist.length.toString());
}

function scrollto(elementtarget){
    const target = document.getElementById(elementtarget)
    target.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        });
}

async function loadMovies() {
    const response = await fetch('https://raw.githubusercontent.com/Bentelador/movie-bai/refs/heads/main/MDB.json');
    let allMovies = await response.json();
    const maxnum = 15;
    document.getElementById('hero').innerHTML = ``;
    const Main = document.getElementById('hero');
        document.getElementById('hero').innerHTML = `
                <div class="hero-content">
                    <img class="movie-title" src="${mainMovs[0].titleimg}">
                    <p class="movie-description">${mainMovs[0].synopsis}</p>
                    <div class="movie-meta">
                        <span class="year">${mainMovs[0].year}</span>
                        <span class="rating">★ ${mainMovs[0].rating}</span>
                        <span class="duration">${mainMovs[0].runtime} seconds</span>
                    </div>
                    <div class="hero-buttons">
                        <button class="play-btn" onclick="playMovie('${mainMovs[0].id}')">▶ Play</button>
                        <button class="info-btn" onclick="showMovieInfo('${mainMovs[0].id}')">ℹ More Info</button>
                    </div>
                `;
    Main.style.backgroundImage = `
    linear-gradient(to bottom, rgba(0,0,0,0) 85%, rgba(0,0,0,0.9) 100%),
    linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)),
    url('${mainMovs[0].image}')
    `;
    
    let curmov = allMovies.slice(0,maxnum);
    let seemore = document.getElementById('top-movies-row').innerHTML;
    document.getElementById('top-movies-row').innerHTML = ``;
    curmov.forEach(element => {
        document.getElementById('top-movies-row').innerHTML = document.getElementById('top-movies-row').innerHTML + `
        <div class="netflix-movie-card">
            <image class="netflix-movie-poster" src="${element.image}"></image>
            <div class="netflix-movie-title">${element.title}</div>
            <div class="netflix-movie-actions">
                <div class="netflix-action-row">
                    <div class="netflix-main-actions">
                        <button class="netflix-play-btn" onclick="playMovie('${element.id}')">▶</button>
                        <button class="netflix-watchlist-btn" onclick="toggleWatchlist('${element.id}', 'Movie 1', this)">+</button>
                    </div>
                    <button class="netflix-info-btn" onclick="showMovieInfo('${element.id}')">ℹ</button>
                </div>
                <div class="netflix-movie-info">
                    <div class="netflix-movie-match">${element.rating * 10}% Rated</div>
                    <div class="netflix-movie-genres">${element.genre}</div>
                    <span class="netflix-hd-badge">HD</span>
                </div>
            </div>
        </div>`
    });
    document.getElementById('top-movies-row').innerHTML += seemore;


    const maxStartIndex = allMovies.length - maxnum; // make sure we have 5 elements

        // Generate random start index
        const randomStart = Math.floor(Math.random() * (maxStartIndex + 1));
        
    curmov = allMovies.filter(n => n.genre.includes('Action'));
    curmov = curmov.slice(randomStart, randomStart + maxnum);
    seemore = document.getElementById('action-movies-row').innerHTML;
    document.getElementById('action-movies-row').innerHTML = ``;
    curmov.forEach(element => {
        document.getElementById('action-movies-row').innerHTML = document.getElementById('action-movies-row').innerHTML + `
        <div class="netflix-movie-card">
            <image class="netflix-movie-poster" src="${element.image}"></image>
            <div class="netflix-movie-title">${element.title}</div>
            <div class="netflix-movie-actions">
                <div class="netflix-action-row">
                    <div class="netflix-main-actions">
                        <button class="netflix-play-btn" onclick="playMovie('${element.id}')">▶</button>
                        <button class="netflix-watchlist-btn" onclick="toggleWatchlist('${element.id}', 'Movie 1', this)">+</button>
                    </div>
                    <button class="netflix-info-btn" onclick="showMovieInfo('${element.id}')">ℹ</button>
                </div>
                <div class="netflix-movie-info">
                    <div class="netflix-movie-match">${element.rating * 10}% Rated</div>
                    <div class="netflix-movie-genres">${element.genre}</div>
                    <span class="netflix-hd-badge">HD</span>
                </div>
            </div>
        </div>`
    });
    document.getElementById('action-movies-row').innerHTML += seemore;

    curmov = allMovies.filter(n => n.genre.includes('Drama'));
    curmov = curmov.slice(randomStart, randomStart + maxnum);
    seemore = document.getElementById('Drama-movies-row').innerHTML;
    document.getElementById('Drama-movies-row').innerHTML = ``;
    curmov.forEach(element => {
        document.getElementById('Drama-movies-row').innerHTML = document.getElementById('Drama-movies-row').innerHTML + `
        <div class="netflix-movie-card">
            <image class="netflix-movie-poster" src="${element.image}"></image>
            <div class="netflix-movie-title">${element.title}</div>
            <div class="netflix-movie-actions">
                <div class="netflix-action-row">
                    <div class="netflix-main-actions">
                        <button class="netflix-play-btn" onclick="playMovie('${element.id}')">▶</button>
                        <button class="netflix-watchlist-btn" onclick="toggleWatchlist('${element.id}', 'Movie 1', this)">+</button>
                    </div>
                    <button class="netflix-info-btn" onclick="showMovieInfo('${element.id}')">ℹ</button>
                </div>
                <div class="netflix-movie-info">
                    <div class="netflix-movie-match">${element.rating * 10}% Rated</div>
                    <div class="netflix-movie-genres">${element.genre}</div>
                    <span class="netflix-hd-badge">HD</span>
                </div>
            </div>
        </div>`
    });
    document.getElementById('Drama-movies-row').innerHTML += seemore;

    curmov =  allMovies.sort((a, b) => b.votes - a.votes).slice(0,maxnum);
    seemore = document.getElementById('popular-movies-row').innerHTML;
    document.getElementById('popular-movies-row').innerHTML = ``;
    curmov.forEach(element => {
        document.getElementById('popular-movies-row').innerHTML = document.getElementById('popular-movies-row').innerHTML + `
        <div class="netflix-movie-card">
            <image class="netflix-movie-poster" src="${element.image}"></image>
            <div class="netflix-movie-title">${element.title}</div>
            <div class="netflix-movie-actions">
                <div class="netflix-action-row">
                    <div class="netflix-main-actions">
                        <button class="netflix-play-btn" onclick="playMovie('${element.id}')">▶</button>
                        <button class="netflix-watchlist-btn" onclick="toggleWatchlist('${element.id}', 'Movie 1', this)">+</button>
                    </div>
                    <button class="netflix-info-btn" onclick="showMovieInfo('${element.id}')">ℹ</button>
                </div>
                <div class="netflix-movie-info">
                    <div class="netflix-movie-match">${element.rating * 10}% Rated</div>
                    <div class="netflix-movie-genres">${element.genre}</div>
                    <span class="netflix-hd-badge">HD</span>
                </div>
            </div>
        </div>`
    });
    document.getElementById('popular-movies-row').innerHTML += seemore;

    curmov = allMovies.sort((a, b) => b.votes - a.votes).slice(0,5000);
    curmov = curmov.sort((a, b) => b.rating - a.rating).slice(0,maxnum);
    seemore = document.getElementById('toprated-movies-row').innerHTML;
    document.getElementById('toprated-movies-row').innerHTML = ``;
    curmov.forEach(element => {
        document.getElementById('toprated-movies-row').innerHTML = document.getElementById('toprated-movies-row').innerHTML + `
        <div class="netflix-movie-card">
            <image class="netflix-movie-poster" src="${element.image}"></image>
            <div class="netflix-movie-title">${element.title}</div>
            <div class="netflix-movie-actions">
                <div class="netflix-action-row">
                    <div class="netflix-main-actions">
                        <button class="netflix-play-btn" onclick="playMovie('${element.id}')">▶</button>
                        <button class="netflix-watchlist-btn" onclick="toggleWatchlist('${element.id}', 'Movie 1', this)">+</button>
                    </div>
                    <button class="netflix-info-btn" onclick="showMovieInfo('${element.id}')">ℹ</button>
                </div>
                <div class="netflix-movie-info">
                    <div class="netflix-movie-match">${element.rating * 10}% Rated</div>
                    <div class="netflix-movie-genres">${element.genre}</div>
                    <span class="netflix-hd-badge">HD</span>
                </div>
            </div>
        </div>`
    });
    document.getElementById('toprated-movies-row').innerHTML += seemore;

    curmov = allMovies.sort((a, b) => b.year - a.year).slice(0,maxnum);
    seemore = document.getElementById('newest-movies-row').innerHTML;
    document.getElementById('newest-movies-row').innerHTML = ``;
    curmov.forEach(element => {
        document.getElementById('newest-movies-row').innerHTML = document.getElementById('newest-movies-row').innerHTML + `
        <div class="netflix-movie-card">
            <image class="netflix-movie-poster" src="${element.image}"></image>
            <div class="netflix-movie-title">${element.title}</div>
            <div class="netflix-movie-actions">
                <div class="netflix-action-row">
                    <div class="netflix-main-actions">
                        <button class="netflix-play-btn" onclick="playMovie('${element.id}')">▶</button>
                        <button class="netflix-watchlist-btn" onclick="toggleWatchlist('${element.id}', 'Movie 1', this)">+</button>
                    </div>
                    <button class="netflix-info-btn" onclick="showMovieInfo('${element.id}')">ℹ</button>
                </div>
                <div class="netflix-movie-info">
                    <div class="netflix-movie-match">${element.rating * 10}% Rated</div>
                    <div class="netflix-movie-genres">${element.genre}</div>
                    <span class="netflix-hd-badge">HD</span>
                </div>
            </div>
        </div>`
    });
    document.getElementById('newest-movies-row').innerHTML += seemore;

};


loadMovies();












