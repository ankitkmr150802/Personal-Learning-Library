import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let resources = [];
let activeFilter = 'all';
let searchQuery = '';
let sortMode = 'recent';

// Theme Logic
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');

function initTheme() {
  if (localStorage.theme === 'light' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: light)').matches)) {
    document.documentElement.classList.remove('dark');
    if (sunIcon) sunIcon.classList.remove('hidden');
    if (moonIcon) moonIcon.classList.add('hidden');
  } else {
    document.documentElement.classList.add('dark');
    if (sunIcon) sunIcon.classList.add('hidden');
    if (moonIcon) moonIcon.classList.remove('hidden');
  }
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      sunIcon.classList.remove('hidden');
      moonIcon.classList.add('hidden');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
    }
  });
}

// Auth Guard
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "./login.html";
  } else {
    const userDisplay = document.getElementById("user-display");
    if (userDisplay) userDisplay.textContent = user.email;
    initTheme();
    loadResources();
  }
});

const signoutBtn = document.getElementById("signout-btn");
if (signoutBtn) {
  signoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "./login.html";
  });
}

// Modal Handlers
const addModal = document.getElementById("add-modal");
const openAddBtn = document.getElementById("open-add-btn");
const openAddMobile = document.getElementById("open-add-mobile");
const closeAddModal = document.getElementById("close-add-modal");
const cancelAddModal = document.getElementById("cancel-add-modal");
const modalErrorBox = document.getElementById("modal-error-box");

if (openAddBtn) openAddBtn.addEventListener("click", () => { if(modalErrorBox) modalErrorBox.classList.add("hidden"); addModal.classList.remove("hidden"); });
if (openAddMobile) openAddMobile.addEventListener("click", () => { if(modalErrorBox) modalErrorBox.classList.add("hidden"); addModal.classList.remove("hidden"); });
if (closeAddModal) closeAddModal.addEventListener("click", () => addModal.classList.add("hidden"));
if (cancelAddModal) cancelAddModal.addEventListener("click", () => addModal.classList.add("hidden"));

// Add Resource
const addForm = document.getElementById("add-resource-form");
if (addForm) {
  addForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (modalErrorBox) modalErrorBox.classList.add("hidden");

    const url = document.getElementById("add-url").value.trim();
    const title = document.getElementById("add-title").value.trim();
    const type = document.getElementById("add-type").value;
    const topic = document.getElementById("add-topic").value.trim() || "General";
    const tagsRaw = document.getElementById("add-tags") ? document.getElementById("add-tags").value : "";
    const description = document.getElementById("add-description") ? document.getElementById("add-description").value.trim() : "";
    const saveBtn = document.getElementById("save-resource-btn");

    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : [];

    const duplicate = resources.some(r => r.url.toLowerCase() === url.toLowerCase());
    if (duplicate) {
      if (!confirm("A resource with this exact URL already exists in your shared library. Save anyway?")) {
        return;
      }
    }

    saveBtn.textContent = "Saving to Database...";
    saveBtn.disabled = true;

    try {
      if (!auth.currentUser) throw new Error("User session expired.");

      await addDoc(collection(db, "resources"), {
        url,
        title,
        type,
        topic,
        tags,
        description,
        watched: false,
        watchlist: false,
        createdAt: serverTimestamp(),
        addedBy: auth.currentUser.email
      });

      addModal.classList.add("hidden");
      addForm.reset();
      showToast("Resource saved to shared library");
      await loadResources();

    } catch (err) {
      console.error("Database save failed:", err);
      if (modalErrorBox) {
        modalErrorBox.textContent = "Failed to save: " + err.message;
        modalErrorBox.classList.remove("hidden");
      }
    } finally {
      saveBtn.textContent = "Save Resource";
      saveBtn.disabled = false;
    }
  });
}

// Search and Tabs
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');

if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderLibrary();
  });
}

if (sortSelect) {
  sortSelect.addEventListener('change', (e) => {
    sortMode = e.target.value;
    renderLibrary();
  });
}

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    activeFilter = e.currentTarget.getAttribute('data-filter');
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.className = 'tab-btn px-3 py-1.5 text-xs font-semibold rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white';
    });
    e.currentTarget.className = 'tab-btn px-3 py-1.5 text-xs font-semibold rounded-md bg-brand-600 text-white';
    renderLibrary();
  });
});

