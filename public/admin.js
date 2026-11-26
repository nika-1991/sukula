const $ = id => document.getElementById(id);
const GEL = n => '₾' + n;
const TYPE_LABEL = { plant: 'მცენარეები', pot: 'ქოთნები', pkg: 'შეფუთვა' };

let toastT;
function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2200); }

async function api(url, opts = {}) {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opts });
  if (res.status === 401) { showLogin(); throw new Error('auth'); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'შეცდომა');
  return data;
}

/* ---------- auth ---------- */
function showLogin() { $('loginView').style.display = 'block'; $('dashView').style.display = 'none'; $('logoutBtn').style.display = 'none'; }
function showDash() { $('loginView').style.display = 'none'; $('dashView').style.display = 'block'; $('logoutBtn').style.display = 'inline-block'; loadProducts(); loadOrders(); }

async function checkAuth() {
  try { const d = await api('/api/admin/me'); d.admin ? showDash() : showLogin(); }
  catch (e) { showLogin(); }
}
$('loginBtn').addEventListener('click', login);
$('pw').addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
async function login() {
  $('loginErr').style.display = 'none';
  try {
    await api('/api/admin/login', { method: 'POST', body: JSON.stringify({ password: $('pw').value }) });
    $('pw').value = ''; showDash();
  } catch (e) { $('loginErr').textContent = e.message; $('loginErr').style.display = 'block'; }
}
$('logoutBtn').addEventListener('click', async () => { await api('/api/admin/logout', { method: 'POST' }); showLogin(); });

/* ---------- tabs ---------- */
document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(x => x.classList.remove('on'));
  document.querySelectorAll('.panel').forEach(x => x.classList.remove('on'));
  t.classList.add('on');
  $('panel-' + t.dataset.tab).classList.add('on');
}));

/* ---------- products ---------- */
function thumbFor(p) {
  if (p.type === 'plant') return FesviSVG.plantThumb(p);
  if (p.type === 'pot') return FesviSVG.potThumb(p);
  return FesviSVG.pkgThumb(p);
}
async function loadProducts() {
  const rows = await api('/api/admin/products');
  const groups = { plant: [], pot: [], pkg: [] };
  rows.forEach(r => groups[r.type] && groups[r.type].push(r));
  $('productList').innerHTML = ['plant', 'pot', 'pkg'].map(type => `
    <div class="ptype">
      <h3>${TYPE_LABEL[type]} (${groups[type].length})</h3>
      <div class="pgrid">
        ${groups[type].map(p => `
          <div class="pcard ${p.active ? '' : 'off'}">
            <div class="pt">${thumbFor(p)}</div>
            <div style="flex:1">
              <div class="pn">${p.name}</div>
              <div class="pp">${p.price ? GEL(p.price) : 'უფასო'}${p.active ? '' : ' · დამალული'}</div>
              <div class="pacts">
                <button data-edit="${p.id}">რედაქტირება</button>
                <button class="del" data-del="${p.id}">წაშლა</button>
              </div>
            </div>
          </div>`).join('') || '<p class="muted-note">ცარიელია</p>'}
      </div>
    </div>`).join('');
  document.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => openEdit(rows.find(r => r.id == b.dataset.edit))));
  document.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => delProduct(b.dataset.del)));
}

async function delProduct(id) {
  if (!confirm('წავშალო ეს პროდუქტი?')) return;
  await api('/api/admin/products/' + id, { method: 'DELETE' });
  toast('წაიშალა'); loadProducts();
}

/* ---------- product modal ---------- */
function fillShapeSelect() {
  $('fShapePlant').innerHTML = FesviSVG.PLANT_SHAPES
    .map(s => `<option value="${s}">${s}</option>`).join('');
}
function syncGroups() {
  const t = $('fType').value;
  $('grpPlant').style.display = t === 'plant' ? 'block' : 'none';
  $('grpPot').style.display = t === 'pot' ? 'block' : 'none';
  $('grpPkg').style.display = t === 'pkg' ? 'block' : 'none';
  updateModalPreview();
}
function updateModalPreview() {
  const t = $('fType').value;
  let svg = '';
  if (t === 'plant') svg = FesviSVG.plantThumb({ shape: $('fShapePlant').value });
  else if (t === 'pot') svg = FesviSVG.potThumb({ color: $('fColor').value });
  else svg = FesviSVG.pkgThumb({ shape: $('fShapePkg').value });
  $('modalPreview').innerHTML = svg;
}
['fType', 'fShapePlant', 'fShapePkg', 'fColor'].forEach(id =>
  document.addEventListener('DOMContentLoaded', () => {}));

$('fType').addEventListener('change', syncGroups);
$('fShapePlant').addEventListener('change', updateModalPreview);
$('fShapePkg').addEventListener('change', updateModalPreview);
$('fColor').addEventListener('input', updateModalPreview);

