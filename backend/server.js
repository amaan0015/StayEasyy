
require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./config/db");
const socketAuth = require("./middleware/socketAuth");
const registerChatSocket = require("./socket/chatSocket");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);



const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://10.127.178.137:5173",
      "https://stay-easyy-one.vercel.app",
      "https://stay-easyy-5ogtqslu0-amaan-649f.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  },
});


// Make Socket.IO available to Express controllers
app.set("io", io);

// Authenticate every socket connection
io.use(socketAuth);

registerChatSocket(io);

io.on("connection", (socket) => {
  console.log("Authenticated socket connected:", socket.id);
  console.log("Authenticated user:", socket.user.userId);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

connectDB();

server.listen(PORT, () => {
  console.log(`StayEasyy server running on port ${PORT}`);
});

