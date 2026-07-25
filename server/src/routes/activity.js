const router = require('express').Router();
const { getProjectActivity } = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getProjectActivity);

module.exports = router;
