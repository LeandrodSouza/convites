const express = require('express');
const router = express.Router();
const { listGifts, selectGift } = require('../controllers/giftController');

router.get('/', listGifts);
router.post('/:giftId/select', selectGift);

module.exports = router;
