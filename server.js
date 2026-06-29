require('dotenv').config();
const express = require('express');
const session = require('express-session');
const nodemailer = require('nodemailer');
const XLSX = require('xlsx');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-me-please',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 8 }
}));

// ---------- email transport ----------
let transporter = null;
if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE) === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

async function sendOrderEmail(order, lines) {
  const to = process.env.ORDER_EMAIL;
  const itemsTxt = lines.map(l => `• ${l.label} × ${l.qty} — ₾${l.lineTotal}`).join('\n');
  const itemsHtml = lines.map(l => `<li>${l.label} × ${l.qty} — <b>₾${l.lineTotal}</b></li>`).join('');
  const subject = `ახალი შეკვეთა #${order.id} — ₾${order.total}`;
  const text =
`ახალი შეკვეთა #${order.id}
თარიღი: ${order.created_at}

კლიენტი: ${order.customer_name}
ტელეფონი: ${order.phone || '—'}
იმეილი: ${order.email || '—'}
მისამართი: ${order.address || '—'}

ნივთები:
${itemsTxt}

ჯამი: ₾${order.total}`;
  const html =
`<div style="font-family:sans-serif;max-width:520px">
  <h2 style="margin:0 0 4px">ახალი შეკვეთა #${order.id}</h2>
  <p style="color:#666;margin:0 0 16px">${order.created_at}</p>
  <p><b>კლიენტი:</b> ${order.customer_name}<br>
     <b>ტელეფონი:</b> ${order.phone || '—'}<br>
     <b>იმეილი:</b> ${order.email || '—'}<br>
     <b>მისამართი:</b> ${order.address || '—'}</p>
  <ul>${itemsHtml}</ul>
  <p style="font-size:18px"><b>ჯამი: ₾${order.total}</b></p>
</div>`;

  if (!transporter || !to) {
    console.log('ℹ️  SMTP არ არის გამართული — იმეილი არ გაიგზავნა. შეკვეთა ბაზაში შენახულია.');
    console.log(text);
    return { sent: false };
  }
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to, subject, text, html
  });
  return { sent: true };
}

// ---------- public API ----------
app.get('/api/products', (req, res) => {
  const rows = db.prepare(
    `SELECT id,type,name,price,shape,color,attrs FROM products
     WHERE active = 1 ORDER BY type, sort, id`
  ).all();
  const out = { plant: [], pot: [], pkg: [] };
  for (const r of rows) {
    r.attrs = JSON.parse(r.attrs || '{}');
    if (out[r.type]) out[r.type].push(r);
  }
  res.json(out);
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customer = {}, items = [] } = req.body;
    if (!customer.name || !customer.name.trim())
      return res.status(400).json({ error: 'სახელი სავალდებულოა' });
    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ error: 'კალათა ცარიელია' });

    const getProd = db.prepare('SELECT * FROM products WHERE id = ? AND active = 1');
    const lines = [];
    let total = 0;
    for (const it of items) {
      const plant = getProd.get(it.plantId);
      const pot   = getProd.get(it.potId);
      const pkg   = getProd.get(it.pkgId);
      if (!plant || !pot || !pkg)
        return res.status(400).json({ error: 'ნივთი ვეღარ მოიძებნა' });
      const qty = Math.max(1, parseInt(it.qty, 10) || 1);
      const unit = plant.price + pot.price + pkg.price;
      const lineTotal = unit * qty;
      total += lineTotal;
      lines.push({
        plant: plant.name, pot: pot.name, pkg: pkg.name,
        label: `${plant.name} · ${pot.name} · ${pkg.name}`,
        unit, qty, lineTotal
      });
    }

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const info = db.prepare(
      `INSERT INTO orders (created_at,customer_name,phone,email,address,total,items,status)
       VALUES (?,?,?,?,?,?,?, 'new')`
    ).run(now, customer.name.trim(), customer.phone || '', customer.email || '',
          customer.address || '', total, JSON.stringify(lines));

    const order = { id: info.lastInsertRowid, created_at: now, total,
      customer_name: customer.name.trim(), phone: customer.phone,
      email: customer.email, address: customer.address };

    let mail = { sent: false };
    try { mail = await sendOrderEmail(order, lines); }
    catch (e) { console.error('იმეილის შეცდომა:', e.message); }

    res.json({ ok: true, orderId: order.id, total, emailSent: mail.sent });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'სერვერის შეცდომა' });
  }
});

