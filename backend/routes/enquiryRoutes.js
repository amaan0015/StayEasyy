
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  createEnquiry,
  getReceivedEnquiries,
  updateEnquiryStatus,
} = require("../controllers/enquiryController");

// Only logged-in tenants can submit enquiries.
router.post(
  "/",
  protect,
  authorizeRoles("tenant"),
  createEnquiry
);

// Only logged-in owners can view their received enquiries.
router.get(
  "/received",
  protect,
  authorizeRoles("owner"),
  getReceivedEnquiries
);

router.patch(
  "/:id/status",
  protect,
  authorizeRoles("owner"),
  updateEnquiryStatus
);

module.exports = router;
