import { createServer } from "http";
import app from "./app";
import { env } from "./config/env";
import { initializeSocket } from "./config/socket";

const httpServer = createServer(app);

initializeSocket(httpServer);

httpServer.listen(env.PORT, () => {
  console.log(
    `🚀 MediFlow API running on port ${env.PORT}`
  );
});