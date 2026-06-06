const fs = require('fs');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const documentService = require('../services/document.service');
const storageService = require('../services/storage.service');

const download = catchAsync(async (req, res) => {
  const document = await documentService.getAccessible(req.user.id, req.user.role, req.params.id);

  const absPath = storageService.resolveLocalPath(document.storageKey);
  if (!absPath || !fs.existsSync(absPath)) {
    throw ApiError.notFound('File is no longer available');
  }

  res.setHeader('Content-Type', document.mimeType);
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(document.fileName)}"`);
  fs.createReadStream(absPath).pipe(res);
});

module.exports = { download };
