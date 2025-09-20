const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const {
  createOrganization,
  getOrganization,
  updateOrganization,
  listOrganizations
} = require('../controllers/organizationController');

// Public
router.get('/', listOrganizations);
router.get('/:id', getOrganization);

// Organizer only
router.post('/', protect, authorize('org'), createOrganization);
router.put('/:id', protect, authorize('org', 'admin'), updateOrganization);

module.exports = router;
