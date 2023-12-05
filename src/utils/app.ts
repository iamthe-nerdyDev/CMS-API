import express from "express";
import cors from "cors";
import passportAuth from "./passport";
import routes from "./router";

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

  passportAuth.initPassport(app); //to initialize passport auth

  app.use("/api/v1/", routes);

  app.use((_, res) => {
    return res.status(500).send("Oops! Something is not right");
  });

  return app;
}

export default createServer;
