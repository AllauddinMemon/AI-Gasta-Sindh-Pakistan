const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const tokenService = require('./token.service');

/** Strip sensitive fields before returning a user to the client. */
function sanitize(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

async function register({ name, email, phone, cnic, password }) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { cnic }] },
  });
  if (existing) {
    throw ApiError.conflict('A user with this email or CNIC already exists.');
  }

  const passwordHash = await bcrypt.hash(password, env.bcryptSaltRounds);

  const user = await prisma.user.create({
    data: { name, email, phone, cnic, passwordHash },
  });

  return issueTokens(user);
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw ApiError.unauthorized('Invalid email or password');

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw ApiError.unauthorized('Invalid email or password');

  return issueTokens(user);
}

async function refresh(refreshToken) {
  let payload;
  try {
    payload = tokenService.verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) throw ApiError.unauthorized('User no longer exists');
  return issueTokens(user);
}

async function getProfile(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');
  return sanitize(user);
}

function issueTokens(user) {
  return {
    user: sanitize(user),
    accessToken: tokenService.signAccessToken(user),
    refreshToken: tokenService.signRefreshToken(user),
  };
}

module.exports = { register, login, refresh, getProfile };
