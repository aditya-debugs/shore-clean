const express = require("express");
const router = express.Router();
const Organization = require("../models/Organization");
const User = require("../models/User");
const { protect, authorize } = require("../middlewares/authMiddleware");

// @route   POST /api/organizations/profile
// @desc    Create or update organization profile
// @access  Private (Organization only)
router.post("/profile", protect, authorize("org"), async (req, res) => {
  try {
    console.log("=== Organization Profile Creation/Update ===");
    console.log("User ID:", req.user.userId);
    console.log("User Role:", req.user.role);
    console.log("Request Body:", req.body);

    const {
      organizationName,
      description,
      address,
      city,
      state,
      zipCode,
      country,
      phone,
      website,
      foundedYear,
      teamSize,
      mission,
      specializations,
      socialMedia,
      contactEmail,
    } = req.body;

    // Validate required fields
    if (
      !organizationName ||
      !description ||
      !address ||
      !city ||
      !state ||
      !zipCode ||
      !country ||
      !phone
    ) {
      console.log("Missing required fields");
      return res.status(400).json({
        message: "Missing required fields",
        required: [
          "organizationName",
          "description",
          "address",
          "city",
          "state",
          "zipCode",
          "country",
          "phone",
        ],
      });
    }

    // Check if organization profile already exists
    console.log("Checking for existing organization...");
    let organization = await Organization.findOne({ userId: req.user.userId });
    console.log("Existing organization:", organization ? "Found" : "Not found");

    if (organization) {
      // Update existing organization
      console.log("Updating existing organization...");
      organization = await Organization.findOneAndUpdate(
        { userId: req.user.userId },
        {
          organizationName,
          description,
          address,
          city,
          state,
          zipCode,
          country,
          phone,
          website,
          foundedYear,
          teamSize,
          mission,
          specializations,
          socialMedia,
          contactEmail,
        },
        { new: true, runValidators: true }
      );
      console.log("Organization updated successfully");
    } else {
      // Create new organization profile
      console.log("Creating new organization...");
      organization = new Organization({
        userId: req.user.userId,
        organizationName,
        description,
        address,
        city,
        state,
        zipCode,
        country,
        phone,
        website,
        foundedYear,
        teamSize,
        mission,
        specializations,
        socialMedia,
        contactEmail,
      });

      await organization.save();
      console.log("Organization created successfully");
    }

    // Update user's hasCompletedProfile flag
    console.log("Updating user hasCompletedProfile flag...");
    await User.findByIdAndUpdate(req.user.userId, {
      hasCompletedProfile: true,
    });
    console.log("User updated successfully");

    console.log("=== Success ===");
    res.status(200).json(organization);
  } catch (error) {
    console.error("=== Error in organization profile creation/update ===");
    console.error("Error details:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    // Check for specific error types
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation Error",
        errors: Object.keys(error.errors).map((key) => ({
          field: key,
          message: error.errors[key].message,
        })),
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Organization profile already exists for this user",
      });
    }

    res.status(500).json({
      message: "Error saving organization profile",
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// @route   GET /api/organizations/profile/:userId
// @desc    Get organization profile by user ID
// @access  Public
router.get("/profile/:userId", async (req, res) => {
  try {
    const organization = await Organization.findOne({
      userId: req.params.userId,
    }).populate("userId", "name email");

    if (!organization) {
      return res
        .status(404)
        .json({ message: "Organization profile not found" });
    }

    res.json(organization);
  } catch (error) {
    console.error("Error fetching organization profile:", error);
    res.status(500).json({
      message: "Error fetching organization profile",
      error: error.message,
    });
  }
});

// @route   GET /api/organizations/my-profile
// @desc    Get current user's organization profile
// @access  Private (Organization only)
router.get("/my-profile", protect, authorize("org"), async (req, res) => {
  try {
    const organization = await Organization.findOne({
      userId: req.user.userId,
    }).populate("userId", "name email");

    if (!organization) {
      return res
        .status(404)
        .json({ message: "Organization profile not found" });
    }

    res.json(organization);
  } catch (error) {
    console.error("Error fetching organization profile:", error);
    res.status(500).json({
      message: "Error fetching organization profile",
      error: error.message,
    });
  }
});

// @route   GET /api/organizations
// @desc    Get all organizations with pagination and filtering
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 12, city, state, search, verified } = req.query;

    const query = {};

    // Add location filters
    if (city) query.city = new RegExp(city, "i");
    if (state) query.state = new RegExp(state, "i");
    if (verified !== undefined) query.verified = verified === "true";

    let organizations;
    if (search) {
      // Text search
      organizations = await Organization.find({
        ...query,
        $text: { $search: search },
      })
        .populate("userId", "name email")
        .sort({ score: { $meta: "textScore" } })
        .limit(limit * 1)
        .skip((page - 1) * limit);
    } else {
      organizations = await Organization.find(query)
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
    }

    const total = await Organization.countDocuments(query);

    res.json({
      organizations,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    res.status(500).json({
      message: "Error fetching organizations",
      error: error.message,
    });
  }
});

// @route   GET /api/organizations/:id
// @desc    Get organization by ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id).populate(
      "userId",
      "name email"
    );

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.json(organization);
  } catch (error) {
    console.error("Error fetching organization:", error);
    res.status(500).json({
      message: "Error fetching organization",
      error: error.message,
    });
  }
});

// @route   PUT /api/organizations/:id/verify
// @desc    Verify an organization (Admin only)
// @access  Private (Admin only)
router.put("/:id/verify", protect, authorize("admin"), async (req, res) => {
  try {
    const organization = await Organization.findByIdAndUpdate(
      req.params.id,
      { verified: true },
      { new: true }
    );

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.json(organization);
  } catch (error) {
    console.error("Error verifying organization:", error);
    res.status(500).json({
      message: "Error verifying organization",
      error: error.message,
    });
  }
});

// @route   PUT /api/organizations/impact-metrics
// @desc    Update organization impact metrics
// @access  Private (Organization only)
router.put("/impact-metrics", protect, authorize("org"), async (req, res) => {
  try {
    const { wasteCollected, coastlineCleaned, volunteersEngaged } = req.body;

    const organization = await Organization.findOne({
      userId: req.user.userId,
    });

    if (!organization) {
      return res
        .status(404)
        .json({ message: "Organization profile not found" });
    }

    await organization.updateImpactMetrics(
      wasteCollected,
      coastlineCleaned,
      volunteersEngaged
    );

    res.json(organization);
  } catch (error) {
    console.error("Error updating impact metrics:", error);
    res.status(500).json({
      message: "Error updating impact metrics",
      error: error.message,
    });
  }
});

// @route   GET /api/organizations/search/:term
// @desc    Search organizations by text
// @access  Public
router.get("/search/:term", async (req, res) => {
  try {
    const organizations = await Organization.searchOrganizations(
      req.params.term
    )
      .populate("userId", "name email")
      .limit(20);

    res.json(organizations);
  } catch (error) {
    console.error("Error searching organizations:", error);
    res.status(500).json({
      message: "Error searching organizations",
      error: error.message,
    });
  }
});

// @route   GET /api/organizations/location/:city/:state
// @desc    Get organizations by location
// @access  Public
router.get("/location/:city/:state", async (req, res) => {
  try {
    const { city, state } = req.params;
    const organizations = await Organization.findByLocation(
      city,
      state
    ).populate("userId", "name email");

    res.json(organizations);
  } catch (error) {
    console.error("Error fetching organizations by location:", error);
    res.status(500).json({
      message: "Error fetching organizations by location",
      error: error.message,
    });
  }
});

module.exports = router;
