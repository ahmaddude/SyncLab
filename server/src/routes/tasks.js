const router = require('express').Router();
const {
  createTask, getTasks, getTask, updateTask,
  reorderTasks, deleteTask, addComment, deleteComment,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createTask);
router.get('/', getTasks);
router.put('/reorder/batch', reorderTasks);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.post('/:id/comments', addComment);
router.delete('/:taskId/comments/:commentId', deleteComment);

module.exports = router;
