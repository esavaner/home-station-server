import express from "express";
import DB from "./src/db.js";
import { PORT, DB_FILE, MAX_LENGTH } from "./src/consts.js";
import { log } from "./src/logger.js";
import { setupTimer, stringResponse } from "./src/utils.js";

const db = new DB(DB_FILE, MAX_LENGTH);
const app = express();

setupTimer(db);

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

app.listen(PORT, () => {
  log(`Running on port ${PORT}`);
});
