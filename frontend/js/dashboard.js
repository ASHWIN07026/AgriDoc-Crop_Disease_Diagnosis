// Farmer Dashboard Handler

// One-time crop cache refresh
localStorage.removeItem('agridoc_crops');

document.addEventListener('DOMContentLoaded', async () => {
    // Ensure we are logged in as FARMER or ADMIN
    const user = api.getCurrentUser();
    if (!user) return; // auth.js will handle redirect

    try {
        // Parallel fetch for speed
        const [crops, reports, consultations] = await Promise.all([
            api.getCrops(),
            api.getFarmerReports(),
            api.getFarmerConsultations()
        ]);

        // Render dashboard statistics
        renderStats(reports, consultations);
        
        // Render crop selection grid
        renderCrops(crops);
        
        // Render recent report history (max 4)
        renderRecentReports(reports);

        // Render consultations list
        renderConsultations(consultations);

    } catch (error) {
        console.error('Failed to load dashboard data:', error);
    }
});

function renderStats(reports, consultations) {
    const totalReportsCount = reports.length;
    const resolvedCount = reports.filter(r => r.status === 'RESOLVED').length;
    const pendingConsultationsCount = consultations.filter(c => c.status === 'PENDING').length;

    const repCountEl = document.getElementById('stats-total-reports');
    const resCountEl = document.getElementById('stats-resolved-cases');
    const pendCountEl = document.getElementById('stats-pending-consultations');

    if (repCountEl) repCountEl.textContent = totalReportsCount;
    if (resCountEl) resCountEl.textContent = resolvedCount;
    if (pendCountEl) pendCountEl.textContent = pendingConsultationsCount;
}

let allCropsData = [];

function renderCrops(crops) {
    allCropsData = crops;
    const cropContainer = document.getElementById('crop-selection-grid');
    if (!cropContainer) return;

    renderCropGrid(crops);

    // Wire up search
    const searchInput = document.getElementById('crop-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim().toLowerCase();
            if (!query) {
                renderCropGrid(allCropsData);
            } else {
                renderCropGrid(allCropsData.filter(c => c.name.toLowerCase().includes(query)));
            }
        });
    }
}

