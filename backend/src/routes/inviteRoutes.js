const express = require('express');
const router = express.Router();
const { verifyInvite, useInvite, confirmPresence } = require('../controllers/inviteController');

router.get('/:token', verifyInvite);
router.post('/:token/use', useInvite);
router.post('/:token/confirm', confirmPresence);

module.exports = router;
