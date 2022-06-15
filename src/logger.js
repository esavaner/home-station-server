import moment from "moment";

export const log = (message) => {
  const now = moment().format("YYYY-MM-DD;HH:mm:ss");
  console.log(`[${now}] ${message}`);
};
