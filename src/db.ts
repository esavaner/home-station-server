import fs from "fs";
import { W1_PATH, PIN_MODES } from "./consts";
import { log } from "./utils";
import { Gpio } from "onoff";
import { OneWire, Sensor } from "./db.model";

const DEFAULT_DB = {
  history: [],
  sensors: [],
  onewires: [],
};

class DB {
  filename: any;
  maxlen: any;
  history: any[] = [];
  sensors: Sensor[] = [];
  onewires: OneWire[] = [];
  constructor(filename: string, maxlen: number) {
    this.filename = filename;
    this.maxlen = maxlen;
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

  appendHistory(data: any) {
    this.history.push(data);
    if (this.history.length >= this.maxlen) {
      this.history.shift();
    }
    this.save();
  }

  getHistory() {
    return this.history;
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

  readSensors() {
    return this.sensors.map((sens: Sensor) => {
      const sensorPin = new Gpio(sens.pin, "in");
      return {
        ...sens,
        isOn: sensorPin.readSync(),
      };
    });
  }

  readOneWires() {
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

  readTemps() {
    if (this.onewires.length === 0) this.readOneWires();

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

  getStatus() {
    return {
      time: Date.now(),
      sensors: this.readSensors(),
      onewires: this.readTemps(),
    };
  }

  hourlyRead() {
    log("hourly read");
    this.appendHistory(this.getStatus());
  }
}

export default DB;
