/**
 * Storage service — an abstraction over where uploaded files live.
 * Swap STORAGE_DRIVER between "local" and "s3" without touching callers.
 * Callers only use save() / remove() / resolveLocalPath().
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const env = require('./../config/env');

const LOCAL_ROOT = path.resolve(__dirname, '..', '..', env.storage.localDir);

function ensureLocalDir() {
  if (!fs.existsSync(LOCAL_ROOT)) {
    fs.mkdirSync(LOCAL_ROOT, { recursive: true });
  }
}

/**
 * @param {{ originalname: string, buffer: Buffer, mimetype: string, size: number }} file
 * @returns {Promise<{ storageKey, fileName, mimeType, sizeBytes }>}
 */
async function save(file) {
  const safeName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${path.extname(file.originalname)}`;

  if (env.storage.driver === 's3') {
    throw new Error('S3 storage driver not configured. Set STORAGE_DRIVER=local or implement uploadToS3().');
  }

  ensureLocalDir();
  await fs.promises.writeFile(path.join(LOCAL_ROOT, safeName), file.buffer);

  return {
    storageKey: safeName,
    fileName: file.originalname,
    mimeType: file.mimetype,
    sizeBytes: file.size,
  };
}

async function remove(storageKey) {
  if (env.storage.driver === 's3') return;
  const full = resolveLocalPath(storageKey);
  if (full && fs.existsSync(full)) await fs.promises.unlink(full);
}

/**
 * Resolve a storageKey to an absolute path INSIDE the upload root.
 * Returns null if the key tries to escape the root (path-traversal guard).
 */
function resolveLocalPath(storageKey) {
  const full = path.resolve(LOCAL_ROOT, storageKey);
  if (full !== LOCAL_ROOT && !full.startsWith(LOCAL_ROOT + path.sep)) {
    return null;
  }
  return full;
}

module.exports = { save, remove, resolveLocalPath, LOCAL_ROOT };
