const PORT = 3000;
const DB_FILE = "./db.json";
const MAX_LENGTH = 48;
const W1_PATH = "/sys/bus/w1/devices";

const TEMP_MODES = {
  IN: "in",
  OUT: "out",
};

export { PORT, DB_FILE, MAX_LENGTH, W1_PATH, TEMP_MODES };
