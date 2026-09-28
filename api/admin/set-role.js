const kv = require('../../lib/kv');
const { verifyToken } = require('../../lib/auth');
const { parseCookies } = require('../../lib/cookies');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: { fa: 'متد غیرمجاز.', en: 'Method not allowed.' } });
  }
  const cookies = parseCookies(req);
  const payload = verifyToken(cookies['latism_session']);
  if (!payload || payload.role !== 'admin') {
    return res.status(403).json({ message: { fa: 'دسترسی نداری.', en: 'Access denied.' } });
  }

  const { phone, role } = req.body || {};
  if (!phone || !['admin', 'member'].includes(role)) {
    return res.status(400).json({ message: { fa: 'ورودی نامعتبر.', en: 'Invalid input.' } });
  }

  const user = await kv.get(`user:${phone}`);
  if (!user) {
    return res.status(404).json({ message: { fa: 'کاربر پیدا نشد.', en: 'User not found.' } });
  }
  user.role = role;
  await kv.set(`user:${phone}`, user);
  return res.status(200).json({ ok: true });
};
