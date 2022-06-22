import fs from "fs";
import {
  W1_PATH,
  PIN_MODES,
  STATUS_THROTTLE,
  ONECALL_THROTTLE,
} from "./consts";
import { Gpio } from "onoff";
import {
  OneCallModel,
  OneWire,
  OneWireRead,
  Sensor,
  SensorRead,
  StatusModel,
} from "./db.model";

const DEFAULT_DB = {
  statusHistory: [],
  onecallHistort: [],
  sensors: [],
  onewires: [],
};

class DB {
  filename: string;
  statusHistory: StatusModel[] = [];
  onecallHistory: OneCallModel[] = [];
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
    this.onecallHistory.push(data);
    if (this.onecallHistory.length > 1) {
      this.onecallHistory.shift();
    }
    this.save();
  }

  getStatusHistory() {
    return this.statusHistory;
  }

  getOnecallHistory() {
    return this.onecallHistory;
  }

  save() {
    fs.writeFileSync(this.filename, JSON.stringify(this));
  }

  addSensor(sensor: Sensor) {
    this.sensors.push(sensor);
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
    this.save();
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
    for (let dir of dirs) {
      if (!dir.startsWith("28-")) continue;
      if (this.onewires.find((el) => el.id === dir)) continue;

      this.onewires.push({
        id: dir,
        description: "",
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

  async getOneCall(): Promise<OneCallModel> {
    const now = Date.now();
    if (
      this.onecallHistory.length === 0 ||
      now - this.onecallHistory[0].time > ONECALL_THROTTLE
    ) {
      // this.appendStatusHistory({
      //   time: now,
      //   sensors: this.readSensors(),
      //   onewires: this.readOneWires(),
      // });
    }
    return this.getOnecallHistory();
  }
}

export default DB;
