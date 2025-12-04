const Organization = require("../models/Organization");
const Community = require("../models/Community");
const Membership = require("../models/Membership");
const Message = require("../models/Message");

// Create organization (only for organizer)
exports.createOrganization = async (req, res) => {
  try {
    if (req.user.role !== "org") {
      return res
        .status(403)
        .json({ message: "Only organizers can create organizations." });
    }
    const orgData = { ...req.body, createdBy: req.user.userId };
    const organization = await Organization.create(orgData);

    // Automatically create community for this organization
    try {
      const community = new Community({
        name: `${organization.organizationName}'s Community`,
        description: `Welcome to ${organization.organizationName}'s community! Connect with volunteers and stay updated on our environmental initiatives.`,
        organizationId: organization._id,
        adminId: req.user.userId,
      });

      await community.save();

      // Create admin membership
      const membership = new Membership({
        communityId: community._id,
        userId: req.user.userId,
        role: "admin",
        status: "active",
      });

      await membership.save();

      // Create welcome system message
      const welcomeMessage = new Message({
        communityId: community._id,
        senderId: req.user.userId,
        messageType: "system",
        content: {
          text: `Welcome to ${community.name}! This is the beginning of your community chat. Volunteers who join your events can connect with you here.`,
        },
      });

      await welcomeMessage.save();

      console.log(
        `✅ Community created for organization: ${organization.organizationName}`
      );
    } catch (communityError) {
      console.error(
        "Error creating community for organization:",
        communityError
      );
      // Don't fail the organization creation if community creation fails
    }

    res.status(201).json(organization);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get organization by ID
exports.getOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization)
      return res.status(404).json({ message: "Organization not found" });
    res.json(organization);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update organization (only creator or admin)
exports.updateOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization)
      return res.status(404).json({ message: "Organization not found" });
    if (
      organization.createdBy.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }
    Object.assign(organization, req.body);
    await organization.save();
    res.json(organization);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// List organizations (public)
exports.listOrganizations = async (req, res) => {
  try {
    const orgs = await Organization.find();
    res.json(orgs);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
