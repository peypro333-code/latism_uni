const bcrypt = require('bcryptjs');
const kv = require('../lib/kv');
const { signToken } = require('../lib/auth');
const { serializeCookie } = require('../lib/cookies');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: { fa: 'متد غیرمجاز.', en: 'Method not allowed.' } });
  }
  try {
    const { firstName, lastName, phone, password, inviteCode } = req.body || {};

    if (!firstName || !lastName || !phone || !password) {
      return res.status(400).json({ message: { fa: 'لطفاً همه‌ی فیلدها را پر کنید.', en: 'Please fill in all fields.' } });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: { fa: 'رمز عبور باید حداقل ۶ کاراکتر باشد.', en: 'Password must be at least 6 characters.' } });
    }

    const normalizedPhone = String(phone).trim();
    const existing = await kv.get(`user:${normalizedPhone}`);
    if (existing) {
      return res.status(409).json({ message: { fa: 'این شماره قبلاً ثبت‌نام کرده است.', en: 'This phone number is already registered.' } });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const role = (inviteCode && process.env.ADMIN_INVITE_CODE && inviteCode === process.env.ADMIN_INVITE_CODE)
      ? 'admin'
      : 'member';

    const user = {
      id: normalizedPhone,
      phone: normalizedPhone,
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      passwordHash,
      role,
      createdAt: new Date().toISOString()
    };

    await kv.set(`user:${normalizedPhone}`, user);

    const index = (await kv.get('users:index')) || [];
    if (!index.includes(normalizedPhone)) {
      index.push(normalizedPhone);
      await kv.set('users:index', index);
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
