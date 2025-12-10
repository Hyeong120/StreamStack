// Watchlist functionality
let userWatchlist = [];

// Add this NEW function to load user data
function loadUserData() {
    // Get fresh user data from localStorage
    const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
    const userFullName = localStorage.getItem('userFullName') || 'User Name';
    const userPhone = localStorage.getItem('userPhone') || '+1 (555) 123-4567';
    
    console.log('Loading user data for watchlist:', {
        email: userEmail,
        name: userFullName,
        phone: userPhone
    });
    
    // Update profile panel if it exists
    const panelUserName = document.getElementById('panelUserName');
    const panelUserEmail = document.getElementById('panelUserEmail');
    
    if (panelUserName) {
        panelUserName.textContent = userFullName;
        console.log('Updated panel name to:', userFullName);
    }
    
    if (panelUserEmail) {
        panelUserEmail.textContent = userEmail;
        console.log('Updated panel email to:', userEmail);
    }
    
    // Return the data in case other functions need it
    return { userEmail, userFullName, userPhone };
}

// Debug function
function debugLocalStorage() {
    console.log('=== LOCALSTORAGE DEBUG ===');
    console.log('userEmail:', localStorage.getItem('userEmail'));
    console.log('userFullName:', localStorage.getItem('userFullName'));
    console.log('userPhone:', localStorage.getItem('userPhone'));
    console.log('userWatchlist:', localStorage.getItem('userWatchlist') ? 'Exists (' + JSON.parse(localStorage.getItem('userWatchlist')).length + ' items)' : 'Empty');
    console.log('userSettings:', localStorage.getItem('userSettings'));
    console.log('isLoggedIn:', localStorage.getItem('isLoggedIn'));
    console.log('==========================');
}

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
    }

    // Debug first
    debugLocalStorage();
    
    // Load user data FIRST
    loadUserData();
    
    // Load watchlist
    loadWatchlist();
    
    // Initialize event listeners
    initializeWatchlistEvents();
});

function loadWatchlist() {
    // Load from localStorage
    const savedWatchlist = localStorage.getItem('userWatchlist');
    userWatchlist = savedWatchlist ? JSON.parse(savedWatchlist) : [];
    
    displayWatchlist();
    updateStats();
}

