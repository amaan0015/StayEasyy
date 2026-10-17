const express = require("express");

const authorizeRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");
const protect = require("../middleware/authMiddleware");

// Property controller
const {
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
} = require("../controllers/propertyController");

// Favorite controller
const {
  saveProperty,
  removeSavedProperty,
  getSavedProperties,
} = require("../controllers/favoriteController");

const router = express.Router();

// ==========================================
// CREATE PROPERTY
// ==========================================

router.post(
  "/",
  protect,
  authorizeRoles("owner", "admin"),
  upload.array("images", 5),
  createProperty
);

// ==========================================
// GET ALL APPROVED PROPERTIES
// ==========================================

router.get("/", getProperties);

router.get("/nearby", getNearbyProperties);

// ==========================================
// GET OWNER'S PROPERTIES
// ==========================================

router.get(
  "/my",
  protect,
  authorizeRoles("owner", "admin"),
  getMyProperties
);

// ==========================================
// GET PENDING PROPERTIES - ADMIN
// ==========================================

router.get(
  "/admin/pending",
  protect,
  authorizeRoles("admin"),
  getPendingProperties
);

// ==========================================
// APPROVE / REJECT PROPERTY - ADMIN
// ==========================================

router.patch(
  "/admin/:id/status",
  protect,
  authorizeRoles("admin"),
  updatePropertyStatus
);

// ==========================================
// GET SAVED PROPERTIES - TENANT
// ==========================================

router.get(
  "/saved",
  protect,
  authorizeRoles("tenant"),
  getSavedProperties
);

// ==========================================
// SAVE PROPERTY - TENANT
// ==========================================

router.post(
  "/:id/save",
  protect,
  authorizeRoles("tenant"),
  saveProperty
);

// ==========================================
// REMOVE SAVED PROPERTY - TENANT
// ==========================================

router.delete(
  "/:id/save",
  protect,
  authorizeRoles("tenant"),
  removeSavedProperty
);

// ==========================================
// UPDATE PROPERTY - OWNER
// ==========================================

router.put(
  "/:id",
  protect,
  authorizeRoles("owner"),
  upload.array("images", 5),
  updateProperty
);

// ==========================================
// DELETE PROPERTY - OWNER
// ==========================================

router.delete(
  "/:id",
  protect,
  authorizeRoles("owner"),
  deleteProperty
);

// ==========================================
// REMOVE PROPERTY IMAGE - OWNER
// ==========================================

router.delete(
  "/:id/images",
  protect,
  authorizeRoles("owner"),
  removePropertyImage
);

// ==========================================
// GET OWNER PROPERTY BY ID
// ==========================================

router.get(
  "/my/:id",
  protect,
  authorizeRoles("owner"),
  getMyPropertyById
);

// ==========================================
// GET PROPERTY BY ID - PUBLIC
// ==========================================

router.get("/:id", getPropertyById);

module.exports = router;