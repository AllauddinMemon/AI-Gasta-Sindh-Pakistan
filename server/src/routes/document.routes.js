const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/document.controller');

router.use(authenticate);
router.get('/:id/download', ctrl.download);

module.exports = router;
