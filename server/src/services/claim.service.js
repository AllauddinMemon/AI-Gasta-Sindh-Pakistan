const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const storageService = require('./storage.service');

const include = {
  documents: true,
  user: { select: { id: true, name: true, email: true } },
  reviewer: { select: { id: true, name: true } },
};

async function createClaim(userId, data, files = []) {
  const documents = [];
  for (const file of files) {
    const saved = await storageService.save(file);
    documents.push(saved);
  }

  return prisma.claim.create({
    data: {
      userId,
      category: data.category,
      title: data.title,
      hospitalName: data.hospitalName || null,
      amount: data.amount,
      incidentDate: data.incidentDate ? new Date(data.incidentDate) : null,
      notes: data.notes || null,
      documents: documents.length ? { create: documents } : undefined,
    },
    include,
  });
}

async function listForUser(userId) {
  return prisma.claim.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include,
  });
}

async function getById(userId, role, claimId) {
  const claim = await prisma.claim.findUnique({ where: { id: claimId }, include });
  if (!claim) throw ApiError.notFound('Claim not found');
  if (role !== 'ADMIN' && claim.userId !== userId) {
    throw ApiError.forbidden('You cannot view this claim');
  }
  return claim;
}

async function stats(userId) {
  const grouped = await prisma.claim.groupBy({
    by: ['status'],
    where: { userId },
    _count: { status: true },
  });
  const base = { PENDING: 0, APPROVED: 0, REJECTED: 0 };
  grouped.forEach((g) => { base[g.status] = g._count.status; });
  return { ...base, total: base.PENDING + base.APPROVED + base.REJECTED };
}

// ---- Admin operations ----
async function listAll(filter = {}) {
  return prisma.claim.findMany({
    where: filter,
    orderBy: { createdAt: 'desc' },
    include,
  });
}

async function review(reviewerId, claimId, { status, reviewerNotes }) {
  const claim = await prisma.claim.findUnique({ where: { id: claimId } });
  if (!claim) throw ApiError.notFound('Claim not found');

  const updated = await prisma.claim.update({
    where: { id: claimId },
    data: { status, reviewerNotes: reviewerNotes || null, reviewerId },
    include,
  });

  await prisma.notification.create({
    data: {
      userId: claim.userId,
      message: `Your claim "${claim.title}" was ${status.toLowerCase()}.`,
    },
  });

  return updated;
}

module.exports = { createClaim, listForUser, getById, stats, listAll, review };
