import { Server as HttpServer } from "http";
import { Server } from "socket.io";

let io: Server | null = null;

export const initializeSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("queue:join", (room: string) => {
      if (typeof room === "string" && room.length <= 150) {
        socket.join(room);
      }
    });

    socket.on("queue:leave", (room: string) => {
      if (typeof room === "string") {
        socket.leave(room);
      }
    });
  });

  return io;
};

export const getIO = () => io;

export const emitQueueUpdate = (
  hospitalId: string,
  departmentId: string,
  event: string,
  payload: unknown
) => {
  if (!io) return;

  const room = `queue:${hospitalId}:${departmentId}`;
  io.to(room).emit(event, payload);
};
