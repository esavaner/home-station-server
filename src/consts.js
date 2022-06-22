const PORT = 8080;
const DB_FILE = "./db.json";
const MAX_LENGTH = 48;
const W1_PATH = "/sys/bus/w1/devices";
const DEFAULT_CLIENT = "http://localhost:3000";
const OPEN_WEATHER_URL = "https://api.openweathermap.org/data/3.0";

const PIN_MODES = {
  WINDOW: "window",
  RAIN: "rain",
};

export {
  PORT,
  DB_FILE,
  MAX_LENGTH,
  W1_PATH,
  DEFAULT_CLIENT,
  PIN_MODES,
  OPEN_WEATHER_URL,
};
