/* ===================================================
   ADMIN.JS — Admin dashboard, event CRUD, bookings
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();

  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });

  // Sidebar mobile toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  menuToggle?.addEventListener('click', () => sidebar.classList.toggle('active'));

  // Highlight active sidebar link
  const currentPage = window.location.pathname.split('/').pop();
  document.querySelectorAll('.sidebar-menu a').forEach(link => {
    if (link.getAttribute('href') === currentPage) link.classList.add('active');
  });

  // ---- DASHBOARD ----
  if (document.getElementById('totalEventsCount')) {
    renderDashboardStats();
  }

  // ---- ADD EVENT PAGE ----
  if (document.getElementById('addEventForm')) {
    initAddEventForm();
  }

  // ---- MANAGE EVENTS PAGE ----
  if (document.getElementById('eventsTableBody')) {
    renderEventsTable();
    initEditModal();
  }

  // ---- BOOKINGS PAGE ----
  if (document.getElementById('bookingsTableBody')) {
    renderBookingsTable();
  }
});

/* ---------- DASHBOARD STATS ---------- */
function renderDashboardStats() {
  const events = getEvents();
  const bookings = getBookings();

  document.getElementById('totalEventsCount').textContent = events.length;
  document.getElementById('totalBookingsCount').textContent = bookings.length;

  const revenue = bookings.reduce((sum, b) => sum + (b.total || 0), 0);
  const revenueEl = document.getElementById('totalRevenue');
  if (revenueEl) revenueEl.textContent = `Rs ${revenue.toLocaleString('en-PK')}`;

  const ticketsEl = document.getElementById('totalTickets');
  if (ticketsEl) {
    const tickets = bookings.reduce((sum, b) => sum + (b.tickets || 0), 0);
    ticketsEl.textContent = tickets;
  }

  // Recent bookings table on dashboard
  const recentBody = document.getElementById('recentBookingsBody');
  if (recentBody) {
    const recent = bookings.slice().reverse().slice(0, 5);
    if (recent.length === 0) {
      recentBody.innerHTML = `<tr><td colspan="5" class="text-center" style="padding: 30px; color: var(--text-muted);">No bookings yet.</td></tr>`;
    } else {
      recentBody.innerHTML = recent.map(b => `
        <tr>
          <td>${b.fullName}</td>
          <td>${b.eventName}</td>
          <td>${b.tickets}</td>
          <td>${b.price === 0 ? 'Free' : 'Rs ' + b.total.toLocaleString('en-PK')}</td>
          <td><span class="badge">${b.status}</span></td>
        </tr>
      `).join('');
    }
  }

  // Recent events table on dashboard
  const recentEventsBody = document.getElementById('recentEventsBody');
  if (recentEventsBody) {
    const recent = events.slice().reverse().slice(0, 5);
    recentEventsBody.innerHTML = recent.map(ev => `
      <tr>
        <td><img src="${ev.image}" class="table-img" onerror="this.src='https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80'"></td>
        <td>${ev.name}</td>
        <td>${ev.category}</td>
        <td>${formatDate(ev.date)}</td>
        <td>${formatPrice(ev.price)}</td>
      </tr>
    `).join('');
  }
}

/* ---------- ADD EVENT FORM ---------- */
function initAddEventForm() {
  const form = document.getElementById('addEventForm');

  // Real-time validation
  const rtRules = [
    { id: 'eventName',        check: v => v.trim().length >= 3 },
    { id: 'eventCategory',    check: v => v !== '' },
    { id: 'eventDate',        check: v => v !== '' },
    { id: 'eventTime',        check: v => v !== '' },
    { id: 'eventVenue',       check: v => v.trim().length >= 3 },
    { id: 'eventDescription', check: v => v.trim().length >= 10 },
    { id: 'eventPrice',       check: v => !isNaN(v) && parseInt(v) >= 0 },
  ];
  rtRules.forEach(({ id, check }) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur', function () {
      const g = this.closest('.form-group');
      if (!check(this.value)) g.classList.add('invalid'); else g.classList.remove('invalid');
    });
    el.addEventListener('input', function () {
      if (this.closest('.form-group').classList.contains('invalid') && check(this.value))
        this.closest('.form-group').classList.remove('invalid');
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateEventForm(form)) return;

    const newEvent = {
      id: 'evt-' + Date.now(),
      name: document.getElementById('eventName').value.trim(),
      category: document.getElementById('eventCategory').value,
      date: document.getElementById('eventDate').value,
      time: document.getElementById('eventTime').value,
      venue: document.getElementById('eventVenue').value.trim(),
      description: document.getElementById('eventDescription').value.trim(),
      price: parseInt(document.getElementById('eventPrice').value) || 0,
      image: document.getElementById('eventImage').value.trim() || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80'
    };

    const events = getEvents();
    events.push(newEvent);
    saveEvents(events);
    showToast('Event added successfully!');
    form.reset();

    setTimeout(() => {
      window.location.href = 'manage-events.html';
    }, 1000);
  });
}

