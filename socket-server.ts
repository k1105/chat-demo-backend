import {createServer} from "http";
import {Server as SocketIOServer} from "socket.io";

const httpServer = createServer();
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// 接続中のユーザー情報を管理
const connectedUsers = new Map<string, string>();

io.on("connection", (socket) => {
  console.log("Client connected");

  // ユーザー名を生成して保存
  const userName = `User-${socket.id.slice(0, 4)}`;
  connectedUsers.set(socket.id, userName);

  socket.on("message", (message) => {
    console.log("Received message:", message);
    io.emit("message", message);
  });

  // タイピング開始イベント
  socket.on("typingStart", (data = {}) => {
    const userName = data?.username || connectedUsers.get(socket.id);
    socket.broadcast.emit("userTyping", {
      userId: socket.id,
      username: userName,
    });
  });

  // タイピング終了イベント
  socket.on("typingStop", (data = {}) => {
    const userName = data?.username || connectedUsers.get(socket.id);
    socket.broadcast.emit("userStoppedTyping", {
      userId: socket.id,
      username: userName,
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    connectedUsers.delete(socket.id);
  });
});

const PORT: number = parseInt(process.env.PORT || "3002", 10);
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