async function loadResources() {
  const grid = document.getElementById("resource-grid");
  if (!grid) return;

  try {
    const q = query(collection(db, "resources"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    resources = [];
    snap.forEach((docSnap) => {
      resources.push({ id: docSnap.id, ...docSnap.data() });
    });
    renderLibrary();
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

function renderLibrary() {
  const grid = document.getElementById("resource-grid");
  const emptyState = document.getElementById("empty-state");
  if (!grid) return;

  if (document.getElementById('count-all')) document.getElementById('count-all').textContent = resources.length;
  if (document.getElementById('count-lecture')) document.getElementById('count-lecture').textContent = resources.filter(r => r.type === 'Lecture' || r.type === 'Course').length;
  if (document.getElementById('count-playlist')) document.getElementById('count-playlist').textContent = resources.filter(r => r.type === 'Playlist').length;
  if (document.getElementById('count-unwatched')) document.getElementById('count-unwatched').textContent = resources.filter(r => !r.watched).length;
  if (document.getElementById('count-watched')) document.getElementById('count-watched').textContent = resources.filter(r => r.watched).length;
  if (document.getElementById('count-watchlist')) document.getElementById('count-watchlist').textContent = resources.filter(r => r.watchlist).length;

  let filtered = resources.filter(r => {
    if (activeFilter === 'lecture' && !(r.type === 'Lecture' || r.type === 'Course')) return false;
    if (activeFilter === 'playlist' && r.type !== 'Playlist') return false;
    if (activeFilter === 'unwatched' && r.watched) return false;
    if (activeFilter === 'watched' && !r.watched) return false;
    if (activeFilter === 'watchlist' && !r.watchlist) return false;

    if (searchQuery) {
      const tMatch = r.title.toLowerCase().includes(searchQuery);
      const topMatch = r.topic.toLowerCase().includes(searchQuery);
      const dMatch = (r.description || '').toLowerCase().includes(searchQuery);
      const tagMatch = (r.tags || []).some(t => t.includes(searchQuery));
      return tMatch || topMatch || dMatch || tagMatch;
    }
    return true;
  });

  filtered.sort((a, b) => {
    // Priority sorting: Watchlist (Starred) items first
    if (a.watchlist !== b.watchlist) {
      return b.watchlist ? 1 : -1;
    }
    if (sortMode === 'recent') return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
    if (sortMode === 'oldest') return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
    if (sortMode === 'alpha') return a.title.localeCompare(b.title);
    if (sortMode === 'watched') return (b.watched ? 1 : 0) - (a.watched ? 1 : 0);
    return 0;
  });

  grid.innerHTML = '';
  if (filtered.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
  } else {
    if (emptyState) emptyState.classList.add('hidden');
    filtered.forEach(item => {
      grid.appendChild(createCard(item));
    });
  }
}

function getYouTubeThumbnail(urlStr) {
  const match = urlStr.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}

function createCard(item) {
  const card = document.createElement('div');
  card.className = "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between";

  const ytThumb = getYouTubeThumbnail(item.url);
  const initial = (item.topic || 'L')[0].toUpperCase();

  let thumbMarkup = ytThumb ? `
    <div class="relative w-full h-36 bg-slate-800 overflow-hidden">
      <img src="${ytThumb}" alt="${item.title}" class="w-full h-full object-cover">
      <span class="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded bg-slate-900/80 text-white border border-slate-700/50">${item.type}</span>
    </div>
  ` : `
    <div class="w-full h-24 bg-slate-800 p-4 flex items-center justify-between border-b border-slate-800">
      <div class="w-8 h-8 rounded-lg bg-brand-600 text-white font-bold flex items-center justify-center text-xs">${initial}</div>
      <span class="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-700 text-slate-300">${item.type}</span>
    </div>
  `;

  const tags = (item.tags || []).map(t => `<span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">#${t}</span>`).join(' ');

  card.innerHTML = `
    <div>
      ${thumbMarkup}
      <div class="p-4 space-y-2">
        <div class="flex items-center justify-between text-[11px] text-slate-500">
          <span class="font-medium text-brand-500">${item.topic}</span>
          <span>${item.watched ? 'Watched' : 'Unwatched'}</span>
        </div>
        <h4 class="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">${item.title}</h4>
        ${item.description ? `<p class="text-xs text-slate-400 line-clamp-2">${item.description}</p>` : ''}
        ${tags ? `<div class="flex flex-wrap gap-1 pt-1">${tags}</div>` : ''}
      </div>
    </div>
    <div class="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/50 mt-3 flex items-center justify-between gap-2">
      <div class="flex items-center gap-1.5">
        <a href="${item.url}" target="_blank" class="px-2.5 py-1.5 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-md">Open</a>
        <button onclick="window.toggleWatch('${item.id}')" class="px-2 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">${item.watched ? 'Watched ✓' : 'Watched'}</button>
      </div>
      <div class="flex items-center gap-1.5">
        <button onclick="window.toggleWatchlist('${item.id}')" title="Priority Star" class="p-1.5 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 ${item.watchlist ? 'text-amber-500 bg-amber-500/10' : 'text-slate-400'}">★</button>
        <button onclick="navigator.clipboard.writeText('${item.url}'); window.showToast('Copied link!');" class="px-2 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Copy</button>
        <button onclick="window.deleteRes('${item.id}')" class="px-2 py-1.5 text-xs rounded-md border border-red-500/30 text-red-500 hover:bg-red-500/10">Delete</button>
      </div>
    </div>
  `;
  return card;
}

window.toggleWatch = async function(id) {
  const item = resources.find(r => r.id === id);
  if (!item) return;
  item.watched = !item.watched;
  renderLibrary();
  try { await updateDoc(doc(db, "resources", id), { watched: item.watched }); } catch (e) { console.error(e); }
};

window.toggleWatchlist = async function(id) {
  const item = resources.find(r => r.id === id);
  if (!item) return;
  item.watchlist = !item.watchlist;
  renderLibrary();
  try { await updateDoc(doc(db, "resources", id), { watchlist: item.watchlist }); } catch (e) { console.error(e); }
};

window.deleteRes = async function(id) {
  if (!confirm("Delete this resource from your shared library?")) return;
  try { 
    await deleteDoc(doc(db, "resources", id)); 
    await loadResources();
    showToast("Resource deleted");
  } catch (e) { alert("Delete failed: " + e.message); }
};

window.showToast = function(msg) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  if (!toast || !toastMsg) return;
  toastMsg.textContent = msg;
  toast.classList.remove('translate-y-[-100%]', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');
  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-[-100%]', 'opacity-0');
  }, 2000);
};