import fs from "fs";
import { CONTROLLER_THROTTLE, ONECALL_THROTTLE } from "./consts";
import { Controller, ControllerRead, Location } from "@esavaner/home-station";
import { getOneCall } from "./api/onecall";
import { log } from "./utils";
import { OneCallModel } from "@esavaner/home-station";
import { readSensors, readTemp } from "./api/controller";

const DEFAULT_DB = {
  statusHistory: [],
  oneCallHistory: [],
  controllers: [],
  controllerHistory: [],
  location: null,
};

class DB {
  filename: string;
  oneCallHistory: OneCallModel[] = [];
  controllers: Controller[] = [];
  controllerHistory: ControllerRead[] = [];
  location: Location | undefined = undefined;
  constructor(filename: string) {
    this.filename = filename;
    try {
      Object.assign(
        this,
        JSON.parse(fs.readFileSync(this.filename, { encoding: "utf-8" }))
      );
    } catch (e) {
      fs.writeFileSync(filename, JSON.stringify(DEFAULT_DB));
      Object.assign(
        this,
        JSON.parse(fs.readFileSync(this.filename, { encoding: "utf-8" }))
      );
    }
  }

  save() {
    fs.writeFileSync(this.filename, JSON.stringify(this));
  }

  /*********************************************/
  /* onecall */

  appendOnecallHistory(data: OneCallModel) {
    this.oneCallHistory.push(data);
    if (this.oneCallHistory.length > 1) {
      this.oneCallHistory.shift();
    }
    this.save();
  }

  async getOneCall(): Promise<OneCallModel[]> {
    const now = Date.now();
    if (
      this.oneCallHistory.length === 0 ||
      now - this.oneCallHistory[0].current.dt * 1000 > ONECALL_THROTTLE
    ) {
      log("reset onecall");
      const oneCall = await getOneCall(this.location);
      this.appendOnecallHistory(oneCall);
    }
    return this.oneCallHistory;
  }

  /*********************************************/
  /* location */

  setLocation(loc: Location) {
    this.location = loc;
    this.save();
  }

  clearLocation() {
    this.location = undefined;
    this.save();
  }

  getLocation() {
    return this.location;
  }

  /*********************************************/
  /* controllers */

  addController(con: Controller) {
    const index = this.controllers.findIndex((c) => c.ip === con.ip);
    if (index > -1) {
      throw "Controller existing";
    } else {
      try {
        this.controllers.push(con);
        this.save();
      } catch (e) {
        throw `Sensor add error: ${e}`;
      }
    }
  }

  updateController(con: Controller) {
    const index = this.controllers.findIndex((c) => c.ip === con.ip);
    this.controllers[index] = con;
    this.save();
  }

  deleteController(con_ip: string) {
    const index = this.controllers.findIndex((c) => c.ip === con_ip);
    this.controllers.splice(index, 1);
    this.save();
  }

  getControllers() {
    return this.controllers;
  }

  getController(con_ip: string) {
    return this.controllers.find((con) => con.ip === con_ip);
  }

  /*********************************************/
  /* controller status */

  setControllerHistory(data: ControllerRead[]) {
    this.controllerHistory = [...data];
    this.save();
  }

  async getControllerRead(): Promise<ControllerRead[]> {
    const now = Date.now();
    if (
      this.controllerHistory.length === 0 ||
      now - this.controllerHistory[0].time > CONTROLLER_THROTTLE
    ) {
      const promises = this.controllers.map(async (con) => {
        let cTemp, cRead;
        let errors = [];
        try {
          cTemp = await readTemp(con.ip);
        } catch (e) {
          errors.push(e);
        }
        try {
          cRead = await readSensors(con);
        } catch (e) {
          errors.push(e);
        }
        console.log(errors);
        return {
          ip: con.ip,
          name: con.name,
          time: now,
          temp: cTemp,
          sensors: cRead ? cRead : [],
        };
      });
      const results = await Promise.allSettled(promises);

      const reads = results
        .filter((r_1) => r_1.status === "fulfilled")
        // @ts-ignore
        .map((r_2) => r_2.value);
      reads && this.setControllerHistory(reads);
    }
    return this.controllerHistory;
  }
}

export default DB;