function openCreate() {
  $('modalTitle').textContent = 'ახალი პროდუქტი';
  $('fId').value = ''; $('fType').value = 'plant'; $('fType').disabled = false;
  $('fName').value = ''; $('fPrice').value = '0'; $('fSort').value = '0'; $('fActive').value = '1';
  $('fShapePlant').value = FesviSVG.PLANT_SHAPES[0]; $('fShapePkg').value = 'plain';
  $('fColor').value = '#C77B53'; $('fH').value = ''; $('fLight').value = ''; $('fWater').value = '';
  $('modalErr').style.display = 'none';
  syncGroups(); openModal();
}
function openEdit(p) {
  $('modalTitle').textContent = 'რედაქტირება';
  $('fId').value = p.id; $('fType').value = p.type; $('fType').disabled = true;
  $('fName').value = p.name; $('fPrice').value = p.price; $('fSort').value = p.sort; $('fActive').value = p.active ? '1' : '0';
  if (p.type === 'plant') {
    $('fShapePlant').value = p.shape || FesviSVG.PLANT_SHAPES[0];
    $('fH').value = p.attrs.h || ''; $('fLight').value = p.attrs.light || ''; $('fWater').value = p.attrs.water || '';
  } else if (p.type === 'pot') {
    $('fColor').value = p.color || '#C77B53';
  } else {
    $('fShapePkg').value = p.shape || 'plain';
  }
  $('modalErr').style.display = 'none';
  syncGroups(); openModal();
}
function openModal() { $('prodModal').classList.add('open'); }
function closeModal() { $('prodModal').classList.remove('open'); }
$('addProductBtn').addEventListener('click', openCreate);
$('modalClose').addEventListener('click', closeModal);
$('prodModal').addEventListener('click', e => { if (e.target.id === 'prodModal') closeModal(); });

$('saveProduct').addEventListener('click', async () => {
  const id = $('fId').value;
  const type = $('fType').value;
  const body = {
    type, name: $('fName').value.trim(), price: Number($('fPrice').value) || 0,
    sort: Number($('fSort').value) || 0, active: $('fActive').value === '1', attrs: {}
  };
  if (!body.name) { $('modalErr').textContent = 'სახელი სავალდებულოა'; $('modalErr').style.display = 'block'; return; }
  if (type === 'plant') { body.shape = $('fShapePlant').value; body.attrs = { h: $('fH').value.trim(), light: $('fLight').value.trim(), water: $('fWater').value.trim() }; }
  else if (type === 'pot') { body.shape = 'pot'; body.color = $('fColor').value; }
  else { body.shape = $('fShapePkg').value; }
  try {
    if (id) await api('/api/admin/products/' + id, { method: 'PUT', body: JSON.stringify(body) });
    else await api('/api/admin/products', { method: 'POST', body: JSON.stringify(body) });
    closeModal(); toast('შენახულია'); loadProducts();
  } catch (e) { $('modalErr').textContent = e.message; $('modalErr').style.display = 'block'; }
});

/* ---------- orders ---------- */
async function loadOrders() {
  const rows = await api('/api/admin/orders');
  if (!rows.length) { $('orderList').innerHTML = '<p class="muted-note">ჯერ შეკვეთები არ არის.</p>'; return; }
  $('orderList').innerHTML = `<table>
    <thead><tr>
      <th>#</th><th>თარიღი</th><th>კლიენტი</th><th>კონტაქტი</th><th>ნივთები</th><th>ჯამი</th><th>სტატუსი</th>
    </tr></thead>
    <tbody>${rows.map(o => `
      <tr>
        <td>${o.id}</td>
        <td>${o.created_at}</td>
        <td><b>${o.customer_name}</b><br><span class="muted-note">${o.address || ''}</span></td>
        <td>${o.phone || '—'}<br><span class="muted-note">${o.email || ''}</span></td>
        <td class="it-line">${o.items.map(i => `${i.label} ×${i.qty}`).join('\n')}</td>
        <td><b>${GEL(o.total)}</b></td>
        <td>
          <select class="status-sel" data-id="${o.id}">
            ${['new', 'მუშავდება', 'გაგზავნილი', 'დასრულდა'].map(s => `<option ${o.status === s ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </td>
      </tr>`).join('')}</tbody></table>`;
  document.querySelectorAll('.status-sel').forEach(sel => sel.addEventListener('change', async () => {
    await api('/api/admin/orders/' + sel.dataset.id + '/status', { method: 'PUT', body: JSON.stringify({ status: sel.value }) });
    toast('სტატუსი განახლდა');
  }));
}
$('refreshOrders').addEventListener('click', loadOrders);
$('exportBtn').addEventListener('click', () => { window.location = '/api/admin/orders/export.xlsx'; });

/* ---------- init ---------- */
fillShapeSelect();
checkAuth();
