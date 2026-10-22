const test = require('node:test');
const assert = require('node:assert/strict');

process.env.OTP_SECRET = 'test-only-key-for-unit-tests';

const { otpDigest, otpMatches } = require('../controllers/orderController');
const { socialSync } = require('../controllers/userController');
const Order = require('../models/Order');
const User = require('../models/User');

test('delivery OTPs are stored as a keyed digest and match only their source code', () => {
  const digest = otpDigest('482901');
  assert.notEqual(digest, '482901');
  assert.equal(digest.length, 64);
  assert.equal(otpMatches(digest, '482901'), true);
  assert.equal(otpMatches(digest, '482902'), false);
});

test('login and delivery OTP fields are excluded from ordinary model queries', () => {
  assert.equal(User.schema.path('loginOtp').options.select, false);
  assert.equal(Order.schema.path('deliveryOtp').options.select, false);
  assert.equal(Order.schema.path('deliveryOtpAttempts').options.select, false);
});

test('Google social sync rejects a token Google does not validate', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => new Response('', { status: 401 });
  const response = makeResponse();

  try {
    await socialSync({ body: { email: 'victim@example.com', role: 'Admin', googleAccessToken: 'invalid' } }, response);
    assert.equal(response.statusCode, 401);
    assert.match(response.body.error, /Google sign-in could not be verified/);
  } finally {
    global.fetch = originalFetch;
  }
});

test('Google social sync uses verified identity and ignores a caller-selected admin role', async () => {
  const User = require('../models/User');
  const originalFetch = global.fetch;
  const originalFindOne = User.findOne;
  const originalCountDocuments = User.countDocuments;
  const originalCreate = User.create;
  let createdUser;
  global.fetch = async () => new Response(JSON.stringify({
    sub: 'google-subject-1',
    email: 'verified@example.com',
    email_verified: true,
    name: 'Verified Person',
    picture: 'https://example.test/avatar.png'
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  User.findOne = async () => null;
  User.countDocuments = async () => 1;
  User.create = async (user) => {
    createdUser = { ...user, _id: 'test-user-id' };
    return createdUser;
  };
  const response = makeResponse();

  try {
    await socialSync({ body: {
      email: 'verified@example.com',
      role: 'Admin',
      googleAccessToken: 'valid-test-token'
    } }, response);
    assert.equal(response.statusCode, 200);
    assert.equal(createdUser.email, 'verified@example.com');
    assert.equal(createdUser.role, 'User');
    assert.equal(response.body.role, 'User');
    assert.equal(createdUser.profileImage, 'https://example.test/avatar.png');
  } finally {
    global.fetch = originalFetch;
    User.findOne = originalFindOne;
    User.countDocuments = originalCountDocuments;
    User.create = originalCreate;
  }
});

function makeResponse() {
  return {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
}
