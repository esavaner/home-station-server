import { instance } from "./config";
import { setupConfig } from "../utils";

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
  const t = await getOneCall();
  console.log(t);
}

f();
