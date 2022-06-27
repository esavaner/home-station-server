import express from "express";
import DB from "./db";
import { PORT, DB_FILE, DEFAULT_CLIENT } from "./consts";
import { log } from "./utils";
import { setupConfig, setupTimer, stringResponse } from "./utils";

const db = new DB(DB_FILE);
const app = express();
const config = setupConfig("./config.json");

// setupTimer(db);

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

app.get("/status", (req, res) => {
  log("read status");
  const st = db.getStatus();
  res.send(stringResponse(st.length > 0 ? st[0] : {}));
});

app.get("/onecall", async (req, res) => {
  log("read onecall");
  const oc = await db.getOneCall();
  res.send(stringResponse(oc.length > 0 ? oc[0] : {}));
});

app.post("/add_sensor", (req, res) => {
  const sensor = req.body.sensor;
  console.log(sensor);
  res.send(200);
});

app.listen(PORT, () => {
  log(`Running on port ${PORT}`);
});
