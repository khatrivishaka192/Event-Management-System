/* ===================================================
   BOOKING.JS — Booking form + My Bookings page
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- BOOKING PAGE ---------- */
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    initBookingPage();
    // Pre-fill from user session
    const sessionRaw = localStorage.getItem('ems_user_session');
    if (sessionRaw) {
      try {
        const u = JSON.parse(sessionRaw);
        if (u.name) {
          const fn = document.getElementById('fullName');
          if (fn && !fn.value) fn.value = u.name;
        }
        if (u.email) {
          const em = document.getElementById('email');
          if (em && !em.value) em.value = u.email;
        }
      } catch(e) {}
    }
  }

  /* ---------- MY BOOKINGS PAGE ---------- */
  const bookingsList = document.getElementById('bookingsList');
  if (bookingsList) {
    renderMyBookings();
  }
});

/* ---------- BOOKING PAGE LOGIC ---------- */
function initBookingPage() {
  const id = getQueryParam('id');
  const event = getEventById(id);
  const summaryContainer = document.getElementById('eventSummary');
  const form = document.getElementById('bookingForm');

  if (!event) {
    summaryContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-circle-exclamation"></i>
        <h3>Event Not Found</h3>
        <p>Please select a valid event to book.</p>
        <a href="events.html" class="btn btn-primary mt-2">Browse Events</a>
      </div>`;
    form.style.display = 'none';
    return;
  }

  document.title = `Book ${event.name} - EventNest`;

  summaryContainer.innerHTML = `
    <div class="event-card" style="margin-bottom: 30px;">
      <div class="event-card-img" style="height: 160px;">
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
      </div>
    </div>
  `;

  const ticketsInput = document.getElementById('tickets');
  const totalDisplay = document.getElementById('totalPrice');

  function updateTotal() {
    const qty = parseInt(ticketsInput.value) || 0;
    const total = qty * event.price;
    totalDisplay.textContent = event.price === 0 ? 'Free' : `Rs ${total.toLocaleString('en-PK')}`;
  }

  ticketsInput.addEventListener('input', updateTotal);
  updateTotal();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateBookingForm(form)) return;

    const booking = {
      id: 'bkg-' + Date.now(),
      eventId: event.id,
      eventName: event.name,
      eventImage: event.image,
      eventDate: event.date,
      eventTime: event.time,
      venue: event.venue,
      price: event.price,
      fullName: document.getElementById('fullName').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      tickets: parseInt(ticketsInput.value),
      total: event.price * parseInt(ticketsInput.value),
      status: 'Confirmed',
      bookedAt: new Date().toISOString()
    };

    addBooking(booking);
    showToast('Booking confirmed successfully!');

    setTimeout(() => {
      window.location.href = 'my-bookings.html';
    }, 1200);
  });
}

/* ---------- FORM VALIDATION ---------- */
function validateBookingForm(form) {
  let isValid = true;

  const fields = [
    { id: 'fullName', check: v => v.trim().length >= 3, msg: 'Please enter your full name (min 3 characters).' },
    { id: 'email', check: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: 'Please enter a valid email address.' },
    { id: 'phone', check: v => /^[0-9+\-\s()]{7,15}$/.test(v), msg: 'Please enter a valid phone number.' },
    { id: 'tickets', check: v => parseInt(v) >= 1 && parseInt(v) <= 10, msg: 'Tickets must be between 1 and 10.' }
  ];

  fields.forEach(field => {
    const input = document.getElementById(field.id);
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

/* ---------- MY BOOKINGS PAGE ---------- */
function renderMyBookings() {
  const bookings = getBookings();
  const container = document.getElementById('bookingsList');

  if (bookings.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-ticket"></i>
        <h3>No Bookings Yet</h3>
        <p>You haven't booked any events yet. Browse our events and book your spot!</p>
        <a href="events.html" class="btn btn-primary mt-2">Browse Events</a>
      </div>`;
    return;
  }

  container.innerHTML = bookings.slice().reverse().map(b => `
    <div class="booking-item">
      <img src="${b.eventImage}" alt="${b.eventName}" onerror="this.src='https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80'">
      <div class="booking-info">
        <h4>${b.eventName}</h4>
        <p><i class="fas fa-calendar"></i> ${formatDate(b.eventDate)} • ${b.eventTime}</p>
        <p><i class="fas fa-location-dot"></i> ${b.venue}</p>
        <p><i class="fas fa-user"></i> ${b.fullName} • <i class="fas fa-ticket"></i> ${b.tickets} ticket(s)</p>
        <p><i class="fas fa-money-bill"></i> Total: ${b.price === 0 ? 'Free' : 'Rs ' + b.total.toLocaleString('en-PK')}</p>
      </div>
      <div>
        <span class="booking-status">${b.status}</span>
        <button class="btn btn-sm btn-secondary mt-2" onclick="cancelBooking('${b.id}')" style="display:block; margin-top:10px;">
          <i class="fas fa-trash"></i> Cancel
        </button>
      </div>
    </div>
  `).join('');
}

function cancelBooking(id) {
  if (!confirm('Are you sure you want to cancel this booking?')) return;
  let bookings = getBookings();
  bookings = bookings.filter(b => b.id !== id);
  saveBookings(bookings);
  showToast('Booking cancelled.');
  renderMyBookings();
}

/* ---------- REAL-TIME VALIDATION FOR BOOKING FORM ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const rules = [
    { id: 'fullName', check: v => v.trim().length >= 3 },
    { id: 'email',    check: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) },
    { id: 'phone',    check: v => /^[0-9+\-\s()]{7,15}$/.test(v.trim()) },
    { id: 'tickets',  check: v => parseInt(v) >= 1 && parseInt(v) <= 10 },
  ];
  rules.forEach(({ id, check }) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur', function () {
      const g = this.closest('.form-group');
      if (!check(this.value)) g.classList.add('invalid');
      else g.classList.remove('invalid');
    });
    el.addEventListener('input', function () {
      if (this.closest('.form-group').classList.contains('invalid') && check(this.value))
        this.closest('.form-group').classList.remove('invalid');
    });
  });

  // Allow only digits/+/-/spaces in phone
  const phone = document.getElementById('phone');
  phone?.addEventListener('input', function () {
    this.value = this.value.replace(/[^0-9+\-\s()]/g, '');
  });
});