// ---------- admin auth ----------
function requireAdmin(req, res, next) {
  if (req.session && req.session.admin) return next();
  res.status(401).json({ error: 'საჭიროა ავტორიზაცია' });
}

app.post('/api/admin/login', (req, res) => {
  if ((req.body.password || '') === ADMIN_PASSWORD) {
    req.session.admin = true;
    return res.json({ ok: true });
  }
  res.status(401).json({ error: 'პაროლი არასწორია' });
});
app.post('/api/admin/logout', (req, res) => { req.session.destroy(() => res.json({ ok: true })); });
app.get('/api/admin/me', (req, res) => res.json({ admin: !!(req.session && req.session.admin) }));

// ---------- admin: products ----------
app.get('/api/admin/products', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM products ORDER BY type, sort, id').all();
  rows.forEach(r => r.attrs = JSON.parse(r.attrs || '{}'));
  res.json(rows);
});

app.post('/api/admin/products', requireAdmin, (req, res) => {
  const b = req.body;
  if (!['plant', 'pot', 'pkg'].includes(b.type))
    return res.status(400).json({ error: 'ტიპი არასწორია' });
  if (!b.name || !String(b.name).trim())
    return res.status(400).json({ error: 'სახელი სავალდებულოა' });
  const info = db.prepare(
    `INSERT INTO products (type,name,price,shape,color,attrs,active,sort)
     VALUES (?,?,?,?,?,?,?,?)`
  ).run(b.type, String(b.name).trim(), Number(b.price) || 0,
        b.shape || null, b.color || null,
        JSON.stringify(b.attrs || {}),
        b.active === false ? 0 : 1, Number(b.sort) || 0);
  res.json({ ok: true, id: info.lastInsertRowid });
});

app.put('/api/admin/products/:id', requireAdmin, (req, res) => {
  const b = req.body;
  const exists = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id);
  if (!exists) return res.status(404).json({ error: 'ვერ მოიძებნა' });
  db.prepare(
    `UPDATE products SET name=?,price=?,shape=?,color=?,attrs=?,active=?,sort=? WHERE id=?`
  ).run(String(b.name).trim(), Number(b.price) || 0, b.shape || null, b.color || null,
        JSON.stringify(b.attrs || {}), b.active === false ? 0 : 1,
        Number(b.sort) || 0, req.params.id);
  res.json({ ok: true });
});

app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ---------- admin: orders ----------
app.get('/api/admin/orders', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM orders ORDER BY id DESC').all();
  rows.forEach(r => r.items = JSON.parse(r.items || '[]'));
  res.json(rows);
});

app.put('/api/admin/orders/:id/status', requireAdmin, (req, res) => {
  db.prepare('UPDATE orders SET status = ? WHERE id = ?')
    .run(req.body.status || 'new', req.params.id);
  res.json({ ok: true });
});

app.get('/api/admin/orders/export.xlsx', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM orders ORDER BY id DESC').all();
  const data = rows.map(r => {
    const items = JSON.parse(r.items || '[]');
    const itemsStr = items.map(i => `${i.label} ×${i.qty} (₾${i.lineTotal})`).join('\n');
    const qtyTotal = items.reduce((a, i) => a + i.qty, 0);
    return {
      'ID': r.id,
      'თარიღი': r.created_at,
      'სახელი': r.customer_name,
      'ტელეფონი': r.phone,
      'იმეილი': r.email,
      'მისამართი': r.address,
      'ნივთები': itemsStr,
      'რაოდენობა': qtyTotal,
      'ჯამი (₾)': r.total,
      'სტატუსი': r.status
    };
  });
  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    { wch: 5 }, { wch: 17 }, { wch: 18 }, { wch: 15 }, { wch: 24 },
    { wch: 28 }, { wch: 40 }, { wch: 11 }, { wch: 10 }, { wch: 12 }
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'შეკვეთები');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  const fname = `shekvetebi_${new Date().toISOString().slice(0, 10)}.xlsx`;
  res.setHeader('Content-Disposition', `attachment; filename="${fname}"`);
  res.setHeader('Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buf);
});

// ---------- static + pages ----------
app.use(express.static(path.join(__dirname, 'public')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

app.listen(PORT, () => {
  console.log(`\n🌱 სუკულა გაეშვა: http://localhost:${PORT}`);
  console.log(`   ადმინი:        http://localhost:${PORT}/admin\n`);
});
