const router = require('express').Router();
const { generateTasks, transformText } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/generate-tasks', generateTasks);
router.post('/transform', transformText);

module.exports = router;