/* ---------- EVENT FORM VALIDATION (shared by add/edit) ---------- */
function validateEventForm(form, prefix = '') {
  let isValid = true;

  const fields = [
    { id: prefix + 'eventName', check: v => v.trim().length >= 3, msg: 'Event name must be at least 3 characters.' },
    { id: prefix + 'eventCategory', check: v => v !== '', msg: 'Please select a category.' },
    { id: prefix + 'eventDate', check: v => v !== '', msg: 'Please select a date.' },
    { id: prefix + 'eventTime', check: v => v !== '', msg: 'Please select a time.' },
    { id: prefix + 'eventVenue', check: v => v.trim().length >= 3, msg: 'Venue is required.' },
    { id: prefix + 'eventDescription', check: v => v.trim().length >= 10, msg: 'Description must be at least 10 characters.' },
    { id: prefix + 'eventPrice', check: v => parseFloat(v) >= 0, msg: 'Price must be 0 or greater.' }
  ];

  fields.forEach(field => {
    const input = document.getElementById(field.id);
    if (!input) return;
    const group = input.closest('.form-group');
    const value = input.value;

    if (!field.check(value)) {
      group.classList.add('invalid');
      isValid = false;
    } else {
      group.classList.remove('invalid');
    }
  });

  if (!isValid) {
    showToast('Please fix the errors in the form.', 'error');
  }

  return isValid;
}

