
const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Property = require("../models/Property");
const Notification = require("../models/Notification");

const getUserId = (req) => req.user.userId;

// Start a new conversation or return an existing one
const startConversation = async (req, res) => {
  try {
    const { propertyId } = req.body;
    const userId = getUserId(req);

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ message: "Invalid property ID" });
    }

    const property = await Property.findById(propertyId);

    if (!property || property.status !== "approved") {
      return res.status(404).json({
        message: "Approved property not found",
      });
    }

    if (String(property.owner) === String(userId)) {
      return res.status(403).json({
        message: "You cannot start a conversation about your own property",
      });
    }

    let conversation = await Conversation.findOne({
      tenant: userId,
      owner: property.owner,
      property: property._id,
    });

    if (!conversation) {
      try {
        conversation = await Conversation.create({
          tenant: userId,
          owner: property.owner,
          property: property._id,
        });
      } catch (error) {
        // Handle two requests attempting to create the same conversation
        if (error.code !== 11000) throw error;

        conversation = await Conversation.findOne({
          tenant: userId,
          owner: property.owner,
          property: property._id,
        });
      }
    }

    return res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error("Start conversation error:", error);
    return res.status(500).json({
      message: "Failed to start conversation",
    });
  }
};

// List conversations for the logged-in user

const getMyConversations = async (req, res) => {
  try {
    const userId = getUserId(req);

    const conversations = await Conversation.find({
      $or: [{ tenant: userId }, { owner: userId }],
    })
      .populate("tenant", "name email")
      .populate("owner", "name email")
      .populate("property", "title rent city area images")
      .populate("lastMessage")
      .sort({ lastMessageAt: -1 });

    const conversationsWithUnreadCount = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await Message.countDocuments({
          conversation: conversation._id,
          sender: { $ne: userId },
          isRead: false,
        });

        return {
          ...conversation.toObject(),
          unreadCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      conversations: conversationsWithUnreadCount,
    });
  } catch (error) {
    console.error("Get conversations error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
    });
  }
};

// Get messages from a conversation

const getConversationMessages = async (req, res) => {
  try {
    console.log("GET CONVERSATION MESSAGES CALLED");
    const { conversationId } = req.params;
    const userId = getUserId(req);

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      $or: [{ tenant: userId }, { owner: userId }],
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Mark messages from the other participant as read.
    const result = await Message.updateMany(
      {
        conversation: conversation._id,
        sender: { $ne: userId },
        isRead: false,
      },
      {
        $set: { isRead: true },
      }
    );

    const messages = await Message.find({
      conversation: conversation._id,
    })
      .populate("sender", "name")
      .sort({ createdAt: 1 });

    // Notify the other participant that their messages were read.
   if (result.modifiedCount > 0) {
  const io = req.app.get("io");

  console.log("READ RECEIPT DEBUG:", {
    conversationId: String(conversation._id),
    readerId: String(userId),
    modifiedCount: result.modifiedCount,
    socketServerAvailable: Boolean(io),
  });

  if (io) {
    io.to(String(conversation._id)).emit("messages_read", {
      conversationId: String(conversation._id),
      readerId: String(userId),
    });
  }
}

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Get messages error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
};


// Send a messag
const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const text =
      typeof req.body.text === "string" ? req.body.text.trim() : "";

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: "Invalid conversation ID" });
    }

    if (!text || text.length > 2000) {
      return res.status(400).json({
        message: "Message must contain 1 to 2000 characters",
      });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      $or: [
        { tenant: getUserId(req) },
        { owner: getUserId(req) },
      ],
    });

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    const senderId = getUserId(req);
    const isTenant =
      String(conversation.tenant) === String(senderId);

    const receiverId = isTenant
      ? conversation.owner
      : conversation.tenant;

    const message = await Message.create({
      conversation: conversation._id,
      sender: senderId,
      receiver: receiverId,
      property: conversation.property,
      text,
    });

    conversation.lastMessage = message._id;
    conversation.lastMessageAt = message.createdAt;
    await conversation.save();

    // Notification failure should not prevent message delivery.
    try {
      await Notification.create({
        recipient: receiverId,
        type: "new_message",
        message: "You received a new message.",
      });
    } catch (notificationError) {
      console.error("Message notification error:", notificationError);
    }

    // Populate sender details before sending the message to clients.
    await message.populate("sender", "name");

    // Emit the saved message to other users in this conversation room.
    const io = req.app.get("io");

    if (io) {
      io.to(String(conversation._id)).emit("new_message", message);
    }

    return res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Send message error:", error);
    return res.status(500).json({
      message: "Failed to send message",
    });
  }
};


module.exports = {
  startConversation,
  getMyConversations,
  getConversationMessages,
  sendMessage,
};
