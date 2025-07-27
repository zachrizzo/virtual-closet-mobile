// API Configuration
const API_BASE_URL = 'http://192.168.1.117:8000';
let authToken = null;
let currentUser = null;
let selectedUserPhoto = null;
let selectedClothingItem = null;

// Utility Functions
function showScreen(screenName) {
    document.querySelectorAll('.content-screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenName + 'Screen').classList.add('active');
    
    // Load data for the screen
    switch(screenName) {
        case 'wardrobe':
            loadWardrobe();
            break;
        case 'outfits':
            loadOutfits();
            break;
        case 'tryOn':
            loadTryOnData();
            break;
        case 'profile':
            loadProfile();
            break;
    }
}

function showError(message) {
    alert(message);
}

// Authentication
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
        });
        
        if (response.ok) {
            const data = await response.json();
            authToken = data.access_token;
            currentUser = data.user;
            
            document.getElementById('loginScreen').classList.remove('active');
            document.getElementById('mainApp').classList.add('active');
            showScreen('wardrobe');
        } else {
            document.getElementById('loginError').textContent = 'Invalid credentials';
        }
    } catch (error) {
        document.getElementById('loginError').textContent = 'Connection error';
    }
});

function logout() {
    authToken = null;
    currentUser = null;
    document.getElementById('mainApp').classList.remove('active');
    document.getElementById('loginScreen').classList.add('active');
}

// Wardrobe Functions
async function loadWardrobe() {
    try {
        const response = await fetch(`${API_BASE_URL}/clothing/`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const clothing = await response.json();
            displayClothing(clothing);
        }
    } catch (error) {
        showError('Failed to load wardrobe');
    }
}

function displayClothing(clothing) {
    const grid = document.getElementById('clothingGrid');
    grid.innerHTML = '';
    
    clothing.forEach(item => {
        const div = document.createElement('div');
        div.className = 'grid-item';
        div.innerHTML = `
            <img src="${item.image_url || 'https://via.placeholder.com/200'}" alt="${item.name}">
            <div class="grid-item-info">
                <h4>${item.name}</h4>
                <p>${item.category} • ${item.color}</p>
            </div>
        `;
        div.onclick = () => showClothingDetail(item);
        grid.appendChild(div);
    });
}

function showAddClothing() {
    document.getElementById('addClothingModal').style.display = 'block';
}

function closeAddClothing() {
    document.getElementById('addClothingModal').style.display = 'none';
    document.getElementById('addClothingForm').reset();
}

document.getElementById('addClothingForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', document.getElementById('clothingName').value);
    formData.append('category', document.getElementById('clothingCategory').value);
    formData.append('color', document.getElementById('clothingColor').value);
    formData.append('brand', document.getElementById('clothingBrand').value);
    
    const imageFile = document.getElementById('clothingImage').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/clothing/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });
        
        if (response.ok) {
            closeAddClothing();
            loadWardrobe();
        } else {
            showError('Failed to add clothing');
        }
    } catch (error) {
        showError('Connection error');
    }
});

// Outfits Functions
async function loadOutfits() {
    try {
        const response = await fetch(`${API_BASE_URL}/outfits/`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const outfits = await response.json();
            displayOutfits(outfits);
        }
    } catch (error) {
        showError('Failed to load outfits');
    }
}

function displayOutfits(outfits) {
    const grid = document.getElementById('outfitsGrid');
    grid.innerHTML = '';
    
    outfits.forEach(outfit => {
        const div = document.createElement('div');
        div.className = 'grid-item';
        div.innerHTML = `
            <div style="padding: 20px; text-align: center;">
                <h4>${outfit.name}</h4>
                <p>${outfit.clothing_items?.length || 0} items</p>
                <p style="margin-top: 10px;">${outfit.occasions?.join(', ') || 'Any occasion'}</p>
            </div>
        `;
        grid.appendChild(div);
    });
}

