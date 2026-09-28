const kv = require('../../lib/kv');
const { verifyToken } = require('../../lib/auth');
const { parseCookies } = require('../../lib/cookies');

module.exports = async (req, res) => {
  const cookies = parseCookies(req);
  const payload = verifyToken(cookies['latism_session']);
  if (!payload || payload.role !== 'admin') {
    return res.status(403).json({ message: { fa: 'دسترسی نداری.', en: 'Access denied.' } });
  }

  const index = (await kv.get('users:index')) || [];
  const users = [];
  for (const phone of index) {
    const u = await kv.get(`user:${phone}`);
    if (u) {
      users.push({ phone: u.phone, firstName: u.firstName, lastName: u.lastName, role: u.role, createdAt: u.createdAt });
    }
  }
  users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return res.status(200).json({ users });
};