function displayWatchlist(filterStatus = 'all') {
    const watchlistGrid = document.getElementById('watchlistGrid');
    const emptyWatchlist = document.getElementById('emptyWatchlist');
    
    if (userWatchlist.length === 0) {
        watchlistGrid.style.display = 'none';
        emptyWatchlist.style.display = 'block';
        return;
    }
    
    emptyWatchlist.style.display = 'none';
    watchlistGrid.style.display = 'grid';
    
    const filteredItems = filterStatus === 'all' 
        ? userWatchlist 
        : userWatchlist.filter(item => item.status === filterStatus);
    
    watchlistGrid.innerHTML = filteredItems.map(item => `
        <div class="watchlist-item" data-movie-id="${item.id}">
            <div class="watchlist-poster">${item.image}</div>
            <div class="watchlist-info">
                <div class="watchlist-title">
                    ${item.title}
                    <span class="status-badge ${item.status}">${getStatusText(item.status)}</span>
                </div>
                <div class="watchlist-meta">
                    <span>${item.year}</span>
                    <span>★ ${item.rating}</span>
                </div>
                <div class="watchlist-actions">
                    <select class="status-select" onchange="updateMovieStatus(${item.id}, this.value)">
                        <option value="watching" ${item.status === 'watching' ? 'selected' : ''}>Watching</option>
                        <option value="completed" ${item.status === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="on-hold" ${item.status === 'on-hold' ? 'selected' : ''}>On Hold</option>
                        <option value="plan-to-watch" ${item.status === 'plan-to-watch' ? 'selected' : ''}>Plan to Watch</option>
                        <option value="dropped" ${item.status === 'dropped' ? 'selected' : ''}>Dropped</option>
                    </select>
                    <button class="remove-btn" onclick="removeFromWatchlist('${item.id}')">Remove</button>
                </div>
                ${item.status === 'watching' || item.status === 'completed' ? `
                <div class="progress-section">
                    <div class="progress-label">
                        <span>Progress</span>
                        <span>${item.progress || 0}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${item.progress || 0}%"></div>
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `).join('');
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

function updateStats() {
    document.getElementById('totalMovies').textContent = userWatchlist.length;
    document.getElementById('completedCount').textContent = userWatchlist.filter(item => item.status === 'completed').length;
    document.getElementById('watchingCount').textContent = userWatchlist.filter(item => item.status === 'watching').length;
    
    // Update profile page stats
    updateProfileStats();
}

function updateProfileStats() {
    // This will update the stats on the profile page
    const watchlistCount = userWatchlist.length;
    // You can store this in localStorage for the profile page to read
    localStorage.setItem('watchlistCount', watchlistCount.toString());
}

function initializeWatchlistEvents() {
    // Status filter buttons
    const statusFilters = document.querySelectorAll('.status-filter');
    statusFilters.forEach(button => {
        button.addEventListener('click', function() {
            statusFilters.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const status = this.getAttribute('data-status');
            displayWatchlist(status);
        });
    });
}

function updateMovieStatus(movieId, newStatus) {
    const movieIndex = userWatchlist.findIndex(item => item.id === movieId);
    if (movieIndex !== -1) {
        userWatchlist[movieIndex].status = newStatus;
        
        if (newStatus === 'completed') {
            userWatchlist[movieIndex].progress = 100;
        }
        
        saveWatchlist();
        displayWatchlist(document.querySelector('.status-filter.active').getAttribute('data-status'));
        updateStats();
    }
}

function removeFromWatchlist(movieId) {
    userWatchlist = userWatchlist.filter(item => item.id !== movieId);
    saveWatchlist();
    displayWatchlist(document.querySelector('.status-filter.active').getAttribute('data-status'));
    updateStats();
}

function saveWatchlist() {
    localStorage.setItem('userWatchlist', JSON.stringify(userWatchlist));
    // Refresh user data display
    loadUserData();
}

// Function to add movie to watchlist (call this from main page)
function addToWatchlist(movie) {
    // Check if movie already in watchlist
    const existingIndex = userWatchlist.findIndex(item => item.id === movie.id);
    
    if (existingIndex === -1) {
        userWatchlist.push({
            ...movie,
            status: 'plan-to-watch',
            progress: 0,
            addedDate: new Date().toISOString()
        });
        saveWatchlist();
        updateStats();
        alert(`${movie.title} added to watchlist!`);
    } else {
        alert(`${movie.title} is already in your watchlist!`);
    }
}

// Like/unlike movie function
function toggleLike(movieId, button) {
    let likedMovies = JSON.parse(localStorage.getItem('likedMovies') || '[]');
    
    if (likedMovies.includes(movieId)) {
        // Unlike
        likedMovies = likedMovies.filter(id => id !== movieId);
        button.classList.remove('liked');
        button.innerHTML = '♥';
    } else {
        // Like
        likedMovies.push(movieId);
        button.classList.add('liked');
        button.innerHTML = '❤️';
    }
    
    localStorage.setItem('likedMovies', JSON.stringify(likedMovies));
    updateAllStats();
}

// Function to check if movie is in watchlist
function isInWatchlist(movieId) {
    return userWatchlist.some(item => item.id === movieId);
}

function updateAllStats() {
    const userWatchlist = JSON.parse(localStorage.getItem('userWatchlist') || '[]');
    
    const moviesWatched = userWatchlist.filter(movie => movie.status === 'completed').length;
    const moviesLiked = userWatchlist.filter(movie => movie.rating >= 4).length;
    const inWatchlist = userWatchlist.length;
    
    // Update localStorage for profile page
    localStorage.setItem('profileStats', JSON.stringify({
        moviesLiked,
        moviesWatched,
        inWatchlist
    }));
    
    // If on profile page, update the display
    if (document.getElementById('moviesLiked')) {
        document.getElementById('moviesLiked').textContent = moviesLiked;
        document.getElementById('moviesWatched').textContent = moviesWatched;
        document.getElementById('inWatchlist').textContent = inWatchlist;
    }
}