// Virtual Try-On Functions
async function loadTryOnData() {
    // Load user photos
    loadUserPhotos();
    // Load clothing for try-on
    loadTryOnClothing();
}

async function loadUserPhotos() {
    try {
        const response = await fetch(`${API_BASE_URL}/users/me/photos`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const photos = await response.json();
            displayUserPhotos(photos);
        }
    } catch (error) {
        console.error('Failed to load user photos');
    }
}

function displayUserPhotos(photos) {
    const container = document.getElementById('userPhotos');
    container.innerHTML = '';
    
    photos.forEach(photo => {
        const img = document.createElement('img');
        img.src = photo.image_url;
        img.onclick = () => selectUserPhoto(photo, img);
        container.appendChild(img);
    });
}

function selectUserPhoto(photo, imgElement) {
    document.querySelectorAll('#userPhotos img').forEach(img => {
        img.classList.remove('selected');
    });
    imgElement.classList.add('selected');
    selectedUserPhoto = photo;
}

async function loadTryOnClothing() {
    try {
        const response = await fetch(`${API_BASE_URL}/clothing/`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const clothing = await response.json();
            displayTryOnClothing(clothing.filter(item => 
                ['tops', 'bottoms', 'dresses', 'outerwear'].includes(item.category)
            ));
        }
    } catch (error) {
        console.error('Failed to load clothing');
    }
}

function displayTryOnClothing(clothing) {
    const container = document.getElementById('tryOnClothing');
    container.innerHTML = '';
    
    clothing.forEach(item => {
        const img = document.createElement('img');
        img.src = item.image_url || 'https://via.placeholder.com/120';
        img.onclick = () => selectClothing(item, img);
        container.appendChild(img);
    });
}

function selectClothing(item, imgElement) {
    document.querySelectorAll('#tryOnClothing img').forEach(img => {
        img.classList.remove('selected');
    });
    imgElement.classList.add('selected');
    selectedClothingItem = item;
}

async function uploadUserPhoto() {
    const fileInput = document.getElementById('userPhotoUpload');
    const file = fileInput.files[0];
    
    if (!file) {
        showError('Please select a photo');
        return;
    }
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/me/photos`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });
        
        if (response.ok) {
            fileInput.value = '';
            loadUserPhotos();
        } else {
            showError('Failed to upload photo');
        }
    } catch (error) {
        showError('Connection error');
    }
}

async function performTryOn() {
    if (!selectedUserPhoto || !selectedClothingItem) {
        showError('Please select both a photo and a clothing item');
        return;
    }
    
    const resultSection = document.getElementById('tryOnResult');
    resultSection.innerHTML = '<div class="loading"></div> Processing...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/clothing/${selectedClothingItem.id}/try-on`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_photo_id: selectedUserPhoto.id
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            resultSection.innerHTML = `
                <h3>Try-On Result</h3>
                <img src="${result.result_url}" alt="Try-on result">
            `;
        } else {
            resultSection.innerHTML = '<p>Failed to process try-on</p>';
        }
    } catch (error) {
        resultSection.innerHTML = '<p>Connection error</p>';
    }
}

// Profile Functions
async function loadProfile() {
    const profileInfo = document.getElementById('profileInfo');
    profileInfo.innerHTML = `
        <h3>${currentUser.name}</h3>
        <p>Email: ${currentUser.email}</p>
        <p>Style Preferences: ${currentUser.style_preferences?.join(', ') || 'Not set'}</p>
    `;
    
    // Load user photos for profile
    try {
        const response = await fetch(`${API_BASE_URL}/users/me/photos`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const photos = await response.json();
            const container = document.getElementById('profileUserPhotos');
            container.innerHTML = '';
            
            photos.forEach(photo => {
                const img = document.createElement('img');
                img.src = photo.image_url;
                container.appendChild(img);
            });
        }
    } catch (error) {
        console.error('Failed to load profile photos');
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('addClothingModal');
    if (event.target === modal) {
        closeAddClothing();
    }
}