/* =============================================
   THE LOOKS UNISEX SALON — script.js
   Vanilla JS: navbar, mobile menu, carousel,
   scroll-reveal, form handler
============================================= */

/* ── Utility ── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── NAVBAR: shrink on scroll + active link ── */
const navbar    = $('#navbar');
const navToggle = $('#navToggle');
const navLinks  = $('#navLinks');
const navItems  = $$('.nav-link');

/* Shrink navbar when scrolled more than 50px */
function handleNavScroll() {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

/* Highlight the active nav link based on section in view */
function handleActiveLink() {
  const sections = $$('section[id], div[id]');
  let current = '';

  sections.forEach(sec => {
    const top    = sec.offsetTop - navbar.offsetHeight - 20;
    const bottom = top + sec.offsetHeight;
    if (window.scrollY >= top && window.scrollY < bottom) {
      current = sec.id;
    }
  });

  navItems.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}

window.addEventListener('scroll', () => {
  handleNavScroll();
  handleActiveLink();
}, { passive: true });

handleNavScroll(); // run once on load

/* ── MOBILE HAMBURGER MENU ── */
navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', isOpen);
});

/* Close menu when a link is clicked */
navItems.forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', false);
  });
});

/* Close menu on outside click */
document.addEventListener('click', e => {
  if (!navbar.contains(e.target)) {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', false);
  }
});

/* ── SMOOTH SCROLL (fallback for older Safari) ── */
$$('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = $(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.offsetTop - navbar.offsetHeight;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── SCROLL-REVEAL (IntersectionObserver) ── */
/* Adds 'reveal' class to key sections and triggers 'visible' on scroll */
const revealTargets = [
  '.service-card',
  '.why-card',
  '.gallery-item',
  '.testimonial-card',
  '.about-quote',
  '.highlight-item',
  '.contact-list li',
  '.times-card',
  '.about-content',
  '.about-image-wrap',
];

function initReveal() {
  revealTargets.forEach(selector => {
    $$(selector).forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${i * 0.07}s`;
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // only animate once
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  });

  $$('.reveal').forEach(el => observer.observe(el));
}

/* ── TESTIMONIALS CAROUSEL (mobile) ── */
const track = $('#testimonialsTrack');
const dots   = $$('.dot');
let currentSlide = 0;
let autoSlideTimer;

function goToSlide(index) {
  if (!track) return;
  const isMobile = window.innerWidth <= 768;
  if (!isMobile) return; // desktop: static grid, no carousel

  // Each card is 100vw wide on mobile (set via CSS)
  const cardWidth = track.parentElement.offsetWidth;
  track.style.transform = `translateX(-${index * cardWidth}px)`;
  currentSlide = index;

  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

function startAutoSlide() {
  stopAutoSlide();
  autoSlideTimer = setInterval(() => {
    const cards = $$('.testimonial-card');
    const next  = (currentSlide + 1) % cards.length;
    goToSlide(next);
  }, 4500);
}

function stopAutoSlide() {
  clearInterval(autoSlideTimer);
}

dots.forEach(dot => {
  dot.addEventListener('click', () => {
    const idx = parseInt(dot.dataset.index, 10);
    goToSlide(idx);
    stopAutoSlide();
    startAutoSlide();
  });
});

/* Touch swipe on testimonials */
let touchStartX = 0;
if (track) {
  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    stopAutoSlide();
  }, { passive: true });

  track.addEventListener('touchend', e => {
    const diff  = touchStartX - e.changedTouches[0].clientX;
    const cards = $$('.testimonial-card');
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToSlide(Math.min(currentSlide + 1, cards.length - 1));
      } else {
        goToSlide(Math.max(currentSlide - 1, 0));
      }
    }
    startAutoSlide();
  }, { passive: true });
}

/* Re-align carousel on resize */
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) {
      // Reset transform for desktop grid
      if (track) track.style.transform = '';
      stopAutoSlide();
    } else {
      goToSlide(currentSlide);
      startAutoSlide();
    }
  }, 150);
});

/* ── BOOKING FORM HANDLER ── */
function handleBooking() {
  const name    = $('#name');
  const phone   = $('#phone');
  const service = $('#service');
  const date    = $('#date');
  const time    = $('#time');

  // Basic validation
  const fields = [name, phone, service, date, time];
  let valid = true;

  fields.forEach(field => {
    field.style.borderColor = '';
    if (!field.value.trim()) {
      field.style.borderColor = '#e74c3c';
      valid = false;
    }
  });

  if (!valid) {
    showFormToast('Please fill in all required fields.', 'error');
    return;
  }

  // Phone validation (basic Indian mobile pattern)
  const phoneVal = phone.value.trim().replace(/\s+/g, '');
  if (!/^(\+91|91|0)?[6-9]\d{9}$/.test(phoneVal)) {
    phone.style.borderColor = '#e74c3c';
    showFormToast('Please enter a valid Indian mobile number.', 'error');
    return;
  }

  // Build WhatsApp message
  const msg = encodeURIComponent(
    `Hi, I'd like to book an appointment at The LOOKS Salon.\n\n` +
    `Name: ${name.value.trim()}\n` +
    `Phone: ${phone.value.trim()}\n` +
    `Service: ${service.value}\n` +
    `Date: ${date.value}\n` +
    `Time: ${time.value}\n` +
    `Notes: ${$('#message').value.trim() || 'None'}`
  );

  // Open WhatsApp with pre-filled message
  window.open(`https://wa.me/919161248009?text=${msg}`, '_blank');

  // Show success state
  $('#bookingForm').style.display  = 'none';
  $('#formSuccess').style.display  = 'block';
}

// Expose globally for the onclick attribute
window.handleBooking = handleBooking;

function showFormToast(msg, type = 'info') {
  // Remove any existing toast
  const existing = $('.form-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'form-toast';
  toast.textContent = msg;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '90px',
    right: '24px',
    background: type === 'error' ? '#e74c3c' : '#27ae60',
    color: '#fff',
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontFamily: 'Poppins, sans-serif',
    fontWeight: '500',
    zIndex: '9999',
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    animation: 'fadeUp 0.3s ease',
    maxWidth: '280px',
  });

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

/* ── POPULAR TIMES: animate bars on scroll ── */
function initTimesChart() {
  const bars = $$('.times-bar');
  if (!bars.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        bars.forEach(bar => {
          bar.style.transition = 'height 0.7s ease';
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const chart = $('.times-chart');
  if (chart) observer.observe(chart);
}

/* ── SET MINIMUM DATE for booking form ── */
function setMinDate() {
  const dateInput = $('#date');
  if (!dateInput) return;
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);
}

/* ── NAVBAR: update top when topbar is scrolled out ── */
function updateNavTop() {
  // Keep navbar sticky below topbar while topbar is visible
  const topbar = $('.topbar');
  if (!topbar) return;
  // The topbar is not sticky, so once it scrolls out, navbar is at top: 0
  // This is handled by CSS position: sticky naturally
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  setMinDate();
  initTimesChart();

  // Start carousel if mobile
  if (window.innerWidth <= 768) {
    goToSlide(0);
    startAutoSlide();
  }

  // Initial active link
  handleActiveLink();
});

/* ── PRICING TABS ── */
function initPricingTabs() {
  const tabs   = $$('.pricing-tab');
  const panels = $$('.pricing-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const target = $(`#tab-${tab.dataset.tab}`);
      if (target) target.classList.add('active');
    });
  });
}

