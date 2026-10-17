
const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");

const registerChatSocket = (io) => {
  io.on("connection", (socket) => {
    // Join a conversation only after checking membership.
    socket.on("join_conversation", async (conversationId, callback) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
          if (typeof callback === "function") {
            callback({
              success: false,
              message: "Invalid conversation ID",
            });
          }
          return;
        }

        const userId = socket.user.userId;

        const conversation = await Conversation.findOne({
          _id: conversationId,
          $or: [{ tenant: userId }, { owner: userId }],
        }).select("_id");

        if (!conversation) {
          if (typeof callback === "function") {
            callback({
              success: false,
              message: "You are not allowed to join this conversation",
            });
          }
          return;
        }

        // Leave other conversation rooms before joining this one.
        for (const room of socket.rooms) {
          if (room !== socket.id) {
            socket.leave(room);
          }
        }

        socket.join(String(conversation._id));

        if (typeof callback === "function") {
          callback({ success: true });
        }
      } catch (error) {
        console.error("Join conversation socket error:", error);

        if (typeof callback === "function") {
          callback({
            success: false,
            message: "Could not join conversation",
          });
        }
      }
    });

    // Notify the other participant when this user starts typing.
    socket.on("typing", async (conversationId) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(conversationId)) return;

        const userId = socket.user.userId;

        const conversation = await Conversation.findOne({
          _id: conversationId,
          $or: [{ tenant: userId }, { owner: userId }],
        }).select("_id");

        if (!conversation) return;

        const room = String(conversation._id);

        // Only broadcast if this socket has joined the authorized room.
        if (!socket.rooms.has(room)) return;

        socket.to(room).emit("user_typing", {
          conversationId: room,
          userId: String(userId),
        });
      } catch (error) {
        console.error("Typing socket error:", error);
      }
    });

    // Notify the other participant when this user stops typing.
    socket.on("stop_typing", async (conversationId) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(conversationId)) return;

        const userId = socket.user.userId;

        const conversation = await Conversation.findOne({
          _id: conversationId,
          $or: [{ tenant: userId }, { owner: userId }],
        }).select("_id");

        if (!conversation) return;

        const room = String(conversation._id);

        if (!socket.rooms.has(room)) return;

        socket.to(room).emit("user_stop_typing", {
          conversationId: room,
          userId: String(userId),
        });
      } catch (error) {
        console.error("Stop typing socket error:", error);
      }
    });
  });
};

module.exports = registerChatSocket;

