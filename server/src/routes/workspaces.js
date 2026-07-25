const router = require('express').Router();
const { createWorkspace, getWorkspaces, getWorkspace } = require('../controllers/workspaceController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createWorkspace);
router.get('/', getWorkspaces);
router.get('/:id', getWorkspace);

module.exports = router;
