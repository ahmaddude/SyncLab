const router = require('express').Router();
const {
  createDocument, getDocuments, getMyDocuments, getDocument,
  updateDocument, deleteDocument,
} = require('../controllers/documentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createDocument);
router.get('/', getDocuments);
router.get('/mine', getMyDocuments);
router.get('/:id', getDocument);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);

module.exports = router;
