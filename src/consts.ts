const PORT = 8080;
const DB_FILE = "./db.json";
const STATUS_THROTTLE = 15 * 60 * 1000;
const ONECALL_THROTTLE = 5 * 60 * 1000;
const W1_PATH = "/sys/bus/w1/devices";
const DEFAULT_CLIENT = "http://localhost:3000";
const OPEN_WEATHER_URL = "https://api.openweathermap.org/data/3.0";

enum PIN_MODES {
  WINDOW = "window",
  RAIN = "rain",
}

export {
  PORT,
  DB_FILE,
  W1_PATH,
  DEFAULT_CLIENT,
  PIN_MODES,
  OPEN_WEATHER_URL,
  STATUS_THROTTLE,
  ONECALL_THROTTLE,
};
