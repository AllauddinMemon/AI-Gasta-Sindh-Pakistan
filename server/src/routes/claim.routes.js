const router = require('express').Router();
const validate = require('../middleware/validate.middleware');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const ctrl = require('../controllers/claim.controller');
const { createClaimSchema, reviewClaimSchema } = require('../validators/claim.validator');

router.use(authenticate);

// Teacher routes
router.post('/', upload.array('documents', 5), validate(createClaimSchema), ctrl.create);
router.get('/', ctrl.listMine);
router.get('/stats', ctrl.myStats);
router.get('/:id', ctrl.getOne);

// Admin routes
router.get('/admin/all', authorize('ADMIN'), ctrl.listAll);
router.patch('/admin/:id/review', authorize('ADMIN'), validate(reviewClaimSchema), ctrl.review);

module.exports = router;
