// Smooth scrolling for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// Fade-in on scroll
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.about-card').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `opacity 0.6s ease-out ${i * 0.12}s, transform 0.6s ease-out ${i * 0.12}s`;
    fadeObserver.observe(el);
});

const panelObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0) scale(1)';
        }
    });
}, { threshold: 0.2 });

document.querySelectorAll('.glass-panel:not(.modal-panel)').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px) scale(0.98)';
    el.style.transition = 'opacity 0.7s ease-out, transform 0.7s ease-out';
    panelObserver.observe(el);
});

// Cursor glow follow (desktop only)
const cursorGlow = document.getElementById('cursorGlow');
if (window.matchMedia('(pointer: fine)').matches && cursorGlow) {
    document.addEventListener('mousemove', (e) => {
        cursorGlow.style.opacity = '1';
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
    });
    document.addEventListener('mouseleave', () => {
        cursorGlow.style.opacity = '0';
    });
}

// Subtle parallax on hero spheres
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    document.querySelectorAll('.gradient-sphere').forEach((el, i) => {
        const speed = 0.1 + i * 0.04;
        el.style.marginTop = `${scrolled * speed * 0.15}px`;
    });
});

console.log('%c✨ مهربان ✨', 'font-size: 22px; color: #8b5cf6; font-weight: bold;');

// ============ GitHub Config ============
// 🔑 توکن رو دقیقاً همین‌جا (رو کامپیوتر خودت، قبل از push) جایگزین کن.
// این توکن رو با هیچ‌کس (حتی هوش مصنوعی) به اشتراک نذار، فقط خودت رو فایل بذارش.
const GITHUB_TOKEN = "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";
const GITHUB_OWNER = "bypass-codee";   // یوزرنیم گیت‌هابت
const GITHUB_REPO = "mehraban";        // اسم دقیق ریپو
const GITHUB_BRANCH = "main";          // اگه ریپوت "master" هست، اینو عوض کن
const DATA_FILE_PATH = "data/portfolio.json";
const UPLOAD_FOLDER = "uploads";

// رمزی که برای «دیدن» و «آپلود» نمونه‌کارها لازمه
const PORTFOLIO_PASSWORD = "mehraban1405";

// ============ GitHub Helpers ============
async function githubRequest(path, options = {}) {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
    return fetch(url, {
        ...options,
        headers: {
            "Authorization": `Bearer ${GITHUB_TOKEN}`,
            "Accept": "application/vnd.github+json",
            ...(options.headers || {})
        }
    });
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function textToBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

function base64ToText(b64) {
    return decodeURIComponent(escape(atob(b64)));
}

async function getPortfolioData() {
    try {
        const res = await githubRequest(`${DATA_FILE_PATH}?ref=${GITHUB_BRANCH}`);
        if (res.status === 200) {
            const data = await res.json();
            return { items: JSON.parse(base64ToText(data.content)), sha: data.sha };
        }
    } catch (e) { /* فایل هنوز وجود نداره، مشکلی نیست */ }
    return { items: [], sha: null };
}

async function commitFile(path, base64Content, message, sha = null) {
    const body = { message, content: base64Content, branch: GITHUB_BRANCH };
    if (sha) body.sha = sha;

    const res = await githubRequest(path, { method: "PUT", body: JSON.stringify(body) });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `خطا در ارتباط با گیت‌هاب (${res.status})`);
    }
    return res.json();
}

