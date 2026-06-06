const router = require('express').Router();
const validate = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/ai.controller');
const { chatSchema } = require('../validators/claim.validator');

router.use(authenticate);
router.post('/chat', validate(chatSchema), ctrl.chat);
router.get('/required-docs/:category', ctrl.docs);

module.exports = router;
