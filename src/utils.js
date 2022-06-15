import { log } from "./logger.js";

let prev = 0;

export const debounce = (fn) => {
  const now = Date.now();
  if (now - prev > 3000) {
    prev = now;
    fn();
  }
};

export const newUid = (arr) => {
  return (arr.length > 0 ? Math.max(arr.map((item) => item.uid)) : 0) + 1;
};

export const setUpInterval = (db) => {
  const intv = setInterval(() => db.hourlyRead(), 60 * 60 * 1000);
  return intv;
};

export const setupTimer = (db) => {
  const now = new Date();
  const minutesToFull = 60 - now.getMinutes();
  log(`hourly interval start in ${minutesToFull} minutes`);
  setTimeout(() => {
    setUpInterval(db);
    log("interval started");
  }, minutesToFull * 60 * 1000);
};
