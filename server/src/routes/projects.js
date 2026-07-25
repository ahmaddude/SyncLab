const router = require('express').Router();
const { createProject, getProjects, getProject, updateProject } = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', getProject);
router.put('/:id', updateProject);

module.exports = router;
