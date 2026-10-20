const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'data.json');
const SEED_FILE = path.join(__dirname, 'seed-data.json');

app.use(express.json());
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return null;
  }
}

function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    const seed = readJSON(SEED_FILE);
    fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2));
  }
}

function readData() {
  ensureDataFile();
  return readJSON(DATA_FILE);
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function isValidPayload(body) {
  return (
    body &&
    Array.isArray(body.reps) &&
    Array.isArray(body.verticals) &&
    body.reps.every(r => typeof r.name === 'string' && typeof r.goal === 'number' && typeof r.current === 'number') &&
    body.verticals.every(v => typeof v.name === 'string' && typeof v.goal === 'number' && typeof v.current === 'number')
  );
}

app.get('/api/data', (req, res) => {
  const data = readData();
  if (!data) return res.status(500).json({ error: 'No data available' });
  res.json(data);
});

app.post('/api/data', (req, res) => {
  const body = req.body;
  if (!isValidPayload(body)) {
    return res.status(400).json({ error: 'Invalid payload shape' });
  }
  body.updatedAt = new Date().toISOString();
  writeData(body);
  res.json({ ok: true, updatedAt: body.updatedAt });
});

// Salesforce feed: body = { counts: [{ name: 'Dina Bash', sql: 2, mql: 2 }, ...] }
// Updates only SQL/MQL counts (goals, names, verticals are left untouched).
// Reps missing from the payload are set to 0 (Salesforce omits reps with no records).
app.post('/api/sync', (req, res) => {
  const counts = req.body && req.body.counts;
  if (!Array.isArray(counts)) return res.status(400).json({ error: 'counts array required' });
  const first = s => String(s || '').trim().split(/\s+/)[0].toLowerCase();
  const data = readData();
  data.reps.forEach(rep => {
    const hit = counts.find(c => first(c.name) === first(rep.name));
    rep.current = hit ? Number(hit.sql) || 0 : 0;
    rep.mql = hit ? Number(hit.mql) || 0 : 0;
  });
  data.updatedAt = new Date().toISOString();
  writeData(data);
  res.json({ ok: true, updatedAt: data.updatedAt });
});

app.post('/api/reset', (req, res) => {
  const seed = readJSON(SEED_FILE);
  seed.updatedAt = new Date().toISOString();
  writeData(seed);
  res.json(seed);
});

app.get('/health', (req, res) => res.send('ok'));

app.listen(PORT, () => {
  console.log(`BDA dashboard server running on port ${PORT}`);
});
