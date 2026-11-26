const GEL = n => '₾' + n;
const $ = id => document.getElementById(id);

let DATA = { plant: [], pot: [], pkg: [] };
const state = { plant: null, pot: null, pkg: null };
let cart = [];
let specCounter = 1;

try { cart = JSON.parse(localStorage.getItem('fesvi_cart') || '[]'); } catch (e) { cart = []; }
const saveCart = () => { try { localStorage.setItem('fesvi_cart', JSON.stringify(cart)); } catch (e) {} };

const byId = (type, id) => DATA[type].find(p => p.id === id);

async function init() {
  const res = await fetch('/api/products');
  DATA = await res.json();
  state.plant = DATA.plant[0]?.id ?? null;
  state.pot   = DATA.pot[0]?.id ?? null;
  state.pkg   = DATA.pkg[0]?.id ?? null;
  buildOpts();
  syncSelected();
  renderPreview(false);
  renderCart();
  bumpCount();
}

function buildOpts() {
  $('plantOpts').innerHTML = DATA.plant.map(p => optCard('plant', p, FesviSVG.plantThumb(p))).join('');
  $('potOpts').innerHTML   = DATA.pot.map(p => optCard('pot', p, FesviSVG.potThumb(p))).join('');
  $('pkgOpts').innerHTML   = DATA.pkg.map(p => optCard('pkg', p, FesviSVG.pkgThumb(p))).join('');
  document.querySelectorAll('.opt').forEach(el => el.addEventListener('click', () => {
    state[el.dataset.type] = Number(el.dataset.id);
    syncSelected(); renderPreview(true);
  }));
}
function optCard(type, p, svg) {
  const price = p.price ? GEL(p.price) : 'უფასო';
  return `<button class="opt" data-type="${type}" data-id="${p.id}">
    <div class="thumb">${svg}</div>
    <div class="nm">${p.name}</div><div class="pr">${price}</div>
    <div class="tick">✓</div></button>`;
}
function syncSelected() {
  document.querySelectorAll('.opt').forEach(el =>
    el.classList.toggle('sel', state[el.dataset.type] === Number(el.dataset.id)));
}

function current() {
  return { plant: byId('plant', state.plant), pot: byId('pot', state.pot), pkg: byId('pkg', state.pkg) };
}
function currentPrice() {
  const c = current();
  return (c.plant?.price || 0) + (c.pot?.price || 0) + (c.pkg?.price || 0);
}
function renderPreview(animate) {
  const c = current();
  if (!c.plant || !c.pot || !c.pkg) {
    $('previewWrap').innerHTML = '<p style="color:#6E7A72;padding:40px">პროდუქტები არ არის. დაამატე ადმინ-პანელში.</p>';
    return;
  }
  $('previewWrap').innerHTML = FesviSVG.compose(c.plant, c.pot, c.pkg);
  if (animate) { const s = $('previewWrap').querySelector('svg'); s.classList.remove('pop'); void s.offsetWidth; s.classList.add('pop'); }
  const a = c.plant.attrs || {};
  $('mH').textContent = a.h || '—';
  $('mL').textContent = a.light || '—';
  $('mW').textContent = a.water || '—';
  $('dimTag').textContent = (a.h || '—').replace(' სმ', '') + (a.h ? ' სმ' : '');
  $('total').textContent = GEL(currentPrice());
  $('specId').textContent = 'SPECIMEN — ' + String(specCounter).padStart(3, '0');
}

/* ---------- cart ---------- */
function addToCart() {
  const c = current();
  if (!c.plant || !c.pot || !c.pkg) return;
  const key = `${c.plant.id}|${c.pot.id}|${c.pkg.id}`;
  const ex = cart.find(i => i.key === key);
  if (ex) ex.qty++;
  else cart.push({
    key, plantId: c.plant.id, potId: c.pot.id, pkgId: c.pkg.id,
    plant: c.plant.name, pot: c.pot.name, pkg: c.pkg.name,
    price: currentPrice(), qty: 1,
    svg: FesviSVG.compose(c.plant, c.pot, c.pkg)
  });
  specCounter++; saveCart(); renderCart(); bumpCount();
  toast('დაემატა კალათაში · ' + GEL(currentPrice()));
}
function bumpCount() { $('cartCount').textContent = cart.reduce((a, c) => a + c.qty, 0); }

