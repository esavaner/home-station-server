import express from "express";
import DB from "./src/db.js";
import { PORT, DB_FILE, MAX_LENGTH } from "./src/consts.js";
import { log } from "./src/logger.js";
import { setupTimer } from "./src/utils.js";

const db = new DB(DB_FILE, MAX_LENGTH);
const app = express();

setupTimer(db);

app.get("/", (req, res) => {
  res.redirect("/history");
});

app.get("/history", (req, res) => {
  log("read history");
  res.send(db.getHistoryString());
});

app.get("/temps", (req, res) => {
  log("read temps");
  res.send(
    JSON.stringify({
      date: Date.now(),
      temps: db.readTemps(),
    })
  );
});

app.listen(PORT, () => {
  log(`Running on port ${PORT}`);
});
