/* ===================================================
   APP.JS — Core data layer + shared UI logic
   =================================================== */

const STORAGE_KEYS = {
  EVENTS: 'ems_events',
  BOOKINGS: 'ems_bookings',
  THEME: 'ems_theme',
  SEED_VER: 'ems_seed_ver'
};

const SEED_VERSION = 3;

/* ---------- SEED DATA ---------- */
const SEED_EVENTS = [
  {
    id: 'evt-1',
    name: 'Tech Future Summit 2026',
    category: 'Technology',
    date: '2026-07-15',
    time: '09:00',
    venue: 'Karachi Expo Center, Karachi',
    price: 4900,
    image: 'technology.jpg',
    description: 'Join industry leaders and innovators for a full day of keynotes, panels, and hands-on workshops covering AI, cloud computing, and the future of software development. Network with professionals from around the world and discover the latest trends shaping the tech industry.'
  },
  {
    id: 'evt-2',
    name: 'Sunset Music Festival',
    category: 'Music',
    date: '2026-08-02',
    time: '17:00',
    venue: 'Seaview Beach, Karachi',
    price: 3500,
    image: 'music.jpg',
    description: "An unforgettable evening of live performances from top regional artists across multiple genres. Enjoy food trucks, art installations, and a stunning sunset backdrop as the city's best DJs and bands take the stage."
  },
  {
    id: 'evt-3',
    name: 'Startup Pitch Night',
    category: 'Business',
    date: '2026-06-25',
    time: '18:30',
    venue: 'Innovation Hub, Lahore',
    price: 0,
    image: 'business.png',
    description: 'Watch promising startups pitch their ideas to a panel of investors and industry experts. A great opportunity for entrepreneurs, investors, and enthusiasts to connect, learn, and discover the next big thing in the startup ecosystem.'
  },
  {
    id: 'evt-4',
    name: 'Modern Art Exhibition',
    category: 'Art',
    date: '2026-07-05',
    time: '11:00',
    venue: 'National Art Gallery, Islamabad',
    price: 1500,
    image: 'modernart.jpg',
    description: 'Explore a curated collection of contemporary artworks from emerging and established artists. The exhibition features paintings, sculptures, and digital art installations exploring themes of identity, technology, and culture.'
  },
  {
    id: 'evt-5',
    name: 'Marathon for a Cause',
    category: 'Sports',
    date: '2026-09-10',
    time: '06:00',
    venue: 'Clifton Beach, Karachi',
    price: 1000,
    image: 'marathone.png',
    description: 'A 10K charity marathon bringing together runners of all levels to raise funds for local education initiatives. Includes professional timing, refreshment stations, medals for finishers, and a post-run celebration with music and food stalls.'
  },
  {
    id: 'evt-6',
    name: 'Culinary Masterclass',
    category: 'Food',
    date: '2026-07-20',
    time: '14:00',
    venue: 'Gourmet Studio, Lahore',
    price: 6000,
    image: 'food.jpg',
    description: 'Learn the secrets of fine dining from award-winning chefs in this hands-on cooking workshop. Participants will prepare a multi-course meal, learn plating techniques, and enjoy tasting their own creations alongside paired beverages.'
  },
  {
    id: 'evt-7',
    name: 'Web3 & Blockchain Conference',
    category: 'Technology',
    date: '2026-08-22',
    time: '10:00',
    venue: 'Pearl Continental, Lahore',
    price: 7500,
    image: 'technology2.jpg',
    description: 'A deep dive into blockchain technology, decentralized finance, and the future of digital ownership. Featuring talks from blockchain founders, live demos, and networking sessions with developers and investors in the Web3 space.'
  },
  {
    id: 'evt-8',
    name: 'Stand-Up Comedy Night',
    category: 'Entertainment',
    date: '2026-06-28',
    time: '20:00',
    venue: 'The Laugh Factory, Karachi',
    price: 2000,
    image: 'entertainment.jpg',
    description: "A night full of laughter featuring some of the country's funniest comedians performing their best material live. Doors open at 7:30 PM with a cash bar and snacks available throughout the show."
  },
  {
  id: 'evt-9',
  name: 'Future of Tech: AI & Robotics Seminar',
  category: 'Education',
  date: '2026-06-25',
  time: '10:00',
  venue: 'National Stadium Auditorium, Karachi',
  price: 1500,
  image: 'education.jpg',
  description: 'Join industry experts for an insightful seminar on Artificial Intelligence, machine learning, and automation. This event includes interactive workshops, live tech demonstrations, and a networking session with leading tech pioneers.'
}
];

/* ---------- STORAGE HELPERS ---------- */

/* ── MAIN FIX: Version-based seed sync ──
   Jab bhi SEED_VERSION badlega, localStorage automatically
   naye seed events se update ho jaayega. User ke custom events safe rahenge. */