// Curated high-resolution images for all 35 crops
const DIRECT_CROP_IMAGES = {
    'apple': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop',
    'banana': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&auto=format&fit=crop',
    'chilli': 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=400&auto=format&fit=crop',
    'coconut': 'https://static.independent.co.uk/2022/09/02/09/11181047-27ecb272-8177-4b3a-bb72-2f12a0a11a3a.jpg',
    'coffee': 'https://images.pexels.com/photos/1695052/pexels-photo-1695052.jpeg?cs=srgb&dl=pexels-igor-haritanovich-1695052.jpg&fm=jpg',
    'corn': 'https://rare-gallery.com/uploads/posts/576903-corn.jpg',
    'cotton': 'https://images.ctfassets.net/3s5io6mnxfqz/4TV7YTCO1DJuMhhn7RD1Ol/b5a6c12340e6529a86bc1b557ed2d8f8/AdobeStock_136921602.jpeg',
    'ginger': 'https://static.vecteezy.com/system/resources/thumbnails/026/656/343/small_2x/ai-generated-ai-generative-ginger-root-vegetable-organic-eco-food-nutrition-culinary-spicy-healthy-fresh-herb-graphic-art-photo.jpg',
    'grapes': 'https://images.pexels.com/photos/45209/purple-grapes-vineyard-napa-valley-napa-vineyard-45209.jpeg?cs=srgb&dl=pexels-pixabay-45209.jpg&fm=jpg',
    'groundnut': 'https://images.pexels.com/photos/30107827/pexels-photo-30107827.jpeg?cs=srgb&dl=pexels-guvo59-30107827.jpg&fm=jpg',
    'mango': 'https://wallpapercave.com/wp/wp2221502.jpg',
    'onion': 'https://tse4.mm.bing.net/th/id/OIP.QekfxFaXXvJBEI5ffzw0uAHaEK?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
    'papaya': 'https://insanelygoodrecipes.com/wp-content/uploads/2023/02/Fresh-Organic-Papaya-Fruit-1024x1024.jpg',
    'potato': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&auto=format&fit=crop',
    'rice': 'https://png.pngtree.com/thumb_back/fw800/background/20220318/pngtree-real-photos-of-grain-and-rice-products-image_1018707.jpg',
    'soybeans': 'https://cdn.businessday.ng/2020/08/soybeans-scaled-1.jpg',
    'sugarcane': 'https://www.cropin.com/wp-content/uploads/2025/10/Sugarcane-cultivation-crop-management-A-complete-guide-to-leveraging-agtech-insights-1.webp',
    'tomato': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop',
    'turmeric': 'https://img.freepik.com/premium-photo/illustration-turmeric-white-background-delight_435599-27683.jpg?w=2000',
    'wheat': 'https://images.pexels.com/photos/54084/wheat-grain-agriculture-seed-54084.jpeg?cs=srgb&dl=pexels-pixabay-54084.jpg&fm=jpg',
    'brinjal': 'https://tiimg.tistatic.com/fp/1/007/587/100-percent-natural-fresh-healthy-purple-brinjal-rich-in-many-nutrients-236.jpg',
    'bitter gourd': 'https://th.bing.com/th/id/R.7b9801acf6830bd088957631175f36ed?rik=sgfxV17oNDRAXA&riu=http%3a%2f%2fnaturebring.com%2fwp-content%2fuploads%2f2017%2f02%2fBitter-Gourd-nb-02-1024x768.jpg&ehk=ml%2fySGvYUH7FU9zOAXSzYgS3rJ%2f3%2flcqL6hivXHudk0%3d&risl=&pid=ImgRaw&r=0',
    'bottle gourd': 'https://facts.net/wp-content/uploads/2023/11/10-bottle-gourd-nutrition-facts-1700401363.jpg',
    'cardamom': 'https://www.allrecipes.com/thmb/k9Lz3cPTurD2mL5gliy7hF54SBY=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-1134929438-2000-6ed05c6782a74f82b7229fc0de6254ec.jpg',
    'cassava': 'https://images.pexels.com/photos/7543155/pexels-photo-7543155.jpeg?cs=srgb&dl=pexels-daniel-dan-47825192-7543155.jpg&fm=jpg',
    'cauliflower': 'https://www.thespruce.com/thmb/3xv-bplva31jK5D9fYL0_5c9UB0=/4696x0/filters:no_upscale():max_bytes(150000):strip_icc()/how-to-grow-cauliflower-1403494-hero-76cf5f524a564adabb1ac6adfa311482.jpg',
    'drumstick': 'https://5.imimg.com/data5/SELLER/Default/2023/12/369136084/LG/RH/CL/182645017/organic-green-drumsticks-1000x1000.jpg',
    'garlic': 'https://images.pexels.com/photos/19127227/pexels-photo-19127227/free-photo-of-close-up-of-garlic.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'guava': 'https://thealthiest.com/uploads/images/202306/image_750x_648e241a49a7e.jpg',
    "lady's finger": 'https://th.bing.com/th/id/R.154fe436b5688a29f82820107fa723b1?rik=wJOSxtr6N0GoZg&riu=http%3a%2f%2ftips.pk%2fwp-content%2fuploads%2f2015%2f12%2flady-fingers.jpg&ehk=ozFWm79zAZTYEYxdbp0TLRVYsnYNqKZKuzbEdT18Whs%3d&risl=&pid=ImgRaw&r=0',
    'lemon': 'https://pngfre.com/wp-content/uploads/lemon-18.png',
    'pineapple': 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&auto=format&fit=crop',
    'pomegranate': 'https://static.vecteezy.com/system/resources/previews/029/333/530/large_2x/pomegranate-transparent-background-png.png',
    'sesame': 'https://media.istockphoto.com/id/175492267/photo/integral-sesame-seads.jpg?s=612x612&w=0&k=20&c=k0m4X147hLbv4lVmhWU26p9rmqahP3hO-HYoiuOOQFY=',
    'watermelon': 'https://images2.alphacoders.com/210/thumb-1920-210152.jpg'
};

const TAMIL_CROP_NAMES = {
    'apple': 'ஆப்பிள்',
    'banana': 'வாழை',
    'chilli': 'மிளகாய்',
    'coconut': 'தேங்காய்',
    'coffee': 'காபி',
    'corn': 'சோளம்',
    'cotton': 'பருத்தி',
    'ginger': 'இஞ்சி',
    'grapes': 'திராட்சை',
    'groundnut': 'நிலக்கடலை',
    'mango': 'மாம்பழம்',
    'onion': 'வெங்காயம்',
    'papaya': 'பப்பாளி',
    'potato': 'உருளைக்கிழங்கு',
    'rice': 'நெல் / அரிசி',
    'soybeans': 'சோயா பீன்ஸ்',
    'sugarcane': 'கரும்பு',
    'tomato': 'தக்காளி',
    'turmeric': 'மஞ்சள்',
    'wheat': 'கோதுமை',
    'brinjal': 'கத்தரிக்காய்',
    'bitter gourd': 'பாகற்காய்',
    'bottle gourd': 'சுரைக்காய்',
    'cardamom': 'ஏலக்காய்',
    'cassava': 'மரவள்ளி',
    'cauliflower': 'காலிஃப்ளவர்',
    'drumstick': 'முருங்கை',
    'garlic': 'பூண்டு',
    'guava': 'கொய்யா',
    "lady's finger": 'வெண்டைக்காய்',
    'lemon': 'எலுமிச்சை',
    'pineapple': 'அன்னாசி',
    'pomegranate': 'மாதுளை',
    'sesame': 'எள்',
    'watermelon': 'தர்பூசணி'
};

