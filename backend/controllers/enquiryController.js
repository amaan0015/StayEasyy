
const Enquiry = require("../models/Enquiry");
const Property = require("../models/Property");
const Notification = require("../models/Notification");

// Create a new enquiry
const createEnquiry = async (req, res) => {
  try {
    const { propertyId, message } = req.body;

    if (
      !propertyId ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Property ID and message are required.",
      });
    }

    if (
      message.trim().length < 10 ||
      message.trim().length > 1000
    ) {
      return res.status(400).json({
        success: false,
        message: "Message must be between 10 and 1000 characters.",
      });
    }

    if (!/^[a-f\d]{24}$/i.test(propertyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID.",
      });
    }

    const property = await Property.findOne({
      _id: propertyId,
      status: "approved",
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Approved property not found.",
      });
    }

    if (property.owner.toString() === req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You cannot enquire about your own property.",
      });
    }

    const enquiry = await Enquiry.create({
      tenant: req.user.userId,
      owner: property.owner,
      property: property._id,
      message: message.trim(),
    });

    // Notify the property owner
    try {
      await Notification.create({
        recipient: property.owner,
        type: "new_enquiry",
        message: `You received a new enquiry for ${property.title}.`,
        enquiry: enquiry._id,
      });
    } catch (notificationError) {
      // A notification failure should not undo the enquiry.
      console.error(
        "Failed to create enquiry notification:",
        notificationError
      );
    }

    return res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully.",
      enquiry,
    });
  } catch (error) {
    console.error("Create enquiry error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit enquiry.",
    });
  }
};

// Get enquiries received by the logged-in owner
const getReceivedEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find({
      owner: req.user.userId,
    })
      .populate("tenant", "name email phone")
      .populate("property", "title rent city area images")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: enquiries.length,
      enquiries,
    });
  } catch (error) {
    console.error("Get received enquiries error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch enquiries.",
    });
  }
};

// Update an enquiry status and notify the tenant
const updateEnquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!/^[a-f\d]{24}$/i.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enquiry ID.",
      });
    }

    if (!["contacted", "closed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be contacted or closed.",
      });
    }

    const enquiry = await Enquiry.findOne({
      _id: id,
      owner: req.user.userId,
    });

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found or you do not have permission.",
      });
    }

    const previousStatus = enquiry.status;

    enquiry.status = status;
    await enquiry.save();

    // Notify only when the status actually changes
    if (previousStatus !== status) {
      try {
        await Notification.create({
          recipient: enquiry.tenant,
          type: "enquiry_status_updated",
          message: `Your enquiry status has been updated to ${status}.`,
          enquiry: enquiry._id,
        });
      } catch (notificationError) {
        console.error(
          "Failed to create status notification:",
          notificationError
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Enquiry status updated successfully.",
      enquiry,
    });
  } catch (error) {
    console.error("Update enquiry status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update enquiry status.",
    });
  }
};

module.exports = {
  createEnquiry,
  getReceivedEnquiries,
  updateEnquiryStatus,
};