function getEvents() {
  const savedVer = parseInt(localStorage.getItem(STORAGE_KEYS.SEED_VER) || '0');

  if (savedVer < SEED_VERSION) {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS)) || [];
    const userEvents = existing.filter(e => !e.id.startsWith('evt-'));
    const merged = [...SEED_EVENTS, ...userEvents];
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(merged));
    localStorage.setItem(STORAGE_KEYS.SEED_VER, String(SEED_VERSION));
    return merged;
  }

  const events = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS));
  if (!events || events.length === 0) {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(SEED_EVENTS));
    localStorage.setItem(STORAGE_KEYS.SEED_VER, String(SEED_VERSION));
    return SEED_EVENTS;
  }
  return events;
}

function saveEvents(events) {
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
}

function getEventById(id) {
  return getEvents().find(e => e.id === id);
}

function getBookings() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS)) || [];
}

function saveBookings(bookings) {
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
}

function addBooking(booking) {
  const bookings = getBookings();
  bookings.push(booking);
  saveBookings(bookings);
}

/* ---------- THEME TOGGLE ---------- */
function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(STORAGE_KEYS.THEME, next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  document.querySelectorAll('.theme-toggle i').forEach(icon => {
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  });
}

/* ---------- MOBILE NAV ---------- */
function initNav() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  if (!hamburger || !navMenu) return;

  hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
  });

  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navMenu.classList.remove('active'));
  });
}

