
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require("../controllers/notificationController");

// All routes require login
router.use(protect);

// Get notifications and unread count
router.get("/", getMyNotifications);

// Mark all notifications as read
router.patch("/read-all", markAllNotificationsRead);

// Mark one notification as read
router.patch("/:id/read", markNotificationRead);

module.exports = router;
