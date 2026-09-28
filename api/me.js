const { verifyToken } = require('../lib/auth');
const { parseCookies } = require('../lib/cookies');

module.exports = async (req, res) => {
  const cookies = parseCookies(req);
  const payload = verifyToken(cookies['latism_session']);
  if (!payload) {
    return res.status(401).json({ message: { fa: 'وارد نشده‌اید.', en: 'Not logged in.' } });
  }
  return res.status(200).json({ user: payload });
};
