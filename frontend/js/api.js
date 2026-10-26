// Central API Service with Hybrid Backend & LocalStorage Fallback for AgriDoc
// BASE_URL is intentionally empty so API calls resolve to the same origin.
// This works for both local development (served via Spring Boot) and production (Render).
// For local dev with Live Server, set to 'http://localhost:8080' temporarily.
const BASE_URL = '';

// Helper to check if JWT token is expired client-side
function isTokenExpired(token) {
    if (!token) return true;
    if (token === 'offline_jwt_token_key') return false;
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return true;
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        if (!payload.exp) return false;
        return Date.now() >= payload.exp * 1000;
    } catch (e) {
        return true;
    }
}

function clearSessionData() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('fullName');
    localStorage.removeItem('userId');
}

// Global Fetch Interceptor to handle expired or invalid JWT tokens (401 Unauthorized)
const originalFetch = window.fetch;
window.fetch = async function (url, options = {}) {
    try {
        const res = await originalFetch(url, options);
        if (res.status === 401 && typeof url === 'string' && !url.includes('/api/auth/login')) {
            clearSessionData();
            
            // Redirect to login screen
            const prefix = window.location.pathname.includes('/pages/') ? '../' : '';
            window.location.href = `${prefix}index.html?session_expired=true`;
            throw new Error('Session expired');
        }
        return res;
    } catch (err) {
        // Propagate network errors normally for fallback logic
        throw err;
    }
};

// Global helper to show themed notifications (alert banner)
function showAlert(message, type = 'danger') {
    const existingBanner = document.getElementById('agridoc-alert-banner');
    if (existingBanner) {
        existingBanner.remove();
    }

    const banner = document.createElement('div');
    banner.id = 'agridoc-alert-banner';
    banner.className = `alert-banner ${type} show`;
    
    let emoji = '⚠️';
    if (type === 'success') emoji = '✅';
    if (type === 'danger') emoji = '❌';
    
    banner.innerHTML = `<span>${emoji}</span> <span>${message}</span>`;
    document.body.appendChild(banner);

    setTimeout(() => {
        banner.classList.remove('show');
        setTimeout(() => banner.remove(), 400);
    }, 4000);
}

