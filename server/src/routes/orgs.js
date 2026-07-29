const router = require('express').Router();
const { createOrg, getOrgs, getOrg, updateOrg, deleteOrg, addMember, removeMember, updateMemberRole } = require('../controllers/orgController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createOrg);
router.get('/', getOrgs);
router.get('/:id', getOrg);
router.put('/:id', updateOrg);
router.delete('/:id', deleteOrg);
router.post('/:id/members', addMember);
router.delete('/:id/members/:memberId', removeMember);
router.put('/:id/members/:memberId', updateMemberRole);

module.exports = router;
