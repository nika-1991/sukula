/* სუკულა — მაღაზიის ლოგიკა (პროდუქტები: /api/products, შეკვეთა: /api/orders) */
const GEL = n => '₾' + n;
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let DATA = { plant: [], pot: [], pkg: [] };
const state = { plant: null, pot: null, pkg: null };
let lang = 'ka';
let cart = [];

try { cart = JSON.parse(localStorage.getItem('sukula_cart') || '[]'); } catch (e) { cart = []; }
// ძველი ფორმატის კალათა (შეფუთვის გარეშე) აღარ გამოდგება
cart = cart.filter(c => c && c.plantId && c.potId && c.pkgId);
const save = () => { try { localStorage.setItem('sukula_cart', JSON.stringify(cart)); } catch (e) {} };

/* ---------- ტექსტები ---------- */
const T = {
  ka: {
    plant: 'მცენარე', pot: 'ქოთანი', pkg: 'შეფუთვა', free: 'უფასო',
    addCart: 'კალათაში დამატება', added: 'დაემატა კალათაში · ',
    cartTitle: 'კალათა', orderTitle: 'შეკვეთა',
    checkout: 'შეკვეთის გაფორმება', confirm: 'დადასტურება', backCart: '← კალათა',
    total: 'ჯამი', payable: 'გადასახდელი',
    emptyTitle: 'კალათა ცარიელია', emptySub: 'ააწყვე შენი პირველი სუკულენტი.',
    nameLabel: 'სახელი *', phoneLbl: 'ტელეფონი', emailLbl: 'იმეილი', addrLbl: 'მისამართი',
    namePh: 'მარიამ გელაშვილი', emailPh: 'mariam@example.com', addrPh: 'თბილისი, ქუჩა 45',
    sending: 'იგზავნება…', nameReq: 'გთხოვ, შეავსე სახელი', sendFail: 'ვერ გაიგზავნა',
    thanks: 'მადლობა!', orderNo: 'შეკვეთა #', received: 'მიღებულია. დაგიკავშირდებით მალე. ჯამი: ',
    keepOn: 'გააგრძელე', noProducts: 'პროდუქტები არ არის. დაამატე ადმინ-პანელში.',
    loadFail: 'პროდუქტები ვერ ჩაიტვირთა',
    delivery: '↳ <b>უფასო მიწოდება</b>&nbsp;₾80-დან', contact: 'კონტაქტი',
    sumLabel: 'სულ', mH_lbl: 'სიმაღლე', mL_lbl: 'განათება', mW_lbl: 'მორწყვა', livePrev: 'ცოცხალი პრევიუ'
  },
  en: {
    plant: 'Plant', pot: 'Pot', pkg: 'Packaging', free: 'Free',
    addCart: 'Add to Cart', added: 'Added to cart · ',
    cartTitle: 'Cart', orderTitle: 'Order',
    checkout: 'Place Order', confirm: 'Confirm', backCart: '← Cart',
    total: 'Total', payable: 'Total',
    emptyTitle: 'Your cart is empty', emptySub: 'Build your first succulent.',
    nameLabel: 'Name *', phoneLbl: 'Phone', emailLbl: 'Email', addrLbl: 'Address',
    namePh: 'Mary Smith', emailPh: 'mary@example.com', addrPh: 'Tbilisi, Street 45',
    sending: 'Sending…', nameReq: 'Please enter your name', sendFail: 'Could not send',
    thanks: 'Thank you!', orderNo: 'Order #', received: "Received. We'll contact you soon. Total: ",
    keepOn: 'Continue', noProducts: 'No products yet. Add them in the admin panel.',
    loadFail: 'Could not load products',
    delivery: '↳ <b>Free delivery</b>&nbsp;from ₾80', contact: 'Contact',
    sumLabel: 'Total', mH_lbl: 'Height', mL_lbl: 'Light', mW_lbl: 'Water', livePrev: 'Live Preview'
  }
};

/* ინგლისური სახელები/მახასიათებლები. ადმინში დამატებულ პროდუქტს
   თუ თარგმანი არ აქვს, ქართული სახელი გამოჩნდება. */
