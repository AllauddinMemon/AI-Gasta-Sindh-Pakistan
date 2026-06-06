const prisma = require('../config/prisma');

async function list(userId) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

async function markRead(userId, id) {
  await prisma.notification.updateMany({
    where: { id, userId },
    data: { read: true },
  });
  return list(userId);
}

async function markAllRead(userId) {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
  return list(userId);
}

module.exports = { list, markRead, markAllRead };
