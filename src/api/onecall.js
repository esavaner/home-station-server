//import { config } from "../utils.js";
import { instance } from "./config.js";
import { setupConfig } from "../utils.js";

const config = setupConfig("../../config.json");

const getOneCall = () =>
  instance
    .get("/onecall", {
      params: {
        lat: 51.06,
        lon: 16.97,
        appid: config.open_weather_key,
      },
    })
    .catch((e) => console.log(e));

async function f() {
  await getOneCall();
}

f();
