const Organization = require('../models/Organization');

// Create organization (only for organizer)
exports.createOrganization = async (req, res) => {
  try {
    if (req.user.role !== 'org') {
      return res.status(403).json({ message: 'Only organizers can create organizations.' });
    }
    const orgData = { ...req.body, createdBy: req.user.userId };
    const organization = await Organization.create(orgData);
    res.status(201).json(organization);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get organization by ID
exports.getOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization) return res.status(404).json({ message: 'Organization not found' });
    res.json(organization);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update organization (only creator or admin)
exports.updateOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization) return res.status(404).json({ message: 'Organization not found' });
    if (organization.createdBy.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    Object.assign(organization, req.body);
    await organization.save();
    res.json(organization);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// List organizations (public)
exports.listOrganizations = async (req, res) => {
  try {
    const orgs = await Organization.find();
    res.json(orgs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
