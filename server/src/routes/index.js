const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/claims', require('./claim.routes'));
router.use('/documents', require('./document.routes'));
router.use('/ai', require('./ai.routes'));
router.use('/notifications', require('./notification.routes'));

router.get('/health', (req, res) =>
  res.json({ success: true, status: 'ok', service: 'gasta-ai-api' })
);

module.exports = router;
