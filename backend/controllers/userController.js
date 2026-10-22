const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/mailer');
const crypto = require('crypto');

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const emailFilter = (email) => ({ email: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
const otpDigest = (otp) => {
  const secret = process.env.OTP_SECRET || process.env.JWT_SECRET;
  if (!secret) throw new Error('OTP_SECRET or JWT_SECRET must be configured.');
  return crypto.createHmac('sha256', secret).update(String(otp)).digest('hex');
};
const otpMatches = (saved, provided) => {
  if (!saved) return false;
  const expected = Buffer.from(saved, 'hex');
  const actual = Buffer.from(otpDigest(provided), 'hex');
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const checkAdminExists = async (req, res) => {
  try {
    const admin = await User.findOne({ role: 'Admin' });
    res.json({ hasAdmin: !!admin });
  } catch (err) {
    res.status(500).json({ hasAdmin: false, error: err.message });
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, password } = req.body;
    const email = normalizeEmail(req.body.email);
    const requestedRole = req.body.role === 'Delivery Boy' ? 'Delivery Boy' : 'User';
    if (!name?.trim() || !/^\S+@\S+\.\S+$/.test(email) || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Enter a name, valid email, and password of at least 8 characters.' });
    }
    const userExists = await User.findOne(emailFilter(email));
    if (userExists) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    // First-user setup policy: if no users exist, the first one is Admin
    const userCount = await User.countDocuments();
    let finalRole = userCount === 0 ? 'Admin' : requestedRole;

    if (finalRole === 'Admin' && userCount > 0) {
      const adminExists = await User.findOne({ role: 'Admin' });
      if (adminExists) {
        return res.status(403).json({ error: 'Administrative limit reached. Cannot register multiple admins.' });
      }
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: finalRole,
      authProvider: 'credentials'
    });

    res.status(201).json({
      message: 'User registered',
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// const sendLoginOtp = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (user && (await bcrypt.compare(password, user.password))) {
//       const otp = Math.floor(100000 + Math.random() * 900000).toString();
//       user.loginOtp = otp;
//       await user.save();

//       const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: { user: process.env.EMAIL, pass: process.env.PASS }
//       });
//       await transporter.sendMail({
//         from: `"FreshCurator Security" <${process.env.EMAIL}>`,
//         to: email,
//         subject: 'Your FreshCurator Login OTP',
//         html: `<h3>Your Login OTP is: <b>${otp}</b></h3><br/><p>Please enter this to access your account.</p>`,
//       });

//       res.json({ success: true, message: 'OTP Sent' });
//     } else {
//       res.status(401).json({ error: 'Invalid email or password' });
//     }
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
const sendLoginOtp = async (req, res) => {
  try {
    const { password } = req.body;
    const email = normalizeEmail(req.body.email);
    if (!email || typeof password !== 'string') return res.status(400).json({ error: 'Email and password are required.' });
    const user = await User.findOne(emailFilter(email)).select('+loginOtp +loginOtpExpiresAt +loginOtpAttempts +loginOtpLastSentAt');

    if (user?.authProvider === 'google') {
      return res.status(400).json({ error: 'This account uses Google sign-in. Choose “Continue with Google” to access it.' });
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      if (user.loginOtpLastSentAt && Date.now() - user.loginOtpLastSentAt.getTime() < 60_000) {
        return res.status(429).json({ error: 'Please wait before requesting another verification code.' });
      }
      const otp = crypto.randomInt(100000, 1000000).toString();
      user.loginOtp = otpDigest(otp);
      user.loginOtpExpiresAt = new Date(Date.now() + 10 * 60_000);
      user.loginOtpAttempts = 0;
      user.loginOtpLastSentAt = new Date();
      await user.save();

      // 2. Use the utility instead of writing the whole transporter here
      try { await sendEmail({
        to: email,
        subject: 'Your FreshCurator Login OTP',
        html: `<h3>Your Login OTP is: <b>${otp}</b></h3><br/><p>Please enter this to access your account.</p>`,
      }); } catch (emailError) {
        user.loginOtp = null;
        user.loginOtpExpiresAt = null;
        await user.save();
        return res.status(503).json({ error: 'We could not send the verification email. Check the email service configuration and try again later.' });
      }

      res.json({ success: true, message: 'Verification code sent.' });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (err) {
    console.error("Login OTP Error:", err);
    res.status(500).json({ error: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { password, role, otp } = req.body;
    const email = normalizeEmail(req.body.email);
    if (!email || typeof password !== 'string' || typeof otp !== 'string') return res.status(400).json({ error: 'Email, password, and verification code are required.' });
    const user = await User.findOne(emailFilter(email)).select('+loginOtp +loginOtpExpiresAt +loginOtpAttempts');
    if (user && (await bcrypt.compare(password, user.password))) {
      if (!otp || !user.loginOtp || !user.loginOtpExpiresAt || user.loginOtpExpiresAt <= new Date()) {
        return res.status(401).json({ error: 'Verification code is missing or expired. Request a new code.' });
      }
      if ((user.loginOtpAttempts || 0) >= 5) {
        return res.status(429).json({ error: 'Too many incorrect attempts. Request a new code.' });
      }
      user.loginOtpAttempts = (user.loginOtpAttempts || 0) + 1;
      if (!otpMatches(user.loginOtp, otp)) {
        await user.save();
        return res.status(401).json({ error: 'Invalid verification code' });
      }

      if (role && user.role !== role) {
        return res.status(401).json({ error: `Not authorized as ${role}` });
      }
      user.loginOtp = null;
      user.loginOtpExpiresAt = null;
      user.loginOtpAttempts = 0;
      await user.save();
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      if (req.body.email) {
        const email = normalizeEmail(req.body.email);
        if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
        const duplicate = await User.findOne({ ...emailFilter(email), _id: { $ne: user._id } });
        if (duplicate) return res.status(409).json({ error: 'That email address is already in use.' });
        user.email = email;
      }
      user.profileImage = req.body.profileImage || user.profileImage;
      if (req.body.password) {
        if (typeof req.body.password !== 'string' || req.body.password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
        user.password = await bcrypt.hash(req.body.password, 10);
      }
      const updated = await user.save();
      res.json({
        _id: updated._id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        profileImage: updated.profileImage,
        token: generateToken(updated._id)
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, select: '-password' });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const socialSync = async (req, res) => {
  try {
    const { googleAccessToken } = req.body || {};
    if (typeof googleAccessToken !== 'string' || !googleAccessToken) {
      return res.status(401).json({ error: 'Verified Google sign-in is required.' });
    }
    const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${googleAccessToken}` },
      signal: AbortSignal.timeout(8000)
    });
    if (!googleResponse.ok) return res.status(401).json({ error: 'Google sign-in could not be verified.' });
    const googleUser = await googleResponse.json();
    const email = normalizeEmail(googleUser.email);
    if (!googleUser.sub || googleUser.email_verified !== true || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(401).json({ error: 'A verified Google account email is required.' });
    }
    if (req.body.email && normalizeEmail(req.body.email) !== email) {
      return res.status(401).json({ error: 'Google account details did not match.' });
    }
    const name = typeof googleUser.name === 'string' && googleUser.name.trim()
      ? googleUser.name.trim()
      : email.split('@')[0];
    const profileImage = typeof googleUser.picture === 'string' ? googleUser.picture : '';
    let user = await User.findOne(emailFilter(email));

    if (!user) {
      // First-user setup policy: if no users exist, the first one is Admin
      const userCount = await User.countDocuments();
      let finalRole = userCount === 0 ? 'Admin' : 'User';

      user = await User.create({
        name,
        email,
        role: finalRole,
        profileImage,
        authProvider: 'google',
        password: await bcrypt.hash(Math.random().toString(36), 10) // Random password for social users
      });
    } else {
      user.authProvider = 'google';
      if (typeof name === 'string' && name.trim()) user.name = name.trim();
      if (profileImage) user.profileImage = profileImage;
      await user.save();
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getUsers,
  checkAdminExists,
  registerUser,
  sendLoginOtp,
  loginUser,
  updateUserRole,
  updateProfile,
  socialSync
};
