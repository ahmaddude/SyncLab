const router = require('express').Router();
const { createProject, getProjects, getMyProjects, getProject, updateProject, deleteProject } = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createProject);
router.get('/', getProjects);
router.get('/mine', getMyProjects);
router.get('/:id', getProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

module.exports = router;
