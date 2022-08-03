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
    if (index < 0) {
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

  /*********************************************/
  /* controller status */

  setControllerHistory(data: ControllerRead[]) {
    this.controllerHistory = data;
    this.save();
  }

  async getControllerRead(): Promise<ControllerRead[]> {
    const now = Date.now();
    if (
      this.controllerHistory.length === 0 ||
      now - this.controllerHistory[0].time > CONTROLLER_THROTTLE
    ) {
      const promises = this.controllers.map(async (con) => {
        const cTemp = await readTemp(con.ip);
        const cRead = await readSensors(con);
        return {
          ip: con.ip,
          name: con.name,
          time: now,
          temp: cTemp,
          sensors: cRead,
        };
      });
      const results = await Promise.allSettled(promises);
      const reads = (
        results.find((res) => res.status === "fulfilled") as
          | PromiseFulfilledResult<ControllerRead[]>
          | undefined
      )?.value;

      reads && this.setControllerHistory(reads);
    }
    return this.controllerHistory;
  }

  // clearSensor(pin: number) {
  //   const sens = new Gpio(pin, "in");
  //   sens.writeSync(0);
  // }

  // readSensors(): SensorRead[] {
  //   return this.sensors.map((sens: Sensor) => {
  //     const sensorPin = new Gpio(sens.pin, "in");
  //     return {
  //       ...sens,
  //       isOn: Boolean(sensorPin.readSync()),
  //     };
  //   });
  // }

  // setOneWires(): void {
  //   const dirs = fs.readdirSync(W1_PATH);
  //   for (let [index, dir] of Object.entries(dirs)) {
  //     if (!dir.startsWith("28-")) continue;
  //     if (this.onewires.find((el) => el.id === dir)) continue;
  //     this.onewires.push({
  //       id: dir,
  //       description: `One Wire ${index}`,
  //     });
  //   }
  //   this.save();
  // }

  // readOneWires(): OneWireRead[] {
  //   if (this.onewires.length === 0) this.setOneWires();
  //   const temps = this.onewires.map((wire) => {
  //     try {
  //       const w1 = fs.readFileSync(`${W1_PATH}/${wire.id}/w1_slave`, {
  //         encoding: "utf-8",
  //       });
  //       const temp = parseInt(w1.split("t=")[1].replace("\n", "")) / 1000;
  //       return {
  //         ...wire,
  //         temp,
  //       };
  //     } catch (e) {
  //       return {
  //         ...wire,
  //         temp: null,
  //       };
  //     }
  //   });

  //   return temps;
  // }

  // getStatus(): StatusModel[] {
  //   const now = Date.now();
  //   if (
  //     this.statusHistory.length === 0 ||
  //     now - this.statusHistory[0].time > STATUS_THROTTLE
  //   ) {
  //     this.appendStatusHistory({
  //       time: now,
  //       sensors: this.readSensors(),
  //       onewires: this.readOneWires(),
  //     });
  //   }
  //   return this.getStatusHistory();
  // }

  // getStatusHistory() {
  //   return this.statusHistory;
  // }

  // addSensor(sensor: Sensor) {
  //   this.sensors.push(sensor);
  //   const sens = new Gpio(sensor.pin, "in");
  //   sens.writeSync(1);
  //   this.save();
  // }

  // updateSensor(sensor: Sensor) {
  //   const index = this.sensors.findIndex((sens) => (sensor.pin = sens.pin));
  //   this.sensors[index] = sensor;
  //   this.save();
  // }

  // deleteSensor(sensor: Sensor) {
  //   const index = this.sensors.findIndex((sens) => (sensor.pin = sens.pin));
  //   this.sensors.splice(index, 1);
  //   this.clearSensor(sensor.pin);
  //   this.save();
  // }

  // appendStatusHistory(data: StatusModel) {
  //   this.statusHistory.push(data);
  //   if (this.statusHistory.length > 1) {
  //     this.statusHistory.shift();
  //   }
  //   this.save();
  // }
}

export default DB;
