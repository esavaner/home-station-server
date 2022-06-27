import fs from "fs";
import {
  W1_PATH,
  PIN_MODES,
  STATUS_THROTTLE,
  ONECALL_THROTTLE,
} from "./consts";
import { Gpio } from "onoff";
import {
  OneWire,
  OneWireRead,
  Sensor,
  SensorRead,
  StatusModel,
} from "./db.model";
import { getOneCall, getOneCallMock } from "./api/onecall";
import { log } from "./utils";
import { OneCallModel } from "./api/onecall.model";

const DEFAULT_DB = {
  statusHistory: [],
  oneCallHistort: [],
  sensors: [],
  onewires: [],
};

class DB {
  filename: string;
  statusHistory: StatusModel[] = [];
  oneCallHistory: OneCallModel[] = [];
  sensors: Sensor[] = [];
  onewires: OneWire[] = [];
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

  appendStatusHistory(data: StatusModel) {
    this.statusHistory.push(data);
    if (this.statusHistory.length > 1) {
      this.statusHistory.shift();
    }
    this.save();
  }

  appendOnecallHistory(data: OneCallModel) {
    this.oneCallHistory.push(data);
    if (this.oneCallHistory.length > 1) {
      this.oneCallHistory.shift();
    }
    this.save();
  }

  getStatusHistory() {
    return this.statusHistory;
  }

  getOneCallHistory() {
    return this.oneCallHistory;
  }

  save() {
    fs.writeFileSync(this.filename, JSON.stringify(this));
  }

  addSensor(sensor: Sensor) {
    this.sensors.push(sensor);
    const sens = new Gpio(sensor.pin, "in");
    sens.writeSync(1);
    this.save();
  }

  updateSensor(sensor: Sensor) {
    const index = this.sensors.findIndex((sens) => (sensor.pin = sens.pin));
    this.sensors[index] = sensor;
    this.save();
  }

  deleteSensor(sensor: Sensor) {
    const index = this.sensors.findIndex((sens) => (sensor.pin = sens.pin));
    this.sensors.splice(index, 1);
    this.clearSensor(sensor.pin);
    this.save();
  }

  clearSensor(pin: number) {
    const sens = new Gpio(pin, "in");
    sens.writeSync(0);
  }

  readSensors(): SensorRead[] {
    return this.sensors.map((sens: Sensor) => {
      const sensorPin = new Gpio(sens.pin, "in");
      return {
        ...sens,
        isOn: Boolean(sensorPin.readSync()),
      };
    });
  }

  setOneWires(): void {
    const dirs = fs.readdirSync(W1_PATH);
    for (let [index, dir] of Object.entries(dirs)) {
      if (!dir.startsWith("28-")) continue;
      if (this.onewires.find((el) => el.id === dir)) continue;

      this.onewires.push({
        id: dir,
        description: `One Wire ${index}`,
      });
    }
    this.save();
  }

  readOneWires(): OneWireRead[] {
    if (this.onewires.length === 0) this.setOneWires();

    const temps = this.onewires.map((wire) => {
      try {
        const w1 = fs.readFileSync(`${W1_PATH}/${wire.id}/w1_slave`, {
          encoding: "utf-8",
        });
        const temp = parseInt(w1.split("t=")[1].replace("\n", "")) / 1000;
        return {
          ...wire,
          temp,
        };
      } catch (e) {
        return {
          ...wire,
          temp: null,
        };
      }
    });

    return temps;
  }

  getStatus(): StatusModel[] {
    const now = Date.now();
    if (
      this.statusHistory.length === 0 ||
      now - this.statusHistory[0].time > STATUS_THROTTLE
    ) {
      this.appendStatusHistory({
        time: now,
        sensors: this.readSensors(),
        onewires: this.readOneWires(),
      });
    }
    return this.getStatusHistory();
  }

  async getOneCall(): Promise<OneCallModel[]> {
    const now = Date.now();
    if (
      this.oneCallHistory.length === 0 ||
      now - this.oneCallHistory[0].current.dt * 1000 > ONECALL_THROTTLE
    ) {
      log("reset onecall");
      const oneCall = await getOneCall();
      this.appendOnecallHistory(oneCall);
    }
    return this.getOneCallHistory();
  }
}

export default DB;
