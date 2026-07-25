const router = require('express').Router();
const { createOrg, getOrgs, getOrg, addMember } = require('../controllers/orgController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createOrg);
router.get('/', getOrgs);
router.get('/:id', getOrg);
router.post('/:id/members', addMember);

module.exports = router;
