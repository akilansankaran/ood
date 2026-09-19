const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  return {};
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed.' });
    return;
  }

  const body = readBody(req);
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const website = String(body.website || '').trim();
  const started = Number(body.started || 0);
  const a = Number(body.a);
  const b = Number(body.b);
  const challenge = String(body.challenge || '').trim();

  if (website) {
    res.status(200).json({ ok: true });
    return;
  }
  if (!started || Date.now() - started < 1400) {
    res.status(400).json({ ok: false, error: 'Please try again in a moment.' });
    return;
  }
  if (!Number.isInteger(a) || !Number.isInteger(b) || Number(challenge) !== a + b) {
    res.status(400).json({ ok: false, error: 'The check did not match. Try the sum again.' });
    return;
  }
  if (name.length < 1 || name.length > 120) {
    res.status(400).json({ ok: false, error: 'Please enter your name.' });
    return;
  }
  if (!EMAIL_RE.test(email) || email.length > 180) {
    res.status(400).json({ ok: false, error: 'Please enter a valid email.' });
    return;
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    res.status(500).json({ ok: false, error: 'Signup is not configured yet.' });
    return;
  }

  const insert = await fetch(`${url.replace(/\/$/, '')}/rest/v1/signups`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: 'Bearer ' + key,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ name, email }),
  });

  if (insert.status === 409 || insert.status === 23505) {
    res.status(200).json({ ok: true, already: true });
    return;
  }
  if (!insert.ok) {
    const text = await insert.text();
    if (/duplicate|unique/i.test(text)) {
      res.status(200).json({ ok: true, already: true });
      return;
    }
    res.status(502).json({ ok: false, error: 'Could not save that just now.' });
    return;
  }

  res.status(200).json({ ok: true });
};
