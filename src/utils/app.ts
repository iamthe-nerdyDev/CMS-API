import express from "express";
import cors from "cors";

function createServer() {
  const app = express();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: [
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "Authorization",
        "cache",
        "X-Refresh-Token",
      ],
    })
  );

  app.use((_, res) => {
    return res.status(500).send("Oops! Something is not right");
  });

  return app;
}

export default createServer;
