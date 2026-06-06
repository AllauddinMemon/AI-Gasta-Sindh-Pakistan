const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const claimService = require('../services/claim.service');

const create = catchAsync(async (req, res) => {
  const claim = await claimService.createClaim(req.user.id, req.body, req.files || []);
  res.status(201).json({ success: true, claim });
});

const listMine = catchAsync(async (req, res) => {
  const claims = await claimService.listForUser(req.user.id);
  res.json({ success: true, claims });
});

const getOne = catchAsync(async (req, res) => {
  const claim = await claimService.getById(req.user.id, req.user.role, req.params.id);
  res.json({ success: true, claim });
});

const myStats = catchAsync(async (req, res) => {
  const stats = await claimService.stats(req.user.id);
  res.json({ success: true, stats });
});

// Admin
const VALID_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];

const listAll = catchAsync(async (req, res) => {
  const { status } = req.query;
  if (status && !VALID_STATUSES.includes(status)) {
    throw ApiError.badRequest('Invalid status filter');
  }
  const filter = status ? { status } : {};
  const claims = await claimService.listAll(filter);
  res.json({ success: true, claims });
});

const review = catchAsync(async (req, res) => {
  const claim = await claimService.review(req.user.id, req.params.id, req.body);
  res.json({ success: true, claim });
});

module.exports = { create, listMine, getOne, myStats, listAll, review };
