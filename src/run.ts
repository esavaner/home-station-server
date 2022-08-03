import express from "express";
import DB from "./db";
import { PORT, DB_FILE, DEFAULT_CLIENT } from "./consts";
import { log } from "./utils";
import { setupConfig, setupTimer, stringResponse } from "./utils";
import { Controller, Location } from "@esavaner/home-station";

const db = new DB(DB_FILE);
const app = express();
const config = setupConfig("./config.json");

app.use(express.json());

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
  res.send(200);
});

/*********************************************/
/* onecall */

app.get("/onecall", async (req, res) => {
  log("read onecall");
  const oc = await db.getOneCall();
  res.send(stringResponse(oc.length > 0 ? oc[0] : {}));
});

/*********************************************/
/* location */

app.get("/location", (req, res) => {
  log("read location");
  res.send(stringResponse(db.getLocation()));
});

app.post("/location", (req, res) => {
  const loc: Location = req.body.location;
  log(`set location: ${JSON.stringify(loc)}`);
  db.setLocation(loc);
  res.send(200);
});

app.delete("/location", (req, res) => {
  log("clear location");
  db.clearLocation();
  res.send(200);
});

/*********************************************/
/* controllers */

app.get("/controller", (req, res) => {
  log("get controllers");
  res.send(stringResponse(db.getControllers()));
});

app.post("/controller", (req, res) => {
  log("add controller");
  const con: Controller = req.body.controller;
  db.addController(con);
  res.send(200);
});

app.delete("/controller", (req, res) => {
  log("delete controller");
  const con_ip = req.query.controller_ip;
  db.deleteController(con_ip ? (con_ip as string) : "");
  res.send(200);
});

app.put("/controller", (req, res) => {
  log("update controller");
  const con: Controller = req.body.controller;
  db.updateController(con);
  res.send(200);
});

/*********************************************/
/* controller read */

app.get("/controller_read", async (req, res) => {
  log("read controller status");
  const cs = await db.getControllerRead();
  res.send(stringResponse(cs));
});

/*********************************************/
/* start */

app.listen(PORT, () => {
  log(`Running on port ${PORT}`);
});

// app.get("/status", (req, res) => {
//   log("read status");
//   const st = db.getStatus();
//   res.send(stringResponse(st.length > 0 ? st[0] : {}));
// });
//
// app.post("/add_sensor", (req, res) => {
//   const sensor = req.body.sensor;
//   console.log(sensor);
//   res.send(200);
// });
