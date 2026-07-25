const router = require('express').Router();
const {
  createDocument, getDocuments, getDocument,
  updateDocument, deleteDocument,
} = require('../controllers/documentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createDocument);
router.get('/', getDocuments);
router.get('/:id', getDocument);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);

module.exports = router;
