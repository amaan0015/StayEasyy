
const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// One conversation per tenant-owner-property combination
conversationSchema.index(
  { tenant: 1, owner: 1, property: 1 },
  { unique: true }
);

conversationSchema.index({ tenant: 1, lastMessageAt: -1 });
conversationSchema.index({ owner: 1, lastMessageAt: -1 });

module.exports = mongoose.model("Conversation", conversationSchema);
