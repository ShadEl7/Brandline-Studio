const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.getElementById('primary-menu');
const yearEl = document.getElementById('year');
const contactForm = document.getElementById('contact-form');
const estSetup = document.getElementById('est-setup');
const estMonth = document.getElementById('est-month');
const packageSelect = document.getElementById('pkg');
const hostingCheckbox = document.getElementById('hosting');
const seoCheckbox = document.getElementById('seo');
const careCheckbox = document.getElementById('care');

if (menuToggle && primaryNav) {
  function updateNavState() {
    const willOpen = !primaryNav.classList.contains('open');
    primaryNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(willOpen));
  }

  menuToggle.addEventListener('click', updateNavState);

  // Close mobile nav when a link is clicked
  primaryNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 760 && primaryNav.classList.contains('open')) {
        primaryNav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 760 && primaryNav.classList.contains('open')) {
      primaryNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-ZA', { style: 'decimal' }).format(value);
}

function updateEstimate() {
  if (!packageSelect || !estSetup || !estMonth) return;

  const selection = packageSelect.value;
  let setup = 1750;
  let monthly = 399;

  if (selection === 'business') {
    setup = 2250;
    monthly = 649;
  } else if (selection === 'premium') {
    setup = 2899;
    monthly = 999;
  }

  if (seoCheckbox?.checked) {
    setup += 1500;
    monthly += 600;
  }

  if (careCheckbox?.checked) {
    monthly += 400;
  }

  if (hostingCheckbox?.checked) {
    monthly += 199;
  }

  estSetup.textContent = `Setup: R${formatCurrency(setup)}`;
  estMonth.textContent = `Monthly: R${formatCurrency(monthly)}`;
}

if (packageSelect) {
  [packageSelect, hostingCheckbox, seoCheckbox, careCheckbox].forEach((control) => {
    control?.addEventListener('change', updateEstimate);
  });
  updateEstimate();
}

// support both #year and #y in footers
const yearEls = document.querySelectorAll('#year, #y');
yearEls.forEach((el) => (el.textContent = new Date().getFullYear()));

if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const message = document.getElementById('message')?.value.trim();
    const feedback = document.getElementById('contact-feedback');

    if (!name || !email || !message) {
      if (feedback) feedback.textContent = 'Please complete all fields before submitting.';
      return;
    }

    if (feedback) {
      feedback.textContent = 'Thanks! Your message is ready. We will reply within one business day.';
    }
    contactForm.reset();
  });
}

const backToTop = document.createElement('a');
backToTop.className = 'back-to-top';
backToTop.href = '#main';
backToTop.setAttribute('aria-label', 'Back to top');
backToTop.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M12 4l-8 8h5v8h6v-8h5z"/></svg>';
document.body.appendChild(backToTop);

window.addEventListener('scroll', () => {
  if (window.scrollY > 320) {
    backToTop.classList.add('show');
  } else {
    backToTop.classList.remove('show');
  }
});
