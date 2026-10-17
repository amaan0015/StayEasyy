const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    phone: {
      type: String,
      trim: true,
    },

    role: {
      type: String,
      enum: ["tenant", "owner", "admin"],
      default: "tenant",
    },

    profileImage: {
      type: String,
      default: "",
    },

    savedProperties: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
  },
],


  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;