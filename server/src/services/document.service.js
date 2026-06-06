const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

/**
 * Fetch a document only if it belongs to the requesting user (or an admin).
 * Enforces access control before any file is read from disk.
 */
async function getAccessible(userId, role, documentId) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { claim: { select: { userId: true } } },
  });

  if (!document) throw ApiError.notFound('Document not found');
  if (role !== 'ADMIN' && document.claim.userId !== userId) {
    throw ApiError.forbidden('You cannot access this document');
  }
  return document;
}

module.exports = { getAccessible };
