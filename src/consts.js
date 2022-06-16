const PORT = 8080;
const DB_FILE = "./db.json";
const MAX_LENGTH = 48;
const W1_PATH = "/sys/bus/w1/devices";
const DEFAULT_CLIENT = "http://192.168.0.1";

const TEMP_MODES = {
  IN: "in",
  OUT: "out",
};

export { PORT, DB_FILE, MAX_LENGTH, W1_PATH, TEMP_MODES, DEFAULT_CLIENT };
