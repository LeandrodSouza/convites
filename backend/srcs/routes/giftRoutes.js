const express = require('express');
const router = express.Router();
const { listGifts, selectGift, unselectGift } = require('../controllers/giftController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, listGifts);
router.post('/:giftId/select', authMiddleware, selectGift);
router.post('/:giftId/unselect', authMiddleware, unselectGift);

module.exports = router;