/* ---------- MANAGE EVENTS TABLE ---------- */
function renderEventsTable() {
  const events = getEvents();
  const tbody = document.getElementById('eventsTableBody');

  if (events.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding:30px; color: var(--text-muted);">No events found. Add your first event!</td></tr>`;
    return;
  }

  tbody.innerHTML = events.map(ev => `
    <tr>
      <td><img src="${ev.image}" class="table-img" onerror="this.src='https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80'"></td>
      <td>${ev.name}</td>
      <td>${ev.category}</td>
      <td>${formatDate(ev.date)} <br><small style="color:var(--text-muted)">${ev.time}</small></td>
      <td>${ev.venue}</td>
      <td>${formatPrice(ev.price)}</td>
      <td>
        <div class="action-btns">
          <button class="icon-btn edit" onclick="openEditModal('${ev.id}')" title="Edit"><i class="fas fa-pen"></i></button>
          <button class="icon-btn delete" onclick="deleteEvent('${ev.id}')" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');

  // Search functionality on manage events page
  const searchInput = document.getElementById('eventSearchInput');
  if (searchInput && !searchInput.dataset.bound) {
    searchInput.dataset.bound = 'true';
    searchInput.addEventListener('input', () => {
      const term = searchInput.value.toLowerCase().trim();
      const filtered = getEvents().filter(e =>
        e.name.toLowerCase().includes(term) || e.category.toLowerCase().includes(term)
      );
      renderFilteredEventsTable(filtered);
    });
  }
}

function renderFilteredEventsTable(events) {
  const tbody = document.getElementById('eventsTableBody');
  if (events.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding:30px; color: var(--text-muted);">No matching events found.</td></tr>`;
    return;
  }
  tbody.innerHTML = events.map(ev => `
    <tr>
      <td><img src="${ev.image}" class="table-img" onerror="this.src='https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80'"></td>
      <td>${ev.name}</td>
      <td>${ev.category}</td>
      <td>${formatDate(ev.date)} <br><small style="color:var(--text-muted)">${ev.time}</small></td>
      <td>${ev.venue}</td>
      <td>${formatPrice(ev.price)}</td>
      <td>
        <div class="action-btns">
          <button class="icon-btn edit" onclick="openEditModal('${ev.id}')" title="Edit"><i class="fas fa-pen"></i></button>
          <button class="icon-btn delete" onclick="deleteEvent('${ev.id}')" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

/* ---------- DELETE EVENT ---------- */
function deleteEvent(id) {
  if (!confirm('Are you sure you want to delete this event? This cannot be undone.')) return;
  let events = getEvents();
  events = events.filter(e => e.id !== id);
  saveEvents(events);
  showToast('Event deleted successfully.');
  renderEventsTable();
}

/* ---------- EDIT MODAL ---------- */
function initEditModal() {
  const modal = document.getElementById('editModal');
  const form = document.getElementById('editEventForm');
  const closeBtn = document.getElementById('closeEditModal');
  const cancelBtn = document.getElementById('cancelEditModal');

  closeBtn?.addEventListener('click', () => modal.classList.remove('active'));
  cancelBtn?.addEventListener('click', () => modal.classList.remove('active'));
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateEventForm(form, 'edit')) return;

    const id = document.getElementById('editEventId').value;
    let events = getEvents();
    const index = events.findIndex(ev => ev.id === id);

    if (index !== -1) {
      events[index] = {
        ...events[index],
        name: document.getElementById('editEventName').value.trim(),
        category: document.getElementById('editEventCategory').value,
        date: document.getElementById('editEventDate').value,
        time: document.getElementById('editEventTime').value,
        venue: document.getElementById('editEventVenue').value.trim(),
        description: document.getElementById('editEventDescription').value.trim(),
        price: parseInt(document.getElementById('editEventPrice').value) || 0,
        image: document.getElementById('editEventImage').value.trim()
      };
      saveEvents(events);
      showToast('Event updated successfully!');
      modal.classList.remove('active');
      renderEventsTable();
    }
  });
}

function openEditModal(id) {
  const event = getEventById(id);
  if (!event) return;

  document.getElementById('editEventId').value = event.id;
  document.getElementById('editEventName').value = event.name;
  document.getElementById('editEventCategory').value = event.category;
  document.getElementById('editEventDate').value = event.date;
  document.getElementById('editEventTime').value = event.time;
  document.getElementById('editEventVenue').value = event.venue;
  document.getElementById('editEventDescription').value = event.description;
  document.getElementById('editEventPrice').value = event.price;
  document.getElementById('editEventImage').value = event.image;

  // clear validation states
  document.querySelectorAll('#editEventForm .form-group').forEach(g => g.classList.remove('invalid'));

  document.getElementById('editModal').classList.add('active');
}

/* ---------- BOOKINGS MANAGEMENT TABLE ---------- */
function renderBookingsTable() {
  const bookings = getBookings();
  const tbody = document.getElementById('bookingsTableBody');

  if (bookings.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding:30px; color: var(--text-muted);">No bookings yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = bookings.slice().reverse().map(b => `
    <tr>
      <td>${b.fullName}</td>
      <td>${b.email}<br><small style="color:var(--text-muted)">${b.phone}</small></td>
      <td>${b.eventName}</td>
      <td>${formatDate(b.eventDate)}</td>
      <td>${b.tickets}</td>
      <td>${b.price === 0 ? 'Free' : 'Rs ' + b.total.toLocaleString('en-PK')}</td>
      <td>
        <div class="action-btns">
          <span class="badge">${b.status}</span>
          <button class="icon-btn delete" onclick="deleteBooking('${b.id}')" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');

  // Search
  const searchInput = document.getElementById('bookingSearchInput');
  if (searchInput && !searchInput.dataset.bound) {
    searchInput.dataset.bound = 'true';
    searchInput.addEventListener('input', () => {
      const term = searchInput.value.toLowerCase().trim();
      const filtered = getBookings().filter(b =>
        b.fullName.toLowerCase().includes(term) ||
        b.eventName.toLowerCase().includes(term) ||
        b.email.toLowerCase().includes(term)
      );
      renderFilteredBookingsTable(filtered);
    });
  }
}

function renderFilteredBookingsTable(bookings) {
  const tbody = document.getElementById('bookingsTableBody');
  if (bookings.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding:30px; color: var(--text-muted);">No matching bookings found.</td></tr>`;
    return;
  }
  tbody.innerHTML = bookings.slice().reverse().map(b => `
    <tr>
      <td>${b.fullName}</td>
      <td>${b.email}<br><small style="color:var(--text-muted)">${b.phone}</small></td>
      <td>${b.eventName}</td>
      <td>${formatDate(b.eventDate)}</td>
      <td>${b.tickets}</td>
      <td>${b.price === 0 ? 'Free' : 'Rs ' + b.total.toLocaleString('en-PK')}</td>
      <td>
        <div class="action-btns">
          <span class="badge">${b.status}</span>
          <button class="icon-btn delete" onclick="deleteBooking('${b.id}')" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function deleteBooking(id) {
  if (!confirm('Delete this booking?')) return;
  let bookings = getBookings();
  bookings = bookings.filter(b => b.id !== id);
  saveBookings(bookings);
  showToast('Booking deleted.');
  renderBookingsTable();
}
