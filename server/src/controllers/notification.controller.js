const catchAsync = require('../utils/catchAsync');
const notificationService = require('../services/notification.service');

const list = catchAsync(async (req, res) => {
  const notifications = await notificationService.list(req.user.id);
  res.json({ success: true, notifications });
});

const markRead = catchAsync(async (req, res) => {
  const notifications = await notificationService.markRead(req.user.id, req.params.id);
  res.json({ success: true, notifications });
});

const markAllRead = catchAsync(async (req, res) => {
  const notifications = await notificationService.markAllRead(req.user.id);
  res.json({ success: true, notifications });
});

module.exports = { list, markRead, markAllRead };
