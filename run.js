import express from "express";
import DB from "./src/db.js";
import { PORT, DB_FILE, MAX_LENGTH } from "./src/consts.js";

const db = new DB(DB_FILE, MAX_LENGTH);
const app = express();

app.get("/", (req, res) => {
  res.redirect("/history");
});

app.get("/history", (req, res) => {
  res.send(db.getHistoryString());
});

app.get("/temps", (req, res) => {
  res.send(
    JSON.stringify({
      date: Date.now(),
      temps: db.readTemps(),
    })
  );
});

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
