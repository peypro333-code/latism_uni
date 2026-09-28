function parseCookies(req) {
  const header = req.headers.cookie || '';
  const out = {};
  header.split(';').forEach(part => {
    const idx = part.indexOf('=');
    if (idx === -1) return;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  });
  return out;
}

function serializeCookie(name, value, options = {}) {
  let str = `${name}=${encodeURIComponent(value)}`;
  if (options.maxAge !== undefined) str += `; Max-Age=${options.maxAge}`;
  str += `; Path=${options.path || '/'}`;
  if (options.httpOnly !== false) str += '; HttpOnly';
  str += `; SameSite=${options.sameSite || 'Lax'}`;
  if (options.secure !== false) str += '; Secure';
  return str;
}

module.exports = { parseCookies, serializeCookie };