const EN_NAMES = {
  'ექევერია': 'Echeveria', 'კაქტუსი': 'Cactus', 'ალოე': 'Aloe', 'ზებრა': 'Zebra',
  'მარგალიტის ძაფი': 'String of Pearls',
  'ტერაკოტა': 'Terracotta', 'თეთრი კერამიკა': 'White Ceramic', 'შავი მატი': 'Matte Black', 'ბეტონი': 'Concrete',
  'უბრალო': 'Plain', 'ქრაფტ შეფუთვა': 'Kraft Wrap', 'სასაჩუქრე ყუთი': 'Gift Box'
};
const EN_ATTRS = {
  'მკვეთრი': 'Direct', 'ნათელი': 'Bright', 'ნაწ. ჩრდილი': 'Part shade',
  'იშვიათი': 'Rare', 'ძ. იშვიათი': 'Very rare', 'ზომიერი': 'Moderate'
};
const pName = p => !p ? '' : (lang === 'en' ? (p.attrs?.nameEn || EN_NAMES[p.name] || p.name) : p.name);
const attrTxt = v => {
  if (!v) return '—';
  if (lang !== 'en') return v;
  return EN_ATTRS[v] || String(v).replace('სმ', 'cm');
};

const byId = (t, id) => DATA[t].find(p => p.id === id);

/* ---------- ჩატვირთვა ---------- */
async function init() {
  try {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error();
    DATA = await res.json();
  } catch (e) {
    toast(T[lang].loadFail);
  }
  for (const t of ['plant', 'pot', 'pkg']) state[t] = DATA[t][0]?.id ?? null;
  buildOpts();
  syncSel();
  renderPreview(false);
  renderCart();
  bumpCnt();
}

function scrollCar(id, dir) { $(id).scrollBy({ left: dir * 144, behavior: 'smooth' }); }

function buildOpts() {
  [['plantCar', 'plant', p => FesviSVG.plantThumb(p)],
   ['potCar', 'pot', p => FesviSVG.potThumb(p)],
   ['pkgCar', 'pkg', p => FesviSVG.pkgThumb(p)]].forEach(([cid, type, fn]) => {
    $(cid).innerHTML = DATA[type].map(p => `
      <button class="opt" data-type="${type}" data-id="${p.id}">
        <div class="opt-thumb">${fn(p)}</div>
        <div class="opt-name">${esc(pName(p))}</div>
        <div class="opt-price">${p.price ? GEL(p.price) : T[lang].free}</div>
        <div class="check-mark">✓</div>
      </button>`).join('');
  });
  document.querySelectorAll('.opt').forEach(el => el.addEventListener('click', () => {
    state[el.dataset.type] = Number(el.dataset.id);
    syncSel(); renderPreview(true);
  }));
}

function syncSel() {
  document.querySelectorAll('.opt').forEach(el =>
    el.classList.toggle('sel', state[el.dataset.type] === Number(el.dataset.id)));
}

function cur() { return { plant: byId('plant', state.plant), pot: byId('pot', state.pot), pkg: byId('pkg', state.pkg) }; }
function curPrice() { const c = cur(); return (c.plant?.price || 0) + (c.pot?.price || 0) + (c.pkg?.price || 0); }
const complete = c => c.plant && c.pot && c.pkg;

function renderPreview(anim) {
  const c = cur();
  if (!complete(c)) {
    $('previewWrap').innerHTML = `<p style="opacity:.6;padding:40px;text-align:center">${T[lang].noProducts}</p>`;
    $('addBtn').disabled = true;
    return;
  }
  $('addBtn').disabled = false;
  $('previewWrap').innerHTML = FesviSVG.compose(c.plant, c.pot, c.pkg);
  if (anim) { const s = $('previewWrap').querySelector('svg'); s.classList.remove('pop'); void s.offsetWidth; s.classList.add('pop'); }
  const a = c.plant.attrs || {};
  $('mH').textContent = attrTxt(a.h);
  $('mL').textContent = attrTxt(a.light);
  $('mW').textContent = attrTxt(a.water);
  $('dimTag').textContent = attrTxt(a.h);
  $('total').textContent = GEL(curPrice());
}

