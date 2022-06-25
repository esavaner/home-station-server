import { Gpio } from "onoff";

const windowPin = new Gpio(21, "both");

// windowPin.writeSync(0);

console.log(windowPin.readSync());

// windowPin.watch((err, value) => {
//   if (err) throw err;

//   console.log(value);
// });
