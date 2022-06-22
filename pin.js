import { Gpio } from "onoff";

const windowPin = new Gpio(26, "in", "both");

windowPin.watch((err, value) => {
  if (err) throw err;

  console.log(value);
});
