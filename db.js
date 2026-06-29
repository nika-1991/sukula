const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'shop.db'));
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS products (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  type    TEXT    NOT NULL,            -- 'plant' | 'pot' | 'pkg'
  name    TEXT    NOT NULL,
  price   REAL    NOT NULL DEFAULT 0,
  shape   TEXT,                        -- plant/pkg style key
  color   TEXT,                        -- pot color (hex)
  attrs   TEXT    DEFAULT '{}',        -- JSON (plant specs: h/light/water)
  active  INTEGER NOT NULL DEFAULT 1,
  sort    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at    TEXT    NOT NULL,
  customer_name TEXT    NOT NULL,
  phone         TEXT,
  email         TEXT,
  address       TEXT,
  total         REAL    NOT NULL,
  items         TEXT    NOT NULL,      -- JSON array
  status        TEXT    NOT NULL DEFAULT 'new'
);
`);

// ---- seed defaults on first run ----
const count = db.prepare('SELECT COUNT(*) c FROM products').get().c;
if (count === 0) {
  const ins = db.prepare(
    `INSERT INTO products (type,name,price,shape,color,attrs,active,sort)
     VALUES (@type,@name,@price,@shape,@color,@attrs,1,@sort)`
  );
  const seed = [
    { type:'plant', name:'ექევერია',        price:15, shape:'echeveria', color:null, attrs:JSON.stringify({h:'12 სმ',light:'მკვეთრი',water:'იშვიათი'}),     sort:1 },
    { type:'plant', name:'კაქტუსი',          price:18, shape:'cactus',    color:null, attrs:JSON.stringify({h:'18 სმ',light:'მკვეთრი',water:'ძ. იშვიათი'}),  sort:2 },
    { type:'plant', name:'ალოე',             price:22, shape:'aloe',      color:null, attrs:JSON.stringify({h:'25 სმ',light:'ნათელი',water:'იშვიათი'}),       sort:3 },
    { type:'plant', name:'ზებრა',            price:14, shape:'zebra',     color:null, attrs:JSON.stringify({h:'9 სმ',light:'ნაწ. ჩრდილი',water:'იშვიათი'}),   sort:4 },
    { type:'plant', name:'მარგალიტის ძაფი',  price:25, shape:'pearls',    color:null, attrs:JSON.stringify({h:'30 სმ ↓',light:'ნათელი',water:'ზომიერი'}),     sort:5 },

    { type:'pot', name:'ტერაკოტა',       price:12, shape:'pot', color:'#C77B53', attrs:'{}', sort:1 },
    { type:'pot', name:'თეთრი კერამიკა', price:20, shape:'pot', color:'#F1EFE9', attrs:'{}', sort:2 },
    { type:'pot', name:'შავი მატი',      price:24, shape:'pot', color:'#2C2C2C', attrs:'{}', sort:3 },
    { type:'pot', name:'ბეტონი',         price:28, shape:'pot', color:'#B7B8B1', attrs:'{}', sort:4 },

    { type:'pkg', name:'უბრალო',          price:0,  shape:'plain',   color:null, attrs:'{}', sort:1 },
    { type:'pkg', name:'ქრაფტ შეფუთვა',   price:6,  shape:'kraft',   color:null, attrs:'{}', sort:2 },
    { type:'pkg', name:'სასაჩუქრე ყუთი',  price:14, shape:'premium', color:null, attrs:'{}', sort:3 },
  ];
  const tx = db.transaction(rows => rows.forEach(r => ins.run(r)));
  tx(seed);
  console.log('✓ საწყისი პროდუქტები ჩაიტვირთა ბაზაში');
}

module.exports = db;
