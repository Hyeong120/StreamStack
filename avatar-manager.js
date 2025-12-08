// Avatar Manager - Handles profile pictures across all pages
function loadAvatarEverywhere() {
    const savedAvatar = localStorage.getItem('userAvatar');
    
    if (savedAvatar) {
        updateAllAvatars(savedAvatar);
    } else {
        setDefaultAvatarEverywhere();
    }
}

function updateAllAvatars(avatarUrl) {
    // Update header avatar (all pages)
    const headerAvatars = document.querySelectorAll('.profile-avatar, .profile-avatar-large, .user-avatar');
    headerAvatars.forEach(avatar => {
        if (avatar.tagName === 'IMG') {
            avatar.src = avatarUrl;
        } else {
            avatar.style.backgroundImage = `url(${avatarUrl})`;
            avatar.style.backgroundSize = 'cover';
            avatar.textContent = '';
        }
    });
    
    // Update profile page avatar
    const profilePreview = document.getElementById('avatarPreview');
    if (profilePreview) {
        profilePreview.src = avatarUrl;
        profilePreview.style.backgroundColor = 'transparent';
        profilePreview.style.display = 'block';
        profilePreview.textContent = '';
    }
}

function setDefaultAvatarEverywhere() {
    const defaultAvatar = 'U';
    const headerAvatars = document.querySelectorAll('.profile-avatar, .profile-avatar-large, .user-avatar');
    
    headerAvatars.forEach(avatar => {
        avatar.style.backgroundImage = 'none';
        avatar.style.backgroundColor = '#e50914';
        avatar.textContent = defaultAvatar;
    });
    
    const profilePreview = document.getElementById('avatarPreview');
    if (profilePreview) {
        profilePreview.src = '';
        profilePreview.style.backgroundColor = '#e50914';
        profilePreview.style.display = 'flex';
        profilePreview.style.alignItems = 'center';
        profilePreview.style.justifyContent = 'center';
        profilePreview.style.fontSize = '3rem';
        profilePreview.textContent = defaultAvatar;
    }
}

// Load avatar when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadAvatarEverywhere();
});