/* ---------- კალათა ---------- */
function addToCart() {
  const c = cur();
  if (!complete(c)) return;
  const key = `${c.plant.id}|${c.pot.id}|${c.pkg.id}`;
  const ex = cart.find(i => i.key === key);
  if (ex) ex.qty++;
  else cart.push({
    key, plantId: c.plant.id, potId: c.pot.id, pkgId: c.pkg.id,
    plant: c.plant.name, pot: c.pot.name, pkg: c.pkg.name,
    price: curPrice(), qty: 1,
    svg: FesviSVG.compose(c.plant, c.pot, c.pkg)
  });
  save(); renderCart(); bumpCnt();
  toast(T[lang].added + GEL(curPrice()));
}
function bumpCnt() { $('cartCount').textContent = cart.reduce((a, c) => a + c.qty, 0); }

// კალათის ნივთის სახელი მიმდინარე ენაზე
const itemName = (type, id, fallback) => { const p = byId(type, id); return p ? pName(p) : fallback; };

function renderCart() {
  $('drawerTitle').textContent = T[lang].cartTitle;
  const body = $('drawerBody'), foot = $('drawerFoot');
  if (!cart.length) {
    body.innerHTML = `<div class="empty-state"><div class="empty-big">${T[lang].emptyTitle}</div><div class="empty-sub">${T[lang].emptySub}</div></div>`;
    foot.innerHTML = `<div class="total-row"><span class="total-label">${T[lang].total}</span><span class="total-amount">₾0</span></div><button class="btn-primary" disabled>${T[lang].checkout}</button>`;
    return;
  }
  body.innerHTML = cart.map((c, i) => `
    <div class="citem">
      <div class="citem-thumb">${c.svg}</div>
      <div style="flex:1">
        <div class="citem-name">${esc(itemName('plant', c.plantId, c.plant))}</div>
        <div class="citem-detail">${esc(itemName('pot', c.potId, c.pot))} · ${esc(itemName('pkg', c.pkgId, c.pkg))}</div>
        <div class="citem-row">
          <div class="qty">
            <button data-act="dec" data-i="${i}">−</button>
            <span>${c.qty}</span>
            <button data-act="inc" data-i="${i}">+</button>
          </div>
          <div class="citem-price">${GEL(c.price * c.qty)}</div>
        </div>
      </div>
      <button class="rm-btn" data-act="rm" data-i="${i}">×</button>
    </div>`).join('');
  const total = cart.reduce((a, c) => a + c.price * c.qty, 0);
  foot.innerHTML = `<div class="total-row"><span class="total-label">${T[lang].total}</span><span class="total-amount">${GEL(total)}</span></div><button class="btn-primary" id="toCheckout">${T[lang].checkout}</button>`;
  body.querySelectorAll('button[data-act]').forEach(b => b.addEventListener('click', () => {
    const i = +b.dataset.i, act = b.dataset.act;
    if (act === 'inc') cart[i].qty++;
    else if (act === 'dec') { cart[i].qty--; if (cart[i].qty <= 0) cart.splice(i, 1); }
    else cart.splice(i, 1);
    save(); renderCart(); bumpCnt();
  }));
  $('toCheckout').addEventListener('click', renderCheckout);
}

/* ---------- შეკვეთა ---------- */
function renderCheckout() {
  const total = cart.reduce((a, c) => a + c.price * c.qty, 0);
  $('drawerTitle').textContent = T[lang].orderTitle;
  $('drawerBody').innerHTML = `
    <button class="back-link" id="backCart">${T[lang].backCart}</button>
    <div class="field"><label>${T[lang].nameLabel}</label><input id="cName" autocomplete="name" placeholder="${T[lang].namePh}"></div>
    <div class="field"><label>${T[lang].phoneLbl}</label><input id="cPhone" autocomplete="tel" inputmode="tel" placeholder="+995 5xx xxx xxx"></div>
    <div class="field"><label>${T[lang].emailLbl}</label><input id="cEmail" type="email" autocomplete="email" placeholder="${T[lang].emailPh}"></div>
    <div class="field"><label>${T[lang].addrLbl}</label><textarea id="cAddr" autocomplete="street-address" placeholder="${T[lang].addrPh}"></textarea></div>`;
  $('drawerFoot').innerHTML = `<div class="total-row"><span class="total-label">${T[lang].payable}</span><span class="total-amount">${GEL(total)}</span></div><button class="btn-primary" id="placeOrder">${T[lang].confirm}</button>`;
  $('backCart').addEventListener('click', renderCart);
  $('placeOrder').addEventListener('click', placeOrder);
}