/* ── BOOKING CHANNEL TOGGLE (WhatsApp vs Email) ── */
let bookingChannel = 'whatsapp';

function initChannelToggle() {
  const btns = $$('.channel-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      bookingChannel = btn.dataset.channel;

      const submitBtn = $('#submitBtn');
      if (submitBtn) {
        if (bookingChannel === 'email') {
          submitBtn.innerHTML = '<i class="fas fa-envelope"></i> Send Booking Email';
        } else {
          submitBtn.innerHTML = '<i class="fas fa-calendar-check"></i> Confirm via WhatsApp';
        }
      }
    });
  });
}

/* Override handleBooking to support email channel */
window.handleBooking = function handleBooking() {
  const name    = $('#name');
  const phone   = $('#phone');
  const service = $('#service');
  const date    = $('#date');
  const time    = $('#time');

  const fields = [name, phone, service, date, time];
  let valid = true;

  fields.forEach(field => {
    field.style.borderColor = '';
    if (!field.value.trim()) {
      field.style.borderColor = '#e74c3c';
      valid = false;
    }
  });

  if (!valid) {
    showFormToast('Please fill in all required fields.', 'error');
    return;
  }

  const phoneVal = phone.value.trim().replace(/\s+/g, '');
  if (!/^(\+91|91|0)?[6-9]\d{9}$/.test(phoneVal)) {
    phone.style.borderColor = '#e74c3c';
    showFormToast('Please enter a valid Indian mobile number.', 'error');
    return;
  }

  const notes = $('#message').value.trim() || 'None';

  if (bookingChannel === 'email') {
    const subject = encodeURIComponent(`Appointment Request — ${service.value}`);
    const body = encodeURIComponent(
      `Hi The LOOKS Salon,\n\nI would like to book an appointment.\n\n` +
      `Name: ${name.value.trim()}\n` +
      `Phone: ${phone.value.trim()}\n` +
      `Service: ${service.value}\n` +
      `Date: ${date.value}\n` +
      `Time: ${time.value}\n` +
      `Notes: ${notes}\n\n` +
      `Please confirm my slot. Thank you!`
    );
    window.location.href = `mailto:thelookssalonco@gmail.com?subject=${subject}&body=${body}`;
  } else {
    const msg = encodeURIComponent(
      `Hi, I'd like to book an appointment at The LOOKS Salon.\n\n` +
      `Name: ${name.value.trim()}\n` +
      `Phone: ${phone.value.trim()}\n` +
      `Service: ${service.value}\n` +
      `Date: ${date.value}\n` +
      `Time: ${time.value}\n` +
      `Notes: ${notes}`
    );
    window.open(`https://wa.me/919161248009?text=${msg}`, '_blank');
  }

  $('#bookingForm').style.display  = 'none';
  $('#formSuccess').style.display  = 'block';
};

/* ── INIT additions ── */
document.addEventListener('DOMContentLoaded', () => {
  initPricingTabs();
  initChannelToggle();
});
