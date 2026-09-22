const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

// Mobile navigation
const menuBtn = $('.menu-btn');
const nav = $('.nav');
if (menuBtn && nav) {
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  $$('.nav a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
}

// Current year
$$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

// Scroll reveal
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); }
  }), {threshold:.08});
  $$('.reveal').forEach(el => io.observe(el));
}

// Tabs
$$('[data-tabs]').forEach(group => {
  const buttons = $$('[data-tab]', group), panels = $$('[data-panel]', group);
  buttons.forEach(btn => btn.addEventListener('click', () => {
    buttons.forEach(b => b.classList.toggle('active', b === btn));
    panels.forEach(p => p.classList.toggle('active', p.dataset.panel === btn.dataset.tab));
  }));
});

// Accordions
$$('.accordion-item').forEach(item => {
  const trigger = $('.accordion-trigger', item);
  if (!trigger) return;
  trigger.addEventListener('click', () => {
    const open = item.classList.toggle('open');
    trigger.setAttribute('aria-expanded', String(open));
  });
});

// Gallery lightbox
const lightbox = $('#lightbox');
if (lightbox) {
  const img = $('#lightboxImg', lightbox), caption = $('#lightboxCaption', lightbox);
  const close = () => { lightbox.classList.remove('show'); lightbox.setAttribute('aria-hidden','true'); };
  $$('[data-lightbox]').forEach(btn => btn.addEventListener('click', () => {
    img.src = btn.dataset.lightbox; img.alt = btn.dataset.caption || ''; caption.textContent = btn.dataset.caption || '';
    lightbox.classList.add('show'); lightbox.setAttribute('aria-hidden','false');
  }));
  $('.lightbox-close', lightbox)?.addEventListener('click', close);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

// Campaign display
const campaignConfig = window.CAMPAIGN_CONFIG || {goal:1000000, confirmed:456790};
const campaignNumbers = () => {
  const goal = Number(campaignConfig.goal || 1000000);
  const confirmed = Math.max(0, Math.min(goal, Number(campaignConfig.confirmed || 0)));
  const remaining = goal - confirmed;
  const percent = goal ? (confirmed / goal) * 100 : 0;
  $$('[data-campaign-goal]').forEach(e => e.textContent = goal.toLocaleString());
  $$('[data-campaign-confirmed]').forEach(e => e.textContent = confirmed.toLocaleString());
  $$('[data-campaign-remaining]').forEach(e => e.textContent = remaining.toLocaleString());
  $$('[data-campaign-percent]').forEach(e => e.textContent = percent.toFixed(2) + '%');
  $$('[data-campaign-raised]').forEach(e => e.textContent = 'US$' + confirmed.toLocaleString());
  $$('[data-campaign-fill]').forEach(e => e.style.width = percent + '%');
};
campaignNumbers();

// Give amount selector / commitment preview
const amountForm = $('#amountForm');
if (amountForm) {
  const amountInput = $('#giveAmount');
  const buttons = $$('.amount-chip', amountForm);
  const preview = $('#giveCommitments');
  const update = () => {
    const value = Math.max(0, Math.floor(Number(amountInput.value || 0)));
    if (preview) preview.textContent = value.toLocaleString();
    buttons.forEach(b => b.classList.toggle('active', Number(b.dataset.amount) === value));
  };
  buttons.forEach(b => b.addEventListener('click', () => { amountInput.value = b.dataset.amount; update(); }));
  amountInput?.addEventListener('input', update);
  update();
}

// Demo-safe donation modal: prepares an intent, never increments campaign total.
const donateModal = $('#donateModal');
const openDonate = () => { if (donateModal) { donateModal.classList.add('show'); donateModal.setAttribute('aria-hidden','false'); } };
$$('[data-open-donate]').forEach(b => b.addEventListener('click', openDonate));
if (donateModal) {
  const close = () => { donateModal.classList.remove('show'); donateModal.setAttribute('aria-hidden','true'); };
  $('.modal-close', donateModal)?.addEventListener('click', close);
  donateModal.addEventListener('click', e => { if (e.target === donateModal) close(); });
  $('#donateIntent')?.addEventListener('click', () => {
    const amount = Number($('#giveAmount')?.value || 1);
    const method = $('#giveMethod')?.value || 'selected payment method';
    const msg = $('#intentMessage');
    if (msg) msg.textContent = `Payment intent prepared for US$${amount.toLocaleString()} via ${method}. The public campaign counter will update only after a confirmed payment is received by the secure payment system.`;
  });
}

// Missionary enrollment application: validates the form and prepares an email submission.
const missionaryForm = $('#missionaryApplicationForm');
if (missionaryForm) {
  const error = $('#applicationError');
  const success = $('#applicationSuccess');
  const reference = $('#applicationReference');
  missionaryForm.addEventListener('submit', (event) => {
    event.preventDefault();
    error.textContent = '';
    if (!missionaryForm.checkValidity()) {
      missionaryForm.reportValidity();
      error.textContent = 'Please complete the required fields before submitting your application.';
      return;
    }
    const data = new FormData(missionaryForm);
    const ref = 'SLMT-' + new Date().toISOString().slice(0,10).replaceAll('-','') + '-' + Math.random().toString(36).slice(2,7).toUpperCase();
    const labels = {
      firstName:'First name', lastName:'Last name', email:'Email', phone:'Phone / WhatsApp', country:'Country', city:'City / Town',
      faithJourney:'Faith journey', calling:'Missionary calling', church:'Current church / fellowship', pastor:'Pastor / ministry leader',
      experience:'Ministry experience', gifts:'Skills / gifts / professional experience', focus:'Preferred ministry focus', availability:'Availability',
      languages:'Languages', travel:'Willingness to travel', goals:'Contribution goals', support:'Support / training needed', refName:'Reference name', refContact:'Reference contact', additional:'Additional information'
    };
    const lines = [`SPIRIT LIFE MISSIONS TEAM — MISSIONARY APPLICATION`, `Application reference: ${ref}`, ''];
    Object.keys(labels).forEach(key => {
      const value = String(data.get(key) || '').trim();
      if (value) lines.push(`${labels[key]}:`, value, '');
    });
    lines.push('Applicant consented to the ministry application terms.');
    const subject = encodeURIComponent(`Missionary Application — ${data.get('firstName')} ${data.get('lastName')} — ${ref}`);
    const body = encodeURIComponent(lines.join('\n'));
    const mailto = `mailto:enock.dzonzi@gmail.com?subject=${subject}&body=${body}`;
    window.location.href = mailto;
    missionaryForm.hidden = true;
    if (reference) reference.textContent = `Application reference: ${ref}`;
    if (success) success.hidden = false;
  });
}
