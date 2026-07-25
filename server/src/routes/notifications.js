const router = require('express').Router();
const { getNotifications, getUnreadCount, markAsRead, markOneAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getNotifications);
router.get('/unread', getUnreadCount);
router.put('/read', markAsRead);
router.put('/:id/read', markOneAsRead);

module.exports = router;
