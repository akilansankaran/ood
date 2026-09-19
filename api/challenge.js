const crypto = require('crypto');

function secret() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.SUPABASE_PUBLISHABLE_KEY
    || process.env.SUPABASE_ANON_KEY
    || 'ood-challenge';
}

function sign(ids) {
  return crypto.createHmac('sha256', secret()).update(ids.slice().sort().join(',')).digest('hex');
}

function pick(n, k) {
  const ids = Array.from({ length: n }, (_, i) => String(i));
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids.slice(0, k);
}

module.exports = (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'Method not allowed.' });
    return;
  }
  const n = 8, k = 3;
  const orange = pick(n, k);
  const hues = ['violet', 'bone', 'violet', 'bone', 'violet', 'bone', 'violet', 'bone'];
  orange.forEach((id) => { hues[Number(id)] = 'orange'; });
  const items = hues.map((hue, i) => ({ id: String(i), hue }));
  res.status(200).json({ ok: true, token: sign(orange), need: k, items });
};

module.exports.sign = sign;
