const User = require("../models/User");
const Property = require("../models/Property");

// SAVE PROPERTY
const saveProperty = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if property exists and is approved
    const property = await Property.findOne({
      _id: id,
      status: "approved",
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already saved
    if (user.savedProperties.includes(id)) {
      return res.status(400).json({
        success: false,
        message: "Property already saved",
      });
    }

    // Add property ID
    user.savedProperties.push(id);

    await user.save();

    res.status(200).json({
      success: true,
      message: "Property saved successfully",
    });
  } catch (error) {
    console.error("Save property error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// REMOVE SAVED PROPERTY
const removeSavedProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.savedProperties = user.savedProperties.filter(
      (propertyId) => propertyId.toString() !== id
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: "Property removed from saved properties",
    });
  } catch (error) {
    console.error("Remove saved property error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET SAVED PROPERTIES
const getSavedProperties = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate({
      path: "savedProperties",
      match: { status: "approved" },
      populate: {
        path: "owner",
        select: "name email phone",
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      count: user.savedProperties.length,
      properties: user.savedProperties,
    });
  } catch (error) {
    console.error("Get saved properties error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  saveProperty,
  removeSavedProperty,
  getSavedProperties,
};