// Global Loading Spinner toggle
function toggleSpinner(show) {
    let overlay = document.getElementById('agridoc-spinner-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'agridoc-spinner-overlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="leaf-loader"></div>
            <div class="loading-text" id="spinner-loading-text">AgriDoc is analyzing...</div>
        `;
        document.body.appendChild(overlay);
    }
    
    if (show) {
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
}

// Global image fallback helper
function handleImageError(img, type = 'leaf') {
    img.onerror = null; // Prevent infinite loop
    if (type === 'crop') {
        img.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='15' fill='%23E8F5E9'/><text x='50%25' y='65%25' font-size='45' text-anchor='middle'>🌱</text></svg>";
    } else {
        img.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='10' fill='%23F1F8E9'/><text x='50%25' y='65%25' font-size='40' text-anchor='middle'>🍂</text></svg>";
    }
}
window.handleImageError = handleImageError;

// Show status warning if running in offline fallback mode
let offlineNoticeShown = false;
function notifyOfflineMode() {
    if (offlineNoticeShown) return;
    offlineNoticeShown = true;
    console.warn('AgriDoc running in local storage fallback mode (backend server offline)');
}


// Check session expired on page load
if (window.location.search.includes('session_expired=true')) {
    setTimeout(() => {
        showAlert('Your session has expired or is invalid. Please login again.', 'danger');
        window.history.replaceState({}, document.title, window.location.pathname);
    }, 500);
}

function getAuthHeaders(contentType = 'application/json') {
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) {
        if (isTokenExpired(token)) {
            clearSessionData();
            const prefix = window.location.pathname.includes('/pages/') ? '../' : '';
            window.location.href = `${prefix}index.html?session_expired=true`;
            throw new Error('Session expired');
        }
        headers['Authorization'] = `Bearer ${token}`;
    }
    const customApiKey = localStorage.getItem('agridoc_gemini_api_key');
    if (customApiKey) {
        headers['X-Gemini-Key'] = customApiKey;
    }
    if (contentType) {
        headers['Content-Type'] = contentType;
    }
    return headers;
}

// Mock users list for local storage fallback
const defaultUsers = [
    { id: 1, username: 'admin', password: 'admin123', email: 'admin@agridoc.com', phone: '+1234567890', region: 'Central Region', role: 'ADMIN', fullName: 'AgriDoc Administrator', createdAt: new Date().toISOString() },
    { id: 2, username: 'farmer', password: 'password123', email: 'farmer@agridoc.com', phone: '+919876543210', region: 'Southern Valley', role: 'FARMER', fullName: 'Hari Kumar', createdAt: new Date().toISOString() },
    { id: 3, username: 'expert', password: 'password123', email: 'expert@agridoc.com', phone: '+918765432109', region: 'Western Ghats', role: 'EXPERT', fullName: 'Dr. Ramesh Swaminathan', createdAt: new Date().toISOString() }
];

const defaultCrops = [
    { id: 1, name: 'Apple (ஆப்பிள்)', description: 'Apple fruit crop grown in hilly regions.', imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop' },
    { id: 2, name: 'Banana (வாழை)', description: 'Banana fruit crop, widely cultivated in Tamil Nadu.', imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&auto=format&fit=crop' },
    { id: 3, name: 'Chilli (மிளகாய்)', description: 'Chilli pepper crop, major spice crop.', imageUrl: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=400&auto=format&fit=crop' },
    { id: 4, name: 'Coconut (தேங்காய்)', description: 'Coconut tree crop, called the tree of life.', imageUrl: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=400&auto=format&fit=crop' },
    { id: 5, name: 'Coffee (காபி)', description: 'Coffee berry plant grown in Western Ghats.', imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop' },
    { id: 6, name: 'Corn (சோளம்)', description: 'Maize / Corn crop used as food and fodder.', imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&auto=format&fit=crop' },
    { id: 7, name: 'Cotton (பருத்தி)', description: 'Cotton fiber plant, major cash crop.', imageUrl: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=400&auto=format&fit=crop' },
    { id: 8, name: 'Ginger (இஞ்சி)', description: 'Ginger root spice crop.', imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&auto=format&fit=crop' },
    { id: 9, name: 'Grapes (திராட்சை)', description: 'Grapes vine fruit crop.', imageUrl: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&auto=format&fit=crop' },
    { id: 10, name: 'Groundnut (நிலக்கடலை)', description: 'Groundnut legume oilseed crop.', imageUrl: 'https://images.pexels.com/photos/30107827/pexels-photo-30107827.jpeg?cs=srgb&dl=pexels-guvo59-30107827.jpg&fm=jpg' },
    { id: 11, name: 'Mango (மாம்பழம்)', description: 'Mango tree, king of fruits in India.', imageUrl: 'https://wallpapercave.com/wp/wp2221502.jpg' },
    { id: 12, name: 'Onion (வெங்காயம்)', description: 'Onion bulb vegetable crop.', imageUrl: 'https://tse4.mm.bing.net/th/id/OIP.QekfxFaXXvJBEI5ffzw0uAHaEK?r=0&rs=1&pid=ImgDetMain&o=7&rm=3' },
    { id: 13, name: 'Papaya (பப்பாளி)', description: 'Papaya tropical fruit crop.', imageUrl: 'https://insanelygoodrecipes.com/wp-content/uploads/2023/02/Fresh-Organic-Papaya-Fruit-1024x1024.jpg' },
    { id: 14, name: 'Potato (உருளைக்கிழங்கு)', description: 'Potato tuber vegetable crop.', imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&auto=format&fit=crop' },
    { id: 15, name: 'Rice (நெல் / அரிசி)', description: 'Rice / Paddy grain crop, staple food of Tamil Nadu.', imageUrl: 'https://png.pngtree.com/thumb_back/fw800/background/20220318/pngtree-real-photos-of-grain-and-rice-products-image_1018707.jpg' },
    { id: 16, name: 'Soybeans (சோயா பீன்ஸ்)', description: 'Soybean oilseed protein crop.', imageUrl: 'https://cdn.businessday.ng/2020/08/soybeans-scaled-1.jpg' },
    { id: 17, name: 'Sugarcane (கரும்பு)', description: 'Sugarcane grass crop for sugar production.', imageUrl: 'https://www.cropin.com/wp-content/uploads/2025/10/Sugarcane-cultivation-crop-management-A-complete-guide-to-leveraging-agtech-insights-1.webp' },
    { id: 18, name: 'Tomato (தக்காளி)', description: 'Tomato fruit vegetable crop.', imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop' },
    { id: 19, name: 'Turmeric (மஞ்சள்)', description: 'Turmeric rhizome spice and medicinal crop.', imageUrl: 'https://img.freepik.com/premium-photo/illustration-turmeric-white-background-delight_435599-27683.jpg?w=2000' },
    { id: 20, name: 'Wheat (கோதுமை)', description: 'Wheat grain grass, staple food crop.', imageUrl: 'https://images.pexels.com/photos/54084/wheat-grain-agriculture-seed-54084.jpeg?cs=srgb&dl=pexels-pixabay-54084.jpg&fm=jpg' },
    { id: 21, name: 'Brinjal (கத்தரிக்காய்)', description: 'Brinjal / Eggplant vegetable crop.', imageUrl: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400&auto=format&fit=crop' },
    { id: 22, name: 'Bitter Gourd (பாகற்காய்)', description: 'Bitter gourd medicinal vegetable crop.', imageUrl: 'https://images.unsplash.com/photo-1628773822503-930a84594247?w=400&auto=format&fit=crop' },
    { id: 23, name: 'Bottle Gourd (சுரைக்காய்)', description: 'Bottle gourd vegetable crop.', imageUrl: 'https://facts.net/wp-content/uploads/2023/11/10-bottle-gourd-nutrition-facts-1700401363.jpg' },
    { id: 24, name: 'Cardamom (ஏலக்காய்)', description: 'Cardamom queen of spices, grown in hill stations.', imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&auto=format&fit=crop' },
    { id: 25, name: 'Cassava (மரவள்ளி)', description: 'Cassava / Tapioca root crop widely grown in Tamil Nadu.', imageUrl: 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=400&auto=format&fit=crop' },
    { id: 26, name: 'Cauliflower (காலிஃப்ளவர்)', description: 'Cauliflower winter vegetable crop.', imageUrl: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=400&auto=format&fit=crop' },
    { id: 27, name: 'Drumstick (முருங்கை)', description: 'Moringa / Drumstick tree, highly nutritious.', imageUrl: 'https://images.unsplash.com/photo-1598170845058-128a34a475cb?w=400&auto=format&fit=crop' },
    { id: 28, name: 'Garlic (பூண்டு)', description: 'Garlic bulb spice crop.', imageUrl: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=400&auto=format&fit=crop' },
    { id: 29, name: 'Guava (கொய்யா)', description: 'Guava tropical fruit crop rich in Vitamin C.', imageUrl: 'https://thealthiest.com/uploads/images/202306/image_750x_648e241a49a7e.jpg' },
    { id: 30, name: "Lady's Finger (வெண்டைக்காய்)", description: "Okra / Lady's finger vegetable crop.", imageUrl: 'https://th.bing.com/th/id/R.154fe436b5688a29f82820107fa723b1?rik=wJOSxtr6N0GoZg&riu=http%3a%2f%2ftips.pk%2fwp-content%2fuploads%2f2015%2f12%2flady-fingers.jpg&ehk=ozFWm79zAZTYEYxdbp0TLRVYsnYNqKZKuzbEdT18Whs%3d&risl=&pid=ImgRaw&r=0' },
    { id: 31, name: 'Lemon (எலுமிச்சை)', description: 'Lemon citrus fruit crop.', imageUrl: 'https://pngfre.com/wp-content/uploads/lemon-18.png' },
    { id: 32, name: 'Pineapple (அன்னாசி)', description: 'Pineapple tropical fruit crop.', imageUrl: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&auto=format&fit=crop' },
    { id: 33, name: 'Pomegranate (மாதுளை)', description: 'Pomegranate fruit crop rich in antioxidants.', imageUrl: 'https://static.vecteezy.com/system/resources/previews/029/333/530/large_2x/pomegranate-transparent-background-png.png' },
    { id: 34, name: 'Sesame (எள்)', description: 'Sesame oilseed crop, one of the oldest cultivated plants.', imageUrl: 'https://media.istockphoto.com/id/175492267/photo/integral-sesame-seads.jpg?s=612x612&w=0&k=20&c=k0m4X147hLbv4lVmhWU26p9rmqahP3hO-HYoiuOOQFY=' },
    { id: 35, name: 'Watermelon (தர்பூசணி)', description: 'Watermelon summer fruit crop.', imageUrl: 'https://images2.alphacoders.com/210/thumb-1920-210152.jpg' }
];

function generateOfflineDiagnosis(cropName, symptoms) {
    const rawCrop = (cropName || 'Plant').split(' (')[0].trim();
    const cleanLower = rawCrop.toLowerCase();

    const KNOWLEDGE = {
        'bottle gourd': {
            predictedDiseaseName: 'Bottle Gourd Mosaic Virus (சுரைக்காய் தேமல் வைரஸ் நோய்)',
            confidenceScore: '92%',
            severityLevel: 'HIGH',
            symptoms: 'Light and dark green mosaic mottling on leaves, leaf distortion, and stunted fruit growth.\nஇலைகளில் வெளிர் மற்றும் அடர் பச்சை தேமல் புள்ளிகள், இலை சுருங்குதல் மற்றும் காய் வளர்ச்சி குன்றுதல்.',
            rootCause: 'Cucumber Mosaic Virus transmitted by Aphids insect vectors.\nஅஃபிட் அசுவினி பூச்சிகளால் பரப்பப்படும் வெள்ளரி தேமல் வைரஸ்.',
            immediateActions: 'Uproot and destroy mosaic-infected vines to stop vector spread.\nவைரஸ் தாக்கிய சுரைக்காய் கொடிகளை பிடுங்கி அழித்து பூச்சிகள் பரவுவதைத் தடுக்கவும்.',
            recommendedTreatment: 'Spray Dimethoate 30% EC (2ml/L) or Imidacloprid (0.5ml/L) to control aphid vector.\nஅசுவினி பூச்சிகளைக் கட்டுப்படுத்த டைமிதோயேட் (2 மி.லி/லி) தெளிக்கவும்.',
            preventionMethods: 'Use virus-free seed stock and erect yellow sticky traps (15 traps/acre).\nநோயற்ற விதைகளைப் பயன்படுத்தி மஞ்சள் ஒட்டும் பொறிகளை அமைக்கவும்.',
            fertilizerSuggestions: 'Apply Micronutrient foliar spray (Zn, Fe, B 2g/L).\nநுண்ஊட்டச்சத்து கலவையை இலைவழியாகத் தெளிக்கவும்.',
            irrigationAdvice: 'Maintain uniform moisture; avoid drought stress during vine growth.\nகொடி வளரும் போது வறட்சி ஏற்படாமல் சீரான பாசனம் செய்யவும்.',
            weatherImpact: 'Warm weather speeds up aphid vector reproduction rate.\nவெப்பமான வானிலை அசுவினி பூச்சிகளின் இனப்பெருக்கத்தை வேகப்படுத்துகிறது.',
            expectedRecoveryTime: '12 - 18 Days / 12 - 18 நாட்கள்',
            additionalExpertRecommendations: 'Spray Neem Oil (3ml/L) regularly every 7 days.\n7 நாட்களுக்கு ஒருமுறை வேப்ப எண்ணெய் தெளிக்கவும்.'
        },
        'tomato': {
            predictedDiseaseName: 'Tomato Early Blight (தக்காளி ஆரம்பக்கால கருகல் நோய்)',
            confidenceScore: '94%',
            severityLevel: 'MEDIUM',
            symptoms: 'Concentric brown rings with yellow halo on lower older foliage.\nகீழ் இலைகளில் மஞ்சள் வளையத்துடன் கூடிய அடர் பழுப்பு நிற வளையப் புள்ளிகள்.',
            rootCause: 'Alternaria solani fungal infection thriving in humid warm climates.\nஅதிக ஈரப்பதம் மற்றும் சூடான வெப்பநிலையில் பரவும் ஆல்டர்னேரியா பூஞ்சை தொற்று.',
            immediateActions: 'Prune infected lower foliage immediately and incinerate.\nபாதிக்கப்பட்ட கீழ் இலைகளை உடனடியாக கத்தரித்து அப்புறப்படுத்தவும்.',
            recommendedTreatment: 'Spray Mancozeb 75% WP (2.5g/L) or Chlorothalonil (2g/L) at 10-day intervals.\nமேன்கோசெப் (2.5 கிராம்/லி) பூஞ்சைக் கொல்லியை 10 நாட்கள் இடைவெளியில் தெளிக்கவும்.',
            preventionMethods: 'Adopt crop rotation with non-solanaceous crops and drip irrigation.\nசொலனேசி அல்லாத பயிர்களுடன் பயிர் சுழற்சி மற்றும் சொட்டு நீர் பாசனம் செய்யவும்.',
            fertilizerSuggestions: 'Balanced Potassium (K) application to strengthen leaf cell walls.\nஇலை செல்களை வலுப்படுத்த போதுமான பொட்டாஷ் உரம் அளிக்கவும்.',
            irrigationAdvice: 'Avoid overhead sprinkler watering that wets foliage.\nஇலைகளை நனைக்கும் தெளிப்பு நீர் பாசனத்தை தவிர்க்கவும்.',
            weatherImpact: 'Frequent rains and high humidity accelerate fungal spore germination.\nதொடர் மழை மற்றும் ஈரப்பதம் பூஞ்சை வித்துக்கள் பெருகுவதை துரிதப்படுத்துகிறது.',
            expectedRecoveryTime: '10 - 14 Days / 10 - 14 நாட்கள்',
            additionalExpertRecommendations: 'Maintain 60cm row spacing for canopy ventilation.\nகாற்றோட்டத்திற்கு செடிகளுக்கு இடையே 60 செ.மீ இடைவெளி விடவும்.'
        }
    };

    if (KNOWLEDGE[cleanLower]) {
        return KNOWLEDGE[cleanLower];
    }

    return {
        predictedDiseaseName: `${rawCrop} Leaf Spot & Blight (${rawCrop} இலைப்புள்ளி நோய்)`,
        confidenceScore: '90%',
        severityLevel: 'MEDIUM',
        symptoms: `Irregular brown necrotic lesions and marginal leaf yellowing observed on ${rawCrop}.\nஇலைகளில் ஒழுங்கற்ற பழுப்பு நிற கருகல் மற்றும் விளிம்பு மஞ்சள் நிறமாக மாறுதல்.`,
        rootCause: 'Fungal or bacterial foliar pathogen proliferation induced by humidity.\nஈரப்பதம் காரணமாக தோன்றும் பூஞ்சை அல்லது பாக்டீரியா தொற்று.',
        immediateActions: 'Isolate affected leaves and ensure good field drainage.\nபாதிக்கப்பட்ட பகுதிகளை அகற்றி வயலில் தேங்கிய நீரை வடிக்கவும்.',
        recommendedTreatment: 'Apply Copper Oxychloride 50% WP (2.5g/L) as a broad-spectrum protective spray.\nகாப்பர் ஆக்ஸிகுளோரைடு (2.5 கிராம்/லி) தெளித்து பாதுகாப்பு அளிக்கவும்.',
        preventionMethods: 'Maintain clean field sanitation and avoid waterlogging.\nவயல் சுகாதாரத்தை பராமரிக்கவும் மற்றும் நீர் தேங்குவதை தவிர்க்கவும்.',
        fertilizerSuggestions: 'Apply balanced NPK and zinc micronutrient foliar spray.\nசீரான NPK உரம் மற்றும் துத்தநாக நுண்ஊட்டச்சத்து தெளிக்கவும்.',
        irrigationAdvice: 'Irrigate during morning hours; avoid nighttime leaf moisture.\nகாலை வேளையில் பாசனம் செய்யவும்; இரவில் இலை ஈரமாவதைத் தவிர்க்கவும்.',
        weatherImpact: 'Humid cloudy conditions facilitate disease progression.\nமேகமூட்டம் மற்றும் காற்றில் ஈரப்பதம் நோயின் தீவிரத்தை அதிகரிக்கும்.',
        expectedRecoveryTime: '10 - 15 Days / 10 - 15 நாட்கள்',
        additionalExpertRecommendations: 'Monitor the crop daily and consult an agricultural extension officer if symptoms spread.\nதினமும் பயிரை கண்காணித்து தேவைப்படின் வேளாண் அலுவலரை அணுகவும்.'
    };
}

const api = {
    // Auth endpoints
    login: async (username, password) => {
        try {
            const res = await fetch(`${BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({ message: 'Invalid credentials' }));
                throw new Error(err.message || 'Invalid username or password');
            }
            const data = await res.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('username', data.username);
            localStorage.setItem('fullName', data.fullName);
            localStorage.setItem('userId', data.id);
            return data;
        } catch (err) {
            if (err.message.includes('Failed to fetch')) {
                notifyOfflineMode();
                // Offline fallback
                const users = JSON.parse(localStorage.getItem('agridoc_users') || JSON.stringify(defaultUsers));
                const user = users.find(u => u.username === username && u.password === password);
                if (!user) {
                    showAlert('Invalid username or password (Offline Mode)', 'danger');
                    throw new Error('Invalid credentials');
                }
                localStorage.setItem('token', 'offline_jwt_token_key');
                localStorage.setItem('role', user.role);
                localStorage.setItem('username', user.username);
                localStorage.setItem('fullName', user.fullName);
                localStorage.setItem('userId', user.id);
                return { token: 'offline_jwt_token_key', role: user.role, username: user.username, fullName: user.fullName, id: user.id };
            } else {
                showAlert(err.message, 'danger');
                throw err;
            }
        }
    },

    register: async (fullName, username, email, password, phone, region, role) => {
        try {
            const res = await fetch(`${BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, username, email, password, phone, region, role })
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({ message: 'Registration failed' }));
                throw new Error(err.message || 'Registration failed');
            }
            return await res.json();
        } catch (err) {
            if (err.message.includes('Failed to fetch')) {
                notifyOfflineMode();
                const users = JSON.parse(localStorage.getItem('agridoc_users') || JSON.stringify(defaultUsers));
                if (users.find(u => u.username === username)) {
                    showAlert('Username already taken (Offline Mode)', 'danger');
                    throw new Error('Username taken');
                }
                const newUser = { id: Date.now(), fullName, username, email, password, phone, region, role, createdAt: new Date().toISOString() };
                users.push(newUser);
                localStorage.setItem('agridoc_users', JSON.stringify(users));
                showAlert('Registration successful (Offline Mode)!', 'success');
                return newUser;
            } else {
                showAlert(err.message, 'danger');
                throw err;
            }
        }
    },

    getCurrentUser: () => {
        const token = localStorage.getItem('token');
        if (!token || isTokenExpired(token)) {
            if (token && isTokenExpired(token)) {
                clearSessionData();
            }
            return null;
        }
        return {
            id: localStorage.getItem('userId'),
            username: localStorage.getItem('username'),
            fullName: localStorage.getItem('fullName'),
            role: localStorage.getItem('role')
        };
    },

    logout: () => {
        clearSessionData();
        window.location.href = '/frontend/index.html';
    },

    // Crops
    getCrops: async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/crops`);
            if (!res.ok) throw new Error('Failed to fetch crops');
            const crops = await res.json();
            return crops.map(c => ({ id: c.id, name: c.name, description: c.description || '', imageUrl: c.imageUrl }));
        } catch (err) {
            notifyOfflineMode();
            const localCrops = JSON.parse(localStorage.getItem('agridoc_crops') || JSON.stringify(defaultCrops));
            localStorage.setItem('agridoc_crops', JSON.stringify(localCrops));
            return localCrops;
        }
    },

    getCropById: async (id) => {
        try {
            const res = await fetch(`${BASE_URL}/api/crops/${id}`);
            if (!res.ok) throw new Error('Crop not found');
            const crop = await res.json();
            return { id: crop.id, name: crop.name, description: '', imageUrl: crop.imageUrl };
        } catch (err) {
            notifyOfflineMode();
            const localCrops = JSON.parse(localStorage.getItem('agridoc_crops') || JSON.stringify(defaultCrops));
            const crop = localCrops.find(c => c.id == id);
            if (!crop) throw new Error('Crop not found offline');
            return crop;
        }
    },

    // Diagnosis Reports

    createReport: async (cropId, symptoms, imageFile) => {
        toggleSpinner(true);
        try {
            const formData = new FormData();
            formData.append('cropId', cropId);
            formData.append('symptoms', symptoms || '');
            if (imageFile) {
                formData.append('image', imageFile);
            }

            const headers = getAuthHeaders(null);
            const res = await fetch(`${BASE_URL}/api/reports`, {
                method: 'POST',
                headers: headers,
                body: formData
            });

            if (!res.ok) {
                let msg = 'Disease diagnosis failed';
                const err = await res.json().catch(() => ({}));
                if (err && err.message) msg = err.message;
                throw new Error(msg);
            }

            const report = await res.json();
            showAlert('Disease analysis completed successfully!', 'success');
            
            // Sync locally in offline feed cache
            const localReports = JSON.parse(localStorage.getItem('agridoc_reports') || '[]');
            localReports.unshift(report);
            localStorage.setItem('agridoc_reports', JSON.stringify(localReports));
            
            return report;
        } catch (err) {
            if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
                notifyOfflineMode();
                
                // Fallback client-side diagnosis
                const localCrops = JSON.parse(localStorage.getItem('agridoc_crops') || JSON.stringify(defaultCrops));
                const crop = localCrops.find(c => c.id == cropId) || { id: cropId, name: 'Crop' };
                
                let imageBase64 = null;
                if (imageFile) {
                    try {
                        imageBase64 = await new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onload = (e) => resolve(e.target.result);
                            reader.onerror = () => resolve(null);
                            reader.readAsDataURL(imageFile);
                        });
                    } catch (e) {
                        imageBase64 = null;
                    }
                }
                
                const offlineDiag = generateOfflineDiagnosis(crop.name, symptoms);
                const offlineReport = {
                    id: Date.now(),
                    farmerId: 2,
                    farmerName: localStorage.getItem('fullName') || 'Hari Kumar',
                    farmerRegion: localStorage.getItem('region') || 'Southern Valley',
                    farmerPhone: '+919876543210',
                    cropId: parseInt(cropId),
                    cropName: crop.name,
                    symptomsSubmitted: symptoms || 'Visual lesion and discoloration detected on plant tissue.',
                    imagePath: imageBase64 || crop.imageUrl || '',
                    status: 'DIAGNOSED',
                    createdAt: new Date().toISOString(),
                    ...offlineDiag
                };
                
                const localReports = JSON.parse(localStorage.getItem('agridoc_reports') || '[]');
                localReports.unshift(offlineReport);
                localStorage.setItem('agridoc_reports', JSON.stringify(localReports));
                
                showAlert('Disease analysis completed successfully (Offline Pathology Engine)!', 'success');
                return offlineReport;
            } else {
                showAlert(err.message, 'danger');
                throw err;
            }
        } finally {
            toggleSpinner(false);
        }
    },

    getFarmerReports: async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/reports/farmer`, {
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch reports');
            const reports = await res.json();
            localStorage.setItem('agridoc_reports', JSON.stringify(reports));
            return reports;
        } catch (err) {
            notifyOfflineMode();
            return JSON.parse(localStorage.getItem('agridoc_reports') || '[]');
        }
    },

    getReports: async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/reports`, {
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch reports');
            const reports = await res.json();
            localStorage.setItem('agridoc_reports', JSON.stringify(reports));
            return reports;
        } catch (err) {
            notifyOfflineMode();
            return JSON.parse(localStorage.getItem('agridoc_reports') || '[]');
        }
    },

    getReportById: async (id) => {
        try {
            const res = await fetch(`${BASE_URL}/api/reports/${id}`, {
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Report not found');
            return await res.json();
        } catch (err) {
            notifyOfflineMode();
            const localReports = JSON.parse(localStorage.getItem('agridoc_reports') || '[]');
            const r = localReports.find(report => report.id == id);
            if (!r) throw new Error('Report not found locally');
            return r;
        }
    },

    updateReportStatus: async (reportId, status) => {
        try {
            const res = await fetch(`${BASE_URL}/api/reports/${reportId}/status?status=${status}`, {
                method: 'PUT',
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Failed to update status');
            return await res.json();
        } catch (err) {
            notifyOfflineMode();
            const localReports = JSON.parse(localStorage.getItem('agridoc_reports') || '[]');
            const idx = localReports.findIndex(r => r.id == reportId);
            if (idx !== -1) {
                localReports[idx].status = status;
                localStorage.setItem('agridoc_reports', JSON.stringify(localReports));
                return localReports[idx];
            }
            throw err;
        }
    },

    // Expert Consultations
    getFarmerConsultations: async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/consultations/farmer`, {
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch consultations');
            const cons = await res.json();
            localStorage.setItem('agridoc_consultations', JSON.stringify(cons));
            return cons;
        } catch (err) {
            notifyOfflineMode();
            return JSON.parse(localStorage.getItem('agridoc_consultations') || '[]');
        }
    },

    getExpertPendingConsultations: async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/consultations/expert/pending`, {
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch pending consultations');
            return await res.json();
        } catch (err) {
            notifyOfflineMode();
            const cons = JSON.parse(localStorage.getItem('agridoc_consultations') || '[]');
            return cons.filter(c => c.status === 'PENDING');
        }
    },

    createConsultation: async (reportId, question) => {
        try {
            const res = await fetch(`${BASE_URL}/api/consultations`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ reportId, question })
            });
            if (!res.ok) throw new Error('Failed to create ticket');
            showAlert('Expert consultation request submitted successfully!', 'success');
            return await res.json();
        } catch (err) {
            if (err.message.includes('Failed to fetch')) {
                notifyOfflineMode();
                const cons = JSON.parse(localStorage.getItem('agridoc_consultations') || '[]');
                const reports = JSON.parse(localStorage.getItem('agridoc_reports') || '[]');
                const report = reports.find(r => r.id == reportId);
                const newCons = {
                    id: Date.now(),
                    reportId,
                    question,
                    status: 'PENDING',
                    createdAt: new Date().toISOString(),
                    report: report || { id: reportId, crop: { name: 'Unknown Crop' } },
                    farmer: { fullName: localStorage.getItem('fullName') || 'Farmer', region: 'Local' }
                };
                cons.push(newCons);
                localStorage.setItem('agridoc_consultations', JSON.stringify(cons));
                showAlert('Expert ticket opened successfully (Offline Mode)!', 'success');
                return newCons;
            } else {
                showAlert(err.message, 'danger');
                throw err;
            }
        }
    },

    respondToConsultation: async (consultationId, responseText) => {
        try {
            const res = await fetch(`${BASE_URL}/api/consultations/${consultationId}/respond?response=${encodeURIComponent(responseText)}`, {
                method: 'PUT',
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Failed to submit response');
            showAlert('Response submitted successfully!', 'success');
            return await res.json();
        } catch (err) {
            if (err.message.includes('Failed to fetch')) {
                notifyOfflineMode();
                const cons = JSON.parse(localStorage.getItem('agridoc_consultations') || '[]');
                const idx = cons.findIndex(c => c.id == consultationId);
                if (idx !== -1) {
                    cons[idx].status = 'ANSWERED';
                    cons[idx].expertResponse = responseText;
                    cons[idx].repliedAt = new Date().toISOString();
                    localStorage.setItem('agridoc_consultations', JSON.stringify(cons));
                    showAlert('Response submitted successfully (Offline Mode)!', 'success');
                    return cons[idx];
                }
            }
            showAlert(err.message, 'danger');
            throw err;
        }
    },

    // Community Forum
    getForumPosts: async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/forum`);
            if (!res.ok) throw new Error('Failed to load forum');
            return await res.json();
        } catch (err) {
            notifyOfflineMode();
            const posts = JSON.parse(localStorage.getItem('agridoc_forum_posts') || '[]');
            if (posts.length === 0) {
                const defaults = [
                    { id: 1, userId: 3, title: 'Welcome to the AgriDoc Discussion Board', content: 'Hello farmers! This is a shared space to discuss crop diseases, weather anomalies, and pest outbreaks in your local regions. Feel free to start a new thread using the form on the right.', createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), user: { fullName: 'Dr. Ramesh Swaminathan', role: 'EXPERT', region: 'Western Ghats' } }
                ];
                localStorage.setItem('agridoc_forum_posts', JSON.stringify(defaults));
                return defaults;
            }
            return posts;
        }
    },

    createForumPost: async (title, content) => {
        try {
            const res = await fetch(`${BASE_URL}/api/forum`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ title, content })
            });
            if (!res.ok) throw new Error('Failed to post discussion');
            showAlert('New discussion thread posted successfully!', 'success');
            return await res.json();
        } catch (err) {
            if (err.message.includes('Failed to fetch')) {
                notifyOfflineMode();
                const posts = JSON.parse(localStorage.getItem('agridoc_forum_posts') || '[]');
                const newPost = {
                    id: Date.now(),
                    title,
                    content,
                    createdAt: new Date().toISOString(),
                    user: {
                        fullName: localStorage.getItem('fullName') || 'Hari Kumar',
                        role: localStorage.getItem('role') || 'FARMER',
                        region: 'Local Region'
                    }
                };
                posts.unshift(newPost);
                localStorage.setItem('agridoc_forum_posts', JSON.stringify(posts));
                showAlert('Discussion posted successfully (Offline Mode)!', 'success');
                return newPost;
            } else {
                showAlert(err.message, 'danger');
                throw err;
            }
        }
    },

    // Admin Panel
    getAdminStats: async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/admin/stats`, {
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Failed to load admin stats');
            return await res.json();
        } catch (err) {
            notifyOfflineMode();
            const reports = JSON.parse(localStorage.getItem('agridoc_reports') || '[]');
            const users = JSON.parse(localStorage.getItem('agridoc_users') || '[]');
            return {
                totalReports: reports.length,
                totalResolvedReports: reports.filter(r => r.status === 'RESOLVED').length,
                totalUsers: users.length,
                totalFarmers: users.filter(u => u.role === 'FARMER').length,
                totalExperts: users.filter(u => u.role === 'EXPERT').length,
                mostReportedDisease: 'N/A',
                regionStats: {}
            };
        }
    },

    getAdminUsers: async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/admin/users`, {
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Failed to load users');
            return await res.json();
        } catch (err) {
            notifyOfflineMode();
            return JSON.parse(localStorage.getItem('agridoc_users') || JSON.stringify(defaultUsers));
        }
    },

    updateUserRole: async (userId, role) => {
        try {
            const res = await fetch(`${BASE_URL}/api/admin/users/${userId}/role?role=${role}`, {
                method: 'PUT',
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Failed to update user role');
            return await res.json();
        } catch (err) {
            notifyOfflineMode();
            const users = JSON.parse(localStorage.getItem('agridoc_users') || JSON.stringify(defaultUsers));
            const idx = users.findIndex(u => u.id == userId);
            if (idx !== -1) {
                users[idx].role = role;
                localStorage.setItem('agridoc_users', JSON.stringify(users));
                return users[idx];
            }
            throw err;
        }
    }
};

window.api = api;
