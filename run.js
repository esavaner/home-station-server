import express from "express";
import DB from "./src/db.js";
import { PORT, DB_FILE, MAX_LENGTH, DEFAULT_CLIENT } from "./src/consts.js";
import { log } from "./src/utils.js";
import { setupConfig, setupTimer, stringResponse } from "./src/utils.js";

const db = new DB(DB_FILE, MAX_LENGTH);
const app = express();
const config = setupConfig("./config.json");

setupTimer(db);

app.use((req, res, next) => {
  const origin = config.client_urls.includes(req.headers.origin)
    ? req.headers.origin
    : DEFAULT_CLIENT;

  res.header("Access-Control-Allow-Origin", origin);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", (req, res) => {
  res.redirect("/history");
});

app.get("/history", (req, res) => {
  log("read history");
  res.send(stringResponse(db.getHistory()));
});

app.get("/status", (req, res) => {
  log("read status");
  res.send(stringResponse(db.getStatus()));
});

app.get("/onecall", (req, res) => {
  res.send(stringResponse(call()));
});

app.listen(PORT, () => {
  log(`Running on port ${PORT}`);
});