const cropImageCache = new Map();

function getCropKey(name) {
    if (!name) return 'generic';
    return name.toLowerCase().split(' (')[0].trim();
}

const FALLBACK_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60'><circle cx='30' cy='30' r='30' fill='%23E8F5E9'/><path d='M30 10 C18 10 12 22 14 34 C22 28 38 28 46 34 C48 22 42 10 30 10Z' fill='%234CAF50' opacity='0.7'/><path d='M30 10 L30 42' stroke='%232E7D32' stroke-width='1.5' stroke-linecap='round'/></svg>`;

async function fetchWikiImage(cropName) {
    const key = getCropKey(cropName);
    if (DIRECT_CROP_IMAGES[key]) {
        return DIRECT_CROP_IMAGES[key];
    }
    if (cropImageCache.has(key)) return cropImageCache.get(key);

    const wikiTitle = cropName.split(' (')[0].replace(/\s+/g, '_');
    try {
        const res = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`
        );
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        const imgUrl = data.originalimage?.source || data.thumbnail?.source || null;
        cropImageCache.set(key, imgUrl);
        return imgUrl;
    } catch {
        cropImageCache.set(key, null);
        return null;
    }
}

function applyImageToCard(cropId, url) {
    const wrapper = document.getElementById(`wrapper-${cropId}`);
    if (!wrapper || !wrapper.isConnected) return;
    const imgEl = document.getElementById(`img-${cropId}`);
    if (imgEl) {
        imgEl.src = url || FALLBACK_SVG;
        imgEl.style.opacity = '1';
        imgEl.style.display = 'block';
        wrapper.classList.remove('crop-skeleton');
    }
}

async function loadImagesSequentially(crops) {
    for (const crop of crops) {
        const key = getCropKey(crop.name);
        let url = DIRECT_CROP_IMAGES[key] || cropImageCache.get(key);
        if (!url) {
            url = await fetchWikiImage(crop.name);
        }
        applyImageToCard(crop.id, url);
    }
}

function renderCropGrid(crops) {
    const cropContainer = document.getElementById('crop-selection-grid');
    if (!cropContainer) return;

    if (!crops || crops.length === 0) {
        cropContainer.innerHTML = '<p class="hint" style="padding: 20px; text-align: center; color: #9E9E9E;">No crops found matching your search.</p>';
        return;
    }

    const sorted = [...crops].sort((a, b) => {
        const nameA = a.name.split(' (')[0].toLowerCase();
        const nameB = b.name.split(' (')[0].toLowerCase();
        return nameA.localeCompare(nameB);
    });

    cropContainer.innerHTML = sorted.map(crop => {
        const nameParts = crop.name.split(' (');
        const englishName = nameParts[0].trim();
        const key = getCropKey(crop.name);
        let tamilName = TAMIL_CROP_NAMES[key];
        if (!tamilName && nameParts[1]) {
            const extracted = nameParts[1].replace(')', '').trim();
            if (!extracted.includes('?')) {
                tamilName = extracted;
            }
        }
        if (!tamilName) tamilName = '';

        const directImg = DIRECT_CROP_IMAGES[key] || FALLBACK_SVG;

        return `
            <div class="crop-card" onclick="startDiagnosis(${crop.id})" title="${crop.description || crop.name}">
                <div class="crop-img-wrapper" id="wrapper-${crop.id}">
                    <img class="crop-real-img" id="img-${crop.id}" src="${directImg}"
                         alt="${englishName}" style="display:block; opacity:1;"
                         onerror="this.src='${FALLBACK_SVG}';">
                </div>
                <h4>${englishName}</h4>
                <div class="crop-tamil" style="color: var(--primary-green); font-weight: 600; font-size: 0.88rem; margin-top: 4px;">${tamilName}</div>
            </div>
        `;
    }).join('');

    loadImagesSequentially(sorted);
}

function startDiagnosis(cropId) {
    window.location.href = `report-disease.html?cropId=${cropId}`;
}

function renderRecentReports(reports) {
    const historyContainer = document.getElementById('recent-history-list');
    if (!historyContainer) return;

    if (!reports || reports.length === 0) {
        historyContainer.innerHTML = `
            <div style="text-align: center; padding: 30px; background: #FAFAFA; border-radius: var(--border-radius); border: 1px dashed #CFD8DC;">
                <p style="color: #757575; font-size: 0.9rem; margin-bottom: 15px;">You have not diagnosed any crops yet.</p>
                <p style="font-size: 0.85rem; font-weight: 500; color: var(--primary-green);">Select a crop below to run your first diagnosis!</p>
            </div>
        `;
        return;
    }

    const recentReports = reports.slice(0, 4);

function formatBilingualCropName(rawName) {
    if (!rawName) return '';
    const nameParts = rawName.split(' (');
    const englishName = nameParts[0].trim();
    const key = englishName.toLowerCase();
    const tamilName = TAMIL_CROP_NAMES[key];
    if (tamilName) {
        return `${englishName} (${tamilName})`;
    }
    if (nameParts[1] && !nameParts[1].includes('?')) {
        return rawName;
    }
    return englishName;
}

    historyContainer.innerHTML = recentReports.map(report => {
        const dateStr = new Date(report.createdAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        const severityLower = (report.severityLevel || 'LOW').toLowerCase();
        const severityBadgeClass = `badge-severity-${severityLower}`;

        const statusLower = report.status.toLowerCase().replace('_', '-');
        const statusBadgeClass = `badge-status-${statusLower}`;

        const fallbackSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='10' fill='%23F1F8E9'/><text x='50%25' y='65%25' font-size='40' text-anchor='middle'>🍂</text></svg>";
        const imageSrc = report.imagePath ? (report.imagePath.startsWith('data:') ? report.imagePath : `${window.location.origin}/${report.imagePath}`) : fallbackSvg;
        const displayCropName = formatBilingualCropName(report.cropName);

        return `
            <div class="history-item">
                <div class="history-main">
                    <img class="history-img" src="${imageSrc}" alt="Report Photo" onerror="handleImageError(this, 'leaf')">
                    <div class="history-details">
                        <h4>${displayCropName} - <span style="font-weight: 500;">${report.predictedDiseaseName}</span></h4>
                        <p>📅 Diagnosed on: ${dateStr}</p>
                    </div>
                </div>
                <div class="history-meta">
                    <span class="badge ${severityBadgeClass}">Severity: ${report.severityLevel || 'LOW'}</span>
                    <span class="badge ${statusBadgeClass}">${report.status.replace('_', ' ')}</span>
                    <a href="diagnosis-result.html?reportId=${report.id}" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem;">
                        View Advice 🔬
                    </a>
                </div>
            </div>
        `;
    }).join('');
}

function renderConsultations(consultations) {
    const consultationsContainer = document.getElementById('consultations-tickets-list');
    if (!consultationsContainer) return;

    if (!consultations || consultations.length === 0) {
        consultationsContainer.innerHTML = `
            <p style="color: #757575; font-size: 0.9rem; text-align: center; padding: 20px;">No expert advisory tickets opened.</p>
        `;
        return;
    }

    const recentConsultations = consultations.slice(0, 3);

    consultationsContainer.innerHTML = recentConsultations.map(ticket => {
        const ticketDate = new Date(ticket.createdAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });

        const statusClass = ticket.status === 'PENDING' ? 'badge-status-pending' : 'badge-status-resolved';
        
        let responseMarkup = '';
        if (ticket.status === 'ANSWERED' && ticket.expertResponse) {
            const replyDate = new Date(ticket.repliedAt).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
            });
            responseMarkup = `
                <div class="ticket-response">
                    <div class="expert-tag">🩺 Expert Answer (Replied on ${replyDate}):</div>
                    <p style="margin: 0; color: #37474F;">${ticket.expertResponse}</p>
                </div>
            `;
        } else {
            responseMarkup = `
                <div style="font-size: 0.82rem; color: #78909C; font-style: italic; margin-top: 10px; display: flex; align-items: center; gap: 6px;">
                    ⏳ Awaiting expert analysis...
                </div>
            `;
        }

        const displayCropName = formatBilingualCropName(ticket.report.crop ? ticket.report.crop.name : '');

        return `
            <div class="ticket-card">
                <div class="ticket-header">
                    <h4>Report ID: #${ticket.report.id} - ${displayCropName}</h4>
                    <div>
                        <span class="badge ${statusClass}">${ticket.status}</span>
                        <span style="font-size: 0.75rem; color: #9E9E9E; margin-left: 8px;">${ticketDate}</span>
                    </div>
                </div>
                <div class="ticket-body">
                    <strong style="color: var(--bg-dark);">Question:</strong> "${ticket.question}"
                </div>
                ${responseMarkup}
            </div>
        `;
    }).join('');
}
