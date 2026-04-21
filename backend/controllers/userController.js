const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const sendEmail = require('../utils/mailer');

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
    const { name, email, password, role: requestedRole } = req.body;
    const userExists = await User.findOne({ email });
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
      role: finalRole
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
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.loginOtp = otp;
      await user.save();

      // 2. Use the utility instead of writing the whole transporter here
      await sendEmail({
        to: email,
        subject: 'Your FreshCurator Login OTP',
        html: `<h3>Your Login OTP is: <b>${otp}</b></h3><br/><p>Please enter this to access your account.</p>`,
      });

      res.json({ success: true, message: 'OTP Sent' });
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
    const { email, password, role, otp } = req.body;
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      // Opt-in OTP Verification
      if (otp) {
        if (user.loginOtp !== otp) {
          return res.status(401).json({ error: 'Invalid OTP code' });
        }
        user.loginOtp = null; // Clear OTP after success
        await user.save();
      } else {
        return res.status(401).json({ error: 'OTP is required' });
      }

      if (role && user.role !== role) {
        return res.status(401).json({ error: `Not authorized as ${role}` });
      }
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
      user.email = req.body.email || user.email;
      user.profileImage = req.body.profileImage || user.profileImage;
      if (req.body.password) {
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
    const { email, name, role, profileImage } = req.body;
    let user = await User.findOne({ email });

    if (!user) {
      // First-user setup policy: if no users exist, the first one is Admin
      const userCount = await User.countDocuments();
      let finalRole = userCount === 0 ? 'Admin' : (role || 'User');

      user = await User.create({
        name,
        email,
        role: finalRole,
        profileImage,
        password: await bcrypt.hash(Math.random().toString(36), 10) // Random password for social users
      });
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
