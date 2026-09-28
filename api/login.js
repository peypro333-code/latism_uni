const bcrypt = require('bcryptjs');
const kv = require('../lib/kv');
const { signToken } = require('../lib/auth');
const { serializeCookie } = require('../lib/cookies');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: { fa: 'متد غیرمجاز.', en: 'Method not allowed.' } });
  }
  try {
    const { phone, password } = req.body || {};
    if (!phone || !password) {
      return res.status(400).json({ message: { fa: 'شماره و رمز عبور را وارد کنید.', en: 'Enter phone and password.' } });
    }

    const normalizedPhone = String(phone).trim();
    const user = await kv.get(`user:${normalizedPhone}`);
    if (!user) {
      return res.status(401).json({ message: { fa: 'شماره یا رمز عبور اشتباه است.', en: 'Incorrect phone or password.' } });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: { fa: 'شماره یا رمز عبور اشتباه است.', en: 'Incorrect phone or password.' } });
    }

    const token = signToken({ phone: user.phone, role: user.role, firstName: user.firstName, lastName: user.lastName });
    res.setHeader('Set-Cookie', serializeCookie('latism_session', token, { maxAge: 60 * 60 * 24 * 30 }));

    return res.status(200).json({
      user: { firstName: user.firstName, lastName: user.lastName, phone: user.phone, role: user.role }
    });
  } catch (err) {
    return res.status(500).json({ message: { fa: 'خطای سرور. دوباره تلاش کنید.', en: 'Server error. Please try again.' } });
  }
};
