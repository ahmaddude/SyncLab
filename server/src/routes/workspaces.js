const router = require('express').Router();
const { createWorkspace, getWorkspaces, getWorkspace, updateWorkspace, deleteWorkspace } = require('../controllers/workspaceController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createWorkspace);
router.get('/', getWorkspaces);
router.get('/:id', getWorkspace);
router.put('/:id', updateWorkspace);
router.delete('/:id', deleteWorkspace);

module.exports = router;