async function uploadPortfolioItem({ title, type, file, textContent }) {
    let src = null;

    if (file) {
        const base64 = await fileToBase64(file);
        const safeName = Date.now() + "-" + file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const filePath = `${UPLOAD_FOLDER}/${safeName}`;
        await commitFile(filePath, base64, `آپلود: ${title}`);
        src = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${filePath}`;
    }

    const { items, sha } = await getPortfolioData();
    items.unshift({
        type,
        title,
        src,
        content: TEXT_TYPES.includes(type) ? textContent : undefined,
        date: new Date().toISOString()
    });

    await commitFile(DATA_FILE_PATH, textToBase64(JSON.stringify(items, null, 2)), `بروزرسانی نمونه‌کارها: ${title}`, sha);
    return items;
}

async function loadPortfolioItems() {
    try {
        const res = await fetch(
            `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${DATA_FILE_PATH}?t=${Date.now()}`
        );
        if (res.ok) return await res.json();
    } catch (e) { /* هنوز چیزی آپلود نشده */ }
    return [];
}

// ============ Type metadata ============
const TYPE_META = {
    story:     { icon: '📖', label: 'داستان' },
    novel:     { icon: '📚', label: 'رمان' },
    book:      { icon: '📕', label: 'کتاب' },
    audiobook: { icon: '🎧', label: 'کتاب صوتی' },
    text:      { icon: '✍️', label: 'نوشته' },
    video:     { icon: '🎬', label: 'ویدیو' },
    audio:     { icon: '🎙️', label: 'صدا' },
    pdf:       { icon: '📄', label: 'PDF' }
};
const TEXT_TYPES = ['text', 'story', 'novel'];

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str ?? '';
    return div.innerHTML;
}

function itemMediaHtml(item) {
    if (item.type === 'video') {
        return `<video controls src="${item.src}"></video>`;
    }
    if (item.type === 'audio' || item.type === 'audiobook') {
        return `<audio controls src="${item.src}"></audio>`;
    }
    if (item.type === 'pdf' || item.type === 'book') {
        const label = item.type === 'book' ? '📕 مشاهده / دانلود کتاب' : '📄 مشاهده PDF';
        return `<a class="pdf-link" href="${item.src}" target="_blank">${label}</a>`;
    }
    if (TEXT_TYPES.includes(item.type)) {
        return `<p class="item-text">${escapeHtml(item.content)}</p>`;
    }
    return '';
}

function renderItemCard(item) {
    const meta = TYPE_META[item.type] || { icon: '✨', label: '' };
    return `
        <div class="portfolio-item" data-type="${item.type}">
            <div class="item-media">${itemMediaHtml(item)}</div>
            <div class="item-meta">
                <span class="item-badge">${meta.icon} ${meta.label}</span>
                <h4 class="item-title">${escapeHtml(item.title)}</h4>
            </div>
        </div>`;
}

// ============ Rendering ============
let allPortfolioItems = [];
let activeFilter = 'all';

function renderGallery() {
    const gallery = document.getElementById('portfolioGallery');
    if (!gallery) return;

    const items = activeFilter === 'all'
        ? allPortfolioItems
        : allPortfolioItems.filter(i => i.type === activeFilter);

    if (items.length === 0) {
        gallery.innerHTML = '<div class="portfolio-empty">هنوز چیزی تو این بخش اضافه نشده — به‌زودی! ✨</div>';
        return;
    }

    gallery.innerHTML = items.map(renderItemCard).join('');
}

async function renderPortfolio() {
    const gallery = document.getElementById('portfolioGallery');
    if (!gallery) return;

    gallery.innerHTML = '<div class="portfolio-empty">در حال بارگذاری... ⏳</div>';
    allPortfolioItems = await loadPortfolioItems();
    renderGallery();
}

// Filter tab clicks
document.querySelectorAll('.filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.filter;
        renderGallery();
    });
});

// Anyone can see the gallery — load it immediately, no password needed.
renderPortfolio();

// ============ Admin Login Modal ============
const lockFab = document.getElementById('lockFab');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const unlockBtn = document.getElementById('unlockBtn');
const passwordInput = document.getElementById('portfolioPassword');
const uploadPanel = document.getElementById('uploadPanel');
const lockError = document.getElementById('lockError');

function openModal() {
    modalOverlay.classList.add('show');
    passwordInput.value = '';
    lockError.classList.remove('show');
    setTimeout(() => passwordInput.focus(), 100);
}

function closeModal() {
    modalOverlay.classList.remove('show');
}

function revealUploadPanel() {
    uploadPanel.classList.add('show');
}

function unlockAdmin() {
    closeModal();
    revealUploadPanel();
    sessionStorage.setItem('portfolioUnlocked', 'true');
    uploadPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function tryUnlock() {
    if (passwordInput.value === PORTFOLIO_PASSWORD) {
        unlockAdmin();
    } else {
        lockError.classList.add('show');
        setTimeout(() => lockError.classList.remove('show'), 2000);
    }
}

if (lockFab) {
    lockFab.addEventListener('click', openModal);
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });
    unlockBtn.addEventListener('click', tryUnlock);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') tryUnlock();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // Stay unlocked for the rest of this browser tab session
    if (sessionStorage.getItem('portfolioUnlocked') === 'true') {
        revealUploadPanel();
    }
}

// ============ Upload Form ============
const uploadForm = document.getElementById('uploadForm');
const itemType = document.getElementById('itemType');
const fileRow = document.getElementById('fileRow');
const textRow = document.getElementById('textRow');
const uploadStatus = document.getElementById('uploadStatus');
const uploadSubmitBtn = document.getElementById('uploadSubmitBtn');
const uploadBtnText = document.getElementById('uploadBtnText');

if (itemType) {
    const syncFormRows = () => {
        const isText = TEXT_TYPES.includes(itemType.value);
        fileRow.style.display = isText ? 'none' : 'block';
        textRow.style.display = isText ? 'block' : 'none';
    };
    itemType.addEventListener('change', syncFormRows);
    syncFormRows(); // set correct rows for the default-selected option on load
}

if (uploadForm) {
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (GITHUB_TOKEN === "PASTE_YOUR_FINE_GRAINED_TOKEN_HERE") {
            uploadStatus.textContent = "⚠️ اول باید توکن گیت‌هاب رو تو script.js جایگزین کنی.";
            uploadStatus.className = 'upload-status error';
            return;
        }

        const title = document.getElementById('itemTitle').value.trim();
        const type = itemType.value;
        const file = document.getElementById('itemFile').files[0];
        const textContent = document.getElementById('itemText').value.trim();

        const isTextType = TEXT_TYPES.includes(type);
        if (!isTextType && !file) {
            uploadStatus.textContent = "یه فایل انتخاب کن 📎";
            uploadStatus.className = 'upload-status error';
            return;
        }
        if (isTextType && !textContent) {
            uploadStatus.textContent = "متنو بنویس ✍️";
            uploadStatus.className = 'upload-status error';
            return;
        }

        uploadSubmitBtn.disabled = true;
        uploadBtnText.textContent = "در حال آپلود... ⏳";
        uploadStatus.textContent = "";
        uploadStatus.className = 'upload-status';

        try {
            await uploadPortfolioItem({ title, type, file, textContent });
            uploadStatus.textContent = "✅ با موفقیت اضافه شد!";
            uploadStatus.className = 'upload-status success';
            uploadForm.reset();
            fileRow.style.display = 'block';
            textRow.style.display = 'none';
            renderPortfolio();
        } catch (err) {
            uploadStatus.textContent = "❌ " + err.message;
            uploadStatus.className = 'upload-status error';
        } finally {
            uploadSubmitBtn.disabled = false;
            uploadBtnText.textContent = "آپلود کن 🚀";
        }
    });
}