/* ---------- TOAST ---------- */
function showToast(message, type = 'success') {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.className = `toast ${type === 'error' ? 'error' : ''}`;
  toast.innerHTML = `<i class="fas ${type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i> ${message}`;
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ---------- HELPERS ---------- */
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatPrice(price) {
  return Number(price) === 0 ? 'Free' : `Rs ${Number(price).toLocaleString('en-PK')}`;
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/* ---------- EVENT CARD RENDERING ---------- */
function eventCardHTML(event) {
  return `
    <div class="event-card" data-category="${event.category}" data-name="${event.name.toLowerCase()}">
      <div class="event-card-img">
        <img src="${event.image}" alt="${event.name}" onerror="this.src='https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80'">
        <span class="event-category">${event.category}</span>
        <span class="event-price-tag">${formatPrice(event.price)}</span>
      </div>
      <div class="event-card-body">
        <h3>${event.name}</h3>
        <div class="event-meta">
          <span><i class="fas fa-calendar"></i> ${formatDate(event.date)} • ${event.time}</span>
          <span><i class="fas fa-location-dot"></i> ${event.venue}</span>
        </div>
        <div class="event-card-footer">
          <a href="event-details.html?id=${event.id}" class="btn btn-primary btn-block">
            <i class="fas fa-circle-info"></i> View Details
          </a>
        </div>
      </div>
    </div>
  `;
}

function renderEvents(containerId, events) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (events.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i class="fas fa-calendar-xmark"></i>
        <h3>No events found</h3>
        <p>Try adjusting your search or filter criteria.</p>
      </div>`;
    return;
  }

  container.innerHTML = events.map(eventCardHTML).join('');
}

/* ---------- SEARCH & FILTER ---------- */
/* ── FIX: applyFilters ab har baar getEvents() se fresh data leta hai
         aur category name se bhi search hoti hai ── */
function initSearchFilter(events, containerId) {
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');

  if (categoryFilter) {
    const allCats = ['Technology','Music','Business','Art','Sports','Food','Entertainment','Education'];
    allCats.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      categoryFilter.appendChild(opt);
    });
  }

  function applyFilters() {
    const term = (searchInput?.value || '').toLowerCase().trim();
    const cat = categoryFilter?.value || 'all';

    const freshEvents = getEvents();

    const filtered = freshEvents.filter(e => {
      const matchesSearch = !term ||
        e.name.toLowerCase().includes(term) ||
        e.venue.toLowerCase().includes(term) ||
        e.category.toLowerCase().includes(term);
      const matchesCategory = cat === 'all' || e.category === cat;
      return matchesSearch && matchesCategory;
    });

    renderEvents(containerId, filtered);
  }

  searchInput?.addEventListener('input', applyFilters);
  categoryFilter?.addEventListener('change', applyFilters);
}

/* ---------- INIT ON LOAD ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNav();

  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) link.classList.add('active');
  });

  if (document.getElementById('featuredEvents')) {
    const events = getEvents().slice(0, 4);
    renderEvents('featuredEvents', events);
  }

  if (document.getElementById('allEvents')) {
    const events = getEvents();
    renderEvents('allEvents', events);
    initSearchFilter(events, 'allEvents');
  }

  if (document.getElementById('eventDetailsContainer')) {
    renderEventDetails();
  }
});

/* ---------- EVENT DETAILS RENDERING ---------- */
function renderEventDetails() {
  const id = getQueryParam('id');
  const event = getEventById(id);
  const container = document.getElementById('eventDetailsContainer');

  if (!event) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-circle-exclamation"></i>
        <h3>Event Not Found</h3>
        <p>The event you're looking for doesn't exist or has been removed.</p>
        <a href="events.html" class="btn btn-primary mt-2">Browse Events</a>
      </div>`;
    return;
  }

  document.title = `${event.name} - EventNest`;

  container.innerHTML = `
    <div class="event-details">
      <div>
        <div class="event-details-img">
          <img src="${event.image}" alt="${event.name}" onerror="this.src='https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80'">
        </div>
        <div class="event-description">
          <h3><i class="fas fa-align-left"></i> About This Event</h3>
          <p>${event.description}</p>
        </div>
      </div>
      <div class="event-details-info">
        <span class="event-category">${event.category}</span>
        <h1 style="margin-top:14px;">${event.name}</h1>
        <div class="event-details-meta">
          <span><i class="fas fa-calendar"></i> ${formatDate(event.date)}</span>
          <span><i class="fas fa-clock"></i> ${event.time}</span>
          <span><i class="fas fa-location-dot"></i> ${event.venue}</span>
          <span><i class="fas fa-ticket"></i> ${formatPrice(event.price)} per ticket</span>
        </div>
        <div class="event-details-price">${formatPrice(event.price)}</div>
        <a href="booking.html?id=${event.id}" class="btn btn-primary btn-block">
          <i class="fas fa-bookmark"></i> Book This Event
        </a>
      </div>
    </div>
  `;
}

/* ===================================================
   USER AUTH — Session management for public pages
   =================================================== */

const USER_SESSION_KEY = 'ems_user_session';

(function guardUserPage() {
  const path = window.location.pathname;
  const isAuthPage = path.includes('welcome.html') || path.includes('auth.html');
  if (isAuthPage) return;
  const isAdminPage = path.includes('/admin/');
  if (isAdminPage) return;

  const session = localStorage.getItem(USER_SESSION_KEY);
  if (!session) {
    window.location.replace('welcome.html');
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  const wrap = document.getElementById('userMenuWrap');
  if (!wrap) return;

  const sessionRaw = localStorage.getItem(USER_SESSION_KEY);
  if (!sessionRaw) return;

  let user;
  try { user = JSON.parse(sessionRaw); } catch(e) { return; }

  const initials = (user.username || user.name || 'U').slice(0,2).toUpperCase();

  wrap.innerHTML = `
    <div class="user-avatar-btn" id="userAvatarBtn" title="${user.name}" style="cursor:pointer;position:relative;">
      <div style="width:38px;height:38px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.82rem;font-weight:700;letter-spacing:.5px;border:2px solid rgba(108,92,231,0.3);">${initials}</div>
      <div class="user-dropdown" id="userDropdown" style="display:none;position:absolute;right:0;top:48px;background:var(--card-bg);border:1px solid var(--card-border);border-radius:14px;padding:8px;min-width:190px;box-shadow:0 8px 32px rgba(0,0,0,0.18);z-index:999;">
        <div style="padding:10px 14px 12px;border-bottom:1px solid var(--card-border);margin-bottom:4px;">
          <div style="font-weight:600;font-size:0.9rem;">${user.username || user.name}</div>
          <div style="font-size:0.78rem;color:var(--text-muted);margin-top:2px;">${user.email}</div>
        </div>
        <a href="my-bookings.html" style="display:flex;align-items:center;gap:10px;padding:9px 14px;border-radius:9px;text-decoration:none;color:var(--text);font-size:0.88rem;transition:background .15s;" onmouseover="this.style.background='var(--bg-secondary)'" onmouseout="this.style.background='transparent'">
          <i class="fas fa-ticket" style="color:var(--primary);width:16px;"></i> My Bookings
        </a>
        <button onclick="userLogout()" style="display:flex;align-items:center;gap:10px;padding:9px 14px;border-radius:9px;color:#e17055;font-size:0.88rem;width:100%;text-align:left;background:transparent;border:none;cursor:pointer;font-family:inherit;transition:background .15s;" onmouseover="this.style.background='rgba(225,112,85,0.08)'" onmouseout="this.style.background='transparent'">
          <i class="fas fa-right-from-bracket" style="width:16px;"></i> Sign Out
        </button>
      </div>
    </div>`;

  document.getElementById('userAvatarBtn').addEventListener('click', function(e){
    e.stopPropagation();
    const dd = document.getElementById('userDropdown');
    dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
  });
  document.addEventListener('click', () => {
    const dd = document.getElementById('userDropdown');
    if(dd) dd.style.display = 'none';
  });
});

function userLogout() {
  if(!confirm('Sign out of EventNest?')) return;
  localStorage.removeItem(USER_SESSION_KEY);
  window.location.href = 'welcome.html';
}