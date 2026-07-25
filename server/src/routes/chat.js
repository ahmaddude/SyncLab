const router = require('express').Router();
const { getChatHistory } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getChatHistory);

module.exports = router;
