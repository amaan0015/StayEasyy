
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  startConversation,
  getMyConversations,
  getConversationMessages,
  sendMessage,
} = require("../controllers/chatController");

// All chat routes require authentication
router.use(protect);

// Start a conversation — tenants only
router.post(
  "/conversations",
  authorizeRoles("tenant"),
  startConversation
);

// List conversations for the logged-in user
router.get("/conversations", getMyConversations);

// Get messages from a conversation
router.get(
  "/conversations/:conversationId/messages",
  getConversationMessages
);

// Send a message
router.post(
  "/conversations/:conversationId/messages",
  sendMessage
);

module.exports = router;
