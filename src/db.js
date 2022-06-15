import fs from "fs";
import { newUid } from "./utils.js";
import { W1_PATH, TEMP_MODES } from "./consts.js";
import { log } from "./logger.js";
import { Gpio } from "onoff";

const options = {
  encoding: "utf-8",
};

const DEFAULT_DB = {
  history: [],
  sensors: [],
  windows: [],
};

class DB {
  constructor(filename, maxlen) {
    this.filename = filename;
    this.maxlen = maxlen;
    try {
      Object.assign(this, JSON.parse(fs.readFileSync(this.filename, options)));
    } catch (e) {
      fs.writeFileSync(filename, JSON.stringify(DEFAULT_DB));
      Object.assign(this, JSON.parse(fs.readFileSync(this.filename, options)));
    }
  }

  appendHistory(data) {
    this.history.push(data);
    if (this.history.length >= this.maxlen) {
      this.history.shift();
    }
    this.save();
  }

  getHistory() {
    return this.history;
  }

  getHistoryString() {
    return JSON.stringify({ history: this.history });
  }

  save() {
    fs.writeFileSync(this.filename, JSON.stringify(this));
  }

  addWindow(pin) {
    const uid = newUid(this.windows);
    this.windows.push({ uid, pin });
    this.save();
  }

  updateWindow(window) {
    const index = this.windows.findIndex((win) => (window.uid = win.uid));
    this.windows[index] = window;
    this.save();
  }

  deleteWindow(window) {
    const index = this.windows.findIndex((win) => (window.uid = win.uid));
    this.windows.splice(index, 1);
    this.save();
  }

  readWindows() {
    return this.windows.map((win) => {
      const windowPin = new Gpio(win.pin, "in");
      return windowPin.readSync();
    });
  }

  readSensors() {
    const dirs = fs.readdirSync(W1_PATH);
    for (let dir of dirs) {
      if (!dir.startsWith("28-")) continue;
      if (this.sensors.find((el) => el.name === dir)) continue;

      this.sensors.push({
        name: dir,
        mode: TEMP_MODES.IN,
      });
    }
    this.save();
  }

  readTemps() {
    if (this.sensors.length === 0) this.readSensors();

    const temps = this.sensors.map((sensor) => {
      const w1 = fs.readFileSync(`${W1_PATH}/${sensor.name}/w1_slave`, options);
      const temp = parseInt(w1.split("t=")[1].replace("\n", "")) / 1000;
      return {
        sensor: sensor.name,
        temp,
      };
    });

    return temps;
  }

  hourlyRead() {
    log("hourly read");
    this.appendHistory({
      time: Date.now(),
      sensors: this.readTemps(),
    });
  }
}

export default DB;
