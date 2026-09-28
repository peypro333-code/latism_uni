const { serializeCookie } = require('../lib/cookies');

module.exports = async (req, res) => {
  res.setHeader('Set-Cookie', serializeCookie('latism_session', '', { maxAge: 0 }));
  return res.status(200).json({ ok: true });
};
