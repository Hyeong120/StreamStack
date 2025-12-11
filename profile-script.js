// Profile page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'Log in.html';
    }

    // Load user data
    loadUserData();

});



function addmovie(buns) {
    console.log(buns)
    document.getElementById('act-list').innerHTML = `<div class="activity-item">
                        <div class="activity-poster"><img src="${buns[0].image}"></div>
                        <div class="activity-info">
                            <div class="activity-title">${buns[0].title}</div>
                            <div class="activity-time">Watched 2 hours ago</div>
                        </div>
                    </div>
                    <div class="activity-item">
                        <div class="activity-poster"><img class="activity-poster" src="${buns[1].image}"></div>
                        <div class="activity-info">
                            <div class="activity-title">${buns[1].title}</div>
                            <div class="activity-time">Watched 1 day ago</div>
                        </div>
                    </div>`
}

function loadWatchlist() {
    // Load from localStorage
    const savedWatchlist = localStorage.getItem('userWatchlist');
    const userWatchlist = savedWatchlist ? JSON.parse(savedWatchlist) : [];
    
    addmovie(userWatchlist);
}

function loadUserData() {
    const userEmail = localStorage.getItem('userEmail');
    const userFullName = localStorage.getItem('userFullName') || 'User Name';
    
    // Update profile page
    const userName = document.getElementById('userFullName');
    const userEmailElement = document.getElementById('userEmail');
    
    if (userName) userName.textContent = userFullName;
    if (userEmailElement) userEmailElement.textContent = userEmail || 'user@email.com';
    
    // Update profile panel
    const panelUserName = document.getElementById('panelUserName');
    const panelUserEmail = document.getElementById('panelUserEmail');
    
    if (panelUserName) panelUserName.textContent = userFullName;
    if (panelUserEmail) panelUserEmail.textContent = userEmail || 'user@email.com';
    
    // Load and update stats
    updateProfileStats();
}

function updateProfileStats() {
    // Get watchlist data
    const userWatchlist = JSON.parse(localStorage.getItem('userWatchlist') || '[]');
    
    // Calculate stats
    const moviesWatched = userWatchlist.filter(movie => movie.status === 'completed').length;
    const moviesLiked = userWatchlist.filter(movie => movie.rating >= 4).length; // Assuming liked = high rated
    const inWatchlist = userWatchlist.length;
    
    // Update the stats display
    const moviesLikedElement = document.getElementById('moviesLiked');
    const moviesWatchedElement = document.getElementById('moviesWatched');
    const inWatchlistElement = document.getElementById('inWatchlist');
    
    if (moviesLikedElement) moviesLikedElement.textContent = moviesLiked;
    if (moviesWatchedElement) moviesWatchedElement.textContent = moviesWatched;
    if (inWatchlistElement) inWatchlistElement.textContent = inWatchlist;
    
    // Store stats for other pages to access
    localStorage.setItem('profileStats', JSON.stringify({
        moviesLiked,
        moviesWatched,
        inWatchlist
    }));
    loadWatchlist()
}

// Logout function
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userFullName');
    window.location.href = 'Log in.html';
}

// ===== PROFILE PICTURE UPLOAD FUNCTIONALITY =====

// Profile picture functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load saved avatar
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) {
        document.getElementById('avatarPreview').src = savedAvatar;
        // Also update the profile panel avatar if it exists
        const profilePanelAvatar = document.querySelector('.user-avatar');
        if (profilePanelAvatar) {
            profilePanelAvatar.src = savedAvatar;
        }
    }
    
    // Avatar upload handler
    const avatarUpload = document.getElementById('avatarUpload');
    if (avatarUpload) {
        avatarUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Check if file is an image
                if (!file.type.match('image.*')) {
                    showToast('Please select an image file');
                    return;
                }
                
                // Check file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    showToast('Image must be less than 5MB');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    const avatarUrl = e.target.result;
                    // Update both profile page and profile panel avatars
                    document.getElementById('avatarPreview').src = avatarUrl;
                    const profilePanelAvatar = document.querySelector('.user-avatar');
                    if (profilePanelAvatar) {
                        profilePanelAvatar.src = avatarUrl;
                    }
                    localStorage.setItem('userAvatar', avatarUrl);
                    showToast('Profile picture updated!');
                }
                reader.readAsDataURL(file);
            }
        });
    }
});

function openCamera() {
    // This would open device camera in a real app
    // For now, we'll simulate it by triggering file input
    document.getElementById('avatarUpload').click();
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Profile picture functionality with cropping
let currentAvatarFile = null;

// Profile picture functionality
document.addEventListener('DOMContentLoaded', function() {
    // Avatar is now handled by avatar-manager.js
    
    // Click avatar container to upload
    const avatarContainer = document.querySelector('.avatar-container');
    if (avatarContainer) {
        avatarContainer.addEventListener('click', function() {
            document.getElementById('avatarUpload').click();
        });
    }
    
    // Avatar upload handler
    const avatarUpload = document.getElementById('avatarUpload');
    if (avatarUpload) {
        avatarUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                handleAvatarUpload(file);
            }
        });
    }
});

function handleAvatarUpload(file) {
    // Check if file is an image
    if (!file.type.match('image.*')) {
        showToast('Please select an image file');
        return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('Image must be less than 5MB');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        // Auto-crop and save
        autoCropAndSave(e.target.result);
    }
    reader.readAsDataURL(file);
}

function autoCropAndSave(imageUrl) {
    const img = new Image();
    img.onload = function() {
        // Create canvas for circular cropping
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const size = Math.min(img.width, img.height);
        
        canvas.width = 200;
        canvas.height = 200;
        
        // Draw circular mask
        ctx.beginPath();
        ctx.arc(100, 100, 100, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        
        // Calculate dimensions to center and fill circle
        const ratio = size / 200;
        const sourceX = (img.width - size) / 2;
        const sourceY = (img.height - size) / 2;
        
        ctx.drawImage(img, sourceX, sourceY, size, size, 0, 0, 200, 200);
        
        // Convert to data URL and save
        const croppedAvatarUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        // Save to localStorage and update everywhere
        localStorage.setItem('userAvatar', croppedAvatarUrl);
        loadAvatarEverywhere(); // This will update all pages
        showToast('Profile picture updated everywhere!');
    }
    img.src = imageUrl;
}

function openCamera() {
    // Simulate camera by triggering file input
    document.getElementById('avatarUpload').click();
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);

}