async function placeOrder() {
  const name = $('cName').value.trim();
  if (!name) { toast(T[lang].nameReq); $('cName').focus(); return; }
  const btn = $('placeOrder'); btn.disabled = true; btn.textContent = T[lang].sending;
  const payload = {
    customer: { name, phone: $('cPhone').value.trim(), email: $('cEmail').value.trim(), address: $('cAddr').value.trim() },
    items: cart.map(c => ({ plantId: c.plantId, potId: c.potId, pkgId: c.pkgId, qty: c.qty }))
  };
  try {
    const res = await fetch('/api/orders', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || T[lang].sendFail);
    cart = []; save(); bumpCnt();
    $('drawerTitle').textContent = T[lang].thanks;
    $('drawerBody').innerHTML = `<div class="empty-state"><div class="empty-big">${T[lang].orderNo}${data.orderId}</div><div class="empty-sub">${T[lang].received}<strong>${GEL(data.total)}</strong></div></div>`;
    $('drawerFoot').innerHTML = `<button class="btn-primary" id="keepOn">${T[lang].keepOn}</button>`;
    $('keepOn').addEventListener('click', () => { renderCart(); closeDrawer(); });
  } catch (e) {
    toast(e.message || T[lang].sendFail);
    btn.disabled = false; btn.textContent = T[lang].confirm;
  }
}

/* ---------- უჯრა + შეტყობინება ---------- */
function openDrawer() { $('drawer').classList.add('open'); $('scrim').classList.add('open'); $('drawer').setAttribute('aria-hidden', 'false'); }
function closeDrawer() { $('drawer').classList.remove('open'); $('scrim').classList.remove('open'); $('drawer').setAttribute('aria-hidden', 'true'); }
let toastT;
function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2300); }

/* ---------- ენა ---------- */
function applyLang(l) {
  lang = l;
  document.documentElement.lang = l;
  $('langBtn').textContent = l === 'ka' ? 'EN' : 'ქა';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = T[l][el.getAttribute('data-i18n')];
    if (v === undefined) return;
    if (el.hasAttribute('data-i18n-html')) el.innerHTML = v; else el.textContent = v;
  });
  try { localStorage.setItem('sukula_lang', l); } catch (e) {}
  buildOpts(); syncSel(); renderPreview(false);
  if ($('placeOrder')) renderCheckout(); else renderCart();
}

/* ---------- ლოგოს თეთრი ფონის მოცილება (მუქ ფონზე) ---------- */
function removeWhiteBg(img) {
  try {
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height), px = d.data;
    for (let i = 0; i < px.length; i += 4) {
      const w = (px[i] + px[i + 1] + px[i + 2]) / 3;
      if (w > 200) px[i + 3] = Math.round(px[i + 3] * (1 - (w - 200) / 55));
    }
    ctx.putImageData(d, 0, 0);
    img.src = c.toDataURL('image/png');
  } catch (e) {}
}
(function () {
  const img = $('logoImg');
  img.addEventListener('error', () => { img.style.display = 'none'; $('logoFallback').style.display = 'flex'; }, { once: true });
  if (img.complete && img.naturalWidth) removeWhiteBg(img);
  else img.addEventListener('load', () => removeWhiteBg(img), { once: true });
})();

$('addBtn').addEventListener('click', addToCart);
$('openCart').addEventListener('click', openDrawer);
$('closeCart').addEventListener('click', closeDrawer);
$('scrim').addEventListener('click', closeDrawer);
$('langBtn').addEventListener('click', () => applyLang(lang === 'ka' ? 'en' : 'ka'));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

let savedLang = 'ka';
try { savedLang = localStorage.getItem('sukula_lang') || 'ka'; } catch (e) {}
if (savedLang === 'en') { lang = 'en'; }
init().then(() => { if (lang === 'en') applyLang('en'); });
