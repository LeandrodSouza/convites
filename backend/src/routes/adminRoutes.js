const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const {
  generateInvite,
  addGift,
  updateGift,
  deleteGift,
  listAllInvites,
  listAllGifts,
  getEmailLogs
} = require('../controllers/adminController');

// All admin routes require authentication and admin privileges
router.use(verifyToken);
router.use(isAdmin);

router.post('/invites/generate', generateInvite);
router.post('/gifts', addGift);
router.put('/gifts/:giftId', updateGift);
router.delete('/gifts/:giftId', deleteGift);
router.get('/invites', listAllInvites);
router.get('/gifts', listAllGifts);
router.get('/email-logs', getEmailLogs);

module.exports = router;
