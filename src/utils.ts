import fs from "fs";
import moment from "moment";
import DB from "./db";

export const throttle = (fn: () => any, time = 60000) => {
  let t = true;
  return () => {
    if (t) {
      fn();
      t = false;
      setTimeout(() => {
        t = true;
      }, time);
    }
  };
};

export const stringResponse = (response: any) => {
  return JSON.stringify(response);
};

// export const newUid = (arr) => {
//   return (arr.length > 0 ? Math.max(arr.map((item) => item.uid)) : 0) + 1;
// };

export const setUpInterval = (db: DB) => {
  const intv = setInterval(() => db.hourlyRead(), 60 * 60 * 1000);
  return intv;
};

export const log = (message: string) => {
  const now = moment().format("YYYY-MM-DD;HH:mm:ss");
  console.log(`[${now}] ${message}`);
};

export const setupTimer = (db: DB) => {
  const now = new Date();
  const minutesToFull = now.getMinutes() % 10;
  log(`interval start in ${minutesToFull} minutes`);
  setTimeout(() => {
    setUpInterval(db);
    log("interval started");
  }, minutesToFull * 60 * 1000);
};

let config;

export const setupConfig = (path: string) => {
  config = JSON.parse(fs.readFileSync(path, { encoding: "utf-8" }));
  return config;
};

export { config };
