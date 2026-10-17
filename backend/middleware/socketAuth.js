
const jwt = require("jsonwebtoken");

const socketAuth = (socket, next) => {
  try {
    // Get the token provided by the frontend
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    // Verify the token using the same secret as REST APIs
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Store authenticated user details on the socket
    socket.user = decoded;

    next();
  } catch (error) {
    next(new Error("Invalid or expired token"));
  }
};

module.exports = socketAuth;
