const Property = require("../models/Property");
const uploadToCloudinary = require("../utils/uploadToCloudinary");
const calculateDistance = require("../utils/distance");

// ===============================
// CREATE PROPERTY
// ===============================

const createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      rent,
      securityDeposit,
      address,
      city,
      area,
      latitude,
      longitude,
      amenities,
      availableFrom,
    } = req.body;

    if (!title || !description || !type || !rent || !address || !city) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const imageUrls = [];

    // Upload images to Cloudinary
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer);
        imageUrls.push(result.secure_url);
      }
    }

    const property = await Property.create({
      owner: req.user.userId,
      title,
      description,
      type,
      rent,
      securityDeposit,
      address,
      city,
      area,
       location: {
       latitude: Number(latitude),
       longitude: Number(longitude),
       },
      amenities,
      images: imageUrls,
      availableFrom,
    });

    res.status(201).json({
      success: true,
      message: "Property created successfully",
      property,
    });
  } catch (error) {
    console.error("Create property error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// GET ALL APPROVED PROPERTIES
// ===============================

const getProperties = async (req, res) => {
  try {
    const { location, type, maxRent } = req.query;

    const filter = {
      status: "approved",
    };

    // Search by city or area
    if (location) {
      filter.$or = [
        {
          city: {
            $regex: location,
            $options: "i",
          },
        },
        {
          area: {
            $regex: location,
            $options: "i",
          },
        },
      ];
    }

    // Filter by property type
    if (type) {
      filter.type = type;
    }

    // Filter by maximum rent
    if (maxRent) {
      filter.rent = {
        $lte: Number(maxRent),
      };
    }

    let sortOption = { createdAt: -1 };

    if (req.query.sort === "rent_asc") {
    sortOption = { rent: 1 };
    }

    if (req.query.sort === "rent_desc") {
    sortOption = { rent: -1 };
    }

    const properties = await Property.find(filter)
    .populate("owner", "name email phone")
    .sort(sortOption);

    res.status(200).json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    console.error("Get properties error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getNearbyProperties = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const userLatitude = Number(latitude);
    const userLongitude = Number(longitude);
    const distanceLimit = maxDistance
      ? Number(maxDistance)
      : 10;

    if (
      Number.isNaN(userLatitude) ||
      Number.isNaN(userLongitude)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid coordinates",
      });
    }

    const properties = await Property.find({
      status: "approved",
      "location.latitude": { $exists: true },
      "location.longitude": { $exists: true },
    })
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 });

    const nearbyProperties = properties
      .map((property) => {
        const distance = calculateDistance(
          userLatitude,
          userLongitude,
          property.location.latitude,
          property.location.longitude
        );

        return {
          ...property.toObject(),
          distance: Number(distance.toFixed(2)),
        };
      })
      .filter(
        (property) => property.distance <= distanceLimit
      )
      .sort((a, b) => a.distance - b.distance);

    res.status(200).json({
      success: true,
      count: nearbyProperties.length,
      properties: nearbyProperties,
    });
  } catch (error) {
    console.error(
      "Get nearby properties error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ===============================
// GET PROPERTY BY ID
// PUBLIC - APPROVED ONLY
// ===============================

const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      status: "approved",
    }).populate("owner", "name email phone");

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    res.status(200).json({
      success: true,
      property,
    });
  } catch (error) {
    console.error("Get property error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ===============================
// GET OWNER'S PROPERTIES
// ===============================

const getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({
      owner: req.user.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    console.error("Get my properties error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ===============================
// GET PENDING PROPERTIES
// ADMIN ONLY
// ===============================

const getPendingProperties = async (req, res) => {
  try {
    const properties = await Property.find({
      status: "pending",
    })
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    console.error("Get pending properties error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ===============================
// APPROVE / REJECT PROPERTY
// ADMIN ONLY
// ===============================

const updatePropertyStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected",
      });
    }

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Property ${status} successfully`,
      property,
    });
  } catch (error) {
    console.error("Update property status error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ===============================
// UPDATE PROPERTY
// OWNER ONLY
// ===============================

const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Make sure the logged-in owner owns this property
    if (property.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own properties",
      });
    }

    const {
      title,
      description,
      type,
      rent,
      securityDeposit,
      address,
      city,
      area,
      amenities,
      availableFrom,
    } = req.body;

    // Update normal fields
    property.title = title ?? property.title;
    property.description = description ?? property.description;
    property.type = type ?? property.type;
    property.rent = rent ?? property.rent;
    property.securityDeposit =
      securityDeposit ?? property.securityDeposit;
    property.address = address ?? property.address;
    property.city = city ?? property.city;
    property.area = area ?? property.area;
    property.availableFrom =
      availableFrom ?? property.availableFrom;

    // Update amenities
    if (amenities !== undefined) {
      try {
        property.amenities = JSON.parse(amenities);
      } catch {
        property.amenities = property.amenities;
      }
    }

    // Upload new images to Cloudinary
    if (req.files && req.files.length > 0) {
      const newImageUrls = [];

      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer);

        newImageUrls.push(result.secure_url);
      }

      // Keep existing images and add new images
      property.images = [
        ...property.images,
        ...newImageUrls,
      ];
    }

    // Owner edits require admin approval again
    property.status = "pending";

    const updatedProperty = await property.save();

    res.status(200).json({
      success: true,
      message: "Property updated successfully",
      property: updatedProperty,
    });
  } catch (error) {
    console.error("Update property error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// ===============================
// DELETE PROPERTY
// OWNER ONLY
// ===============================

const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Make sure the logged-in owner owns this property
    if (property.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own properties",
      });
    }

    await Property.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.error("Delete property error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ===============================
// GET OWNER PROPERTY BY ID
// OWNER ONLY
// ===============================

const getMyPropertyById = async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      owner: req.user.userId,
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    res.status(200).json({
      success: true,
      property,
    });
  } catch (error) {
    console.error("Get my property error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// REMOVE PROPERTY IMAGE
const removePropertyImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Image URL is required",
      });
    }

    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Check ownership
    if (property.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You can only modify your own property",
      });
    }

    // Check whether image exists
    if (!property.images.includes(imageUrl)) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    // Remove image
    property.images = property.images.filter(
      (image) => image !== imageUrl
    );

    // Editing property requires admin approval again
    property.status = "pending";

    await property.save();

    res.status(200).json({
      success: true,
      message: "Image removed successfully",
      images: property.images,
    });
  } catch (error) {
    console.error("Remove property image error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ===============================
// EXPORTS
// ===============================

module.exports = {
  createProperty,
  getProperties,
  getNearbyProperties,
  getPropertyById,
  getMyProperties,
  getPendingProperties,
  updatePropertyStatus,
  updateProperty,
  deleteProperty,
  getMyPropertyById,
  removePropertyImage,
};