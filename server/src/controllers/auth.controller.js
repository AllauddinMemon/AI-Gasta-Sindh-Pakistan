const catchAsync = require('../utils/catchAsync');
const authService = require('../services/auth.service');

const register = catchAsync(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, ...result });
});

const login = catchAsync(async (req, res) => {
  const result = await authService.login(req.body);
  res.json({ success: true, ...result });
});

const refresh = catchAsync(async (req, res) => {
  const result = await authService.refresh(req.body.refreshToken);
  res.json({ success: true, ...result });
});

const me = catchAsync(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  res.json({ success: true, user });
});

module.exports = { register, login, refresh, me };