function renderCart() {
  $('drawerTitle').textContent = 'კალათა';
  const body = $('drawerBody'), foot = $('drawerFoot');
  if (!cart.length) {
    body.innerHTML = `<div class="empty"><div class="big">კალათა ცარიელია</div>
      ააწყვე შენი პირველი სუკულენტი — არჩევანი მარცხნივ ცოცხლად ჩანს.</div>`;
    foot.innerHTML = `<div class="row"><span class="t">ჯამი</span><span class="s">₾0</span></div>
      <button class="btn-primary" disabled>შეკვეთის გაფორმება</button>`;
    return;
  }
  body.innerHTML = cart.map((c, i) => `
    <div class="citem">
      <div class="ct">${c.svg}</div>
      <div style="flex:1">
        <div class="cn">${c.plant}</div>
        <div class="cd">${c.pot} · ${c.pkg}</div>
        <div class="cb">
          <div class="qty">
            <button data-act="dec" data-i="${i}" aria-label="შემცირება">−</button>
            <span>${c.qty}</span>
            <button data-act="inc" data-i="${i}" aria-label="გაზრდა">+</button>
          </div>
          <div class="cp">${GEL(c.price * c.qty)}</div>
        </div>
        <button class="rm" data-act="rm" data-i="${i}">წაშლა</button>
      </div>
    </div>`).join('');
  const total = cart.reduce((a, c) => a + c.price * c.qty, 0);
  foot.innerHTML = `<div class="row"><span class="t">ჯამი</span><span class="s">${GEL(total)}</span></div>
    <button class="btn-primary" id="toCheckout">შეკვეთის გაფორმება</button>`;
  body.querySelectorAll('button[data-act]').forEach(b => b.addEventListener('click', () => {
    const i = +b.dataset.i, act = b.dataset.act;
    if (act === 'inc') cart[i].qty++;
    else if (act === 'dec') { cart[i].qty--; if (cart[i].qty <= 0) cart.splice(i, 1); }
    else if (act === 'rm') cart.splice(i, 1);
    saveCart(); renderCart(); bumpCount();
  }));
  $('toCheckout').addEventListener('click', renderCheckout);
}

/* ---------- checkout ---------- */
function renderCheckout() {
  const total = cart.reduce((a, c) => a + c.price * c.qty, 0);
  $('drawerTitle').textContent = 'შეკვეთის გაფორმება';
  $('drawerBody').innerHTML = `
    <button class="back-link" id="backCart">← კალათაში დაბრუნება</button>
    <div class="field"><label>სახელი და გვარი *</label><input id="cName" autocomplete="name"></div>
    <div class="field"><label>ტელეფონი</label><input id="cPhone" autocomplete="tel" inputmode="tel"></div>
    <div class="field"><label>იმეილი</label><input id="cEmail" type="email" autocomplete="email"></div>
    <div class="field"><label>მისამართი</label><textarea id="cAddr" autocomplete="street-address"></textarea></div>`;
  $('drawerFoot').innerHTML = `<div class="row"><span class="t">გადასახდელი</span><span class="s">${GEL(total)}</span></div>
    <button class="btn-primary" id="placeOrder">შეკვეთის დადასტურება</button>`;
  $('backCart').addEventListener('click', renderCart);
  $('placeOrder').addEventListener('click', placeOrder);
}

async function placeOrder() {
  const name = $('cName').value.trim();
  if (!name) { toast('გთხოვ, შეავსე სახელი'); $('cName').focus(); return; }
  const btn = $('placeOrder'); btn.disabled = true; btn.textContent = 'იგზავნება…';
  const payload = {
    customer: { name, phone: $('cPhone').value.trim(), email: $('cEmail').value.trim(), address: $('cAddr').value.trim() },
    items: cart.map(c => ({ plantId: c.plantId, potId: c.potId, pkgId: c.pkgId, qty: c.qty }))
  };
  try {
    const res = await fetch('/api/orders', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'შეცდომა');
    cart = []; saveCart(); bumpCount();
    $('drawerTitle').textContent = 'მადლობა!';
    $('drawerBody').innerHTML = `<div class="empty">
      <div class="big">შეკვეთა მიღებულია · #${data.orderId}</div>
      დაგიკავშირდებით მალე. ჯამი: <b>${GEL(data.total)}</b>.
      ${data.emailSent ? '' : '<div class="muted-note">(იმეილი არ გაიგზავნა — SMTP ჯერ არ არის გამართული)</div>'}
    </div>`;
    $('drawerFoot').innerHTML = `<button class="btn-primary" id="keepShopping">აგრძელე არჩევა</button>`;
    $('keepShopping').addEventListener('click', () => { renderCart(); closeDrawer(); });
  } catch (e) {
    toast(e.message || 'ვერ გაიგზავნა');
    btn.disabled = false; btn.textContent = 'შეკვეთის დადასტურება';
  }
}

/* ---------- drawer + toast ---------- */
function openDrawer() { $('drawer').classList.add('open'); $('scrim').classList.add('open'); $('drawer').setAttribute('aria-hidden', 'false'); }
function closeDrawer() { $('drawer').classList.remove('open'); $('scrim').classList.remove('open'); $('drawer').setAttribute('aria-hidden', 'true'); }
let toastT;
function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2200); }

$('addBtn').addEventListener('click', addToCart);
$('openCart').addEventListener('click', openDrawer);
$('closeCart').addEventListener('click', closeDrawer);
$('scrim').addEventListener('click', closeDrawer);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

init();
