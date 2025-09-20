const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    organizationName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    zipCode: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    foundedYear: {
      type: Number,
      required: true,
      min: 1800,
      max: new Date().getFullYear(),
    },
    teamSize: {
      type: String,
      required: true,
      enum: ["1-10", "11-50", "51-200", "201-1000", "1000+"],
    },
    mission: {
      type: String,
      required: true,
      trim: true,
    },
    specializations: {
      type: String,
      trim: true,
    },
    logo: {
      type: String, // URL to logo image
      trim: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    eventsHosted: {
      type: Number,
      default: 0,
    },
    totalVolunteers: {
      type: Number,
      default: 0,
    },
    impactMetrics: {
      wasteCollected: {
        type: Number,
        default: 0, // in kg
      },
      coastlineCleaned: {
        type: Number,
        default: 0, // in km
      },
      volunteersEngaged: {
        type: Number,
        default: 0,
      },
    },
    socialMedia: {
      facebook: {
        type: String,
        trim: true,
      },
      twitter: {
        type: String,
        trim: true,
      },
      instagram: {
        type: String,
        trim: true,
      },
      linkedin: {
        type: String,
        trim: true,
      },
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
// Note: userId already has an index due to unique: true, so we don't need to add it again
organizationSchema.index({ organizationName: "text", description: "text" });
organizationSchema.index({ city: 1, state: 1 });
organizationSchema.index({ verified: 1 });

// Virtual for full address
organizationSchema.virtual("fullAddress").get(function () {
  return `${this.address}, ${this.city}, ${this.state} ${this.zipCode}, ${this.country}`;
});

// Method to calculate organization rating based on events and feedback
organizationSchema.methods.calculateRating = function () {
  // This would be implemented based on event ratings and volunteer feedback
  // For now, return a placeholder
  return 4.5;
};

// Method to update impact metrics
organizationSchema.methods.updateImpactMetrics = function (
  wasteKg,
  coastlineKm,
  volunteers
) {
  this.impactMetrics.wasteCollected += wasteKg || 0;
  this.impactMetrics.coastlineCleaned += coastlineKm || 0;
  this.impactMetrics.volunteersEngaged += volunteers || 0;
  return this.save();
};

// Static method to find organizations by location
organizationSchema.statics.findByLocation = function (city, state) {
  return this.find({
    city: new RegExp(city, "i"),
    state: new RegExp(state, "i"),
  });
};

// Static method to search organizations
organizationSchema.statics.searchOrganizations = function (searchTerm) {
  return this.find({
    $text: { $search: searchTerm },
  });
};

const Organization = mongoose.model("Organization", organizationSchema);

module.exports = Organization;
