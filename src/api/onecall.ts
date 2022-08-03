import { instance } from "./config";
import { setupConfig } from "../utils";
import { onecallexample } from "./onecallmock";
import { OneCallModel } from "@esavaner/home-station";
import { Location } from "@esavaner/home-station";

const config = setupConfig("./config.json");
export const getOneCall = (loc?: Location) =>
  instance
    .get<OneCallModel>("/onecall", {
      params: {
        lat: loc ? loc.lat : 51.06,
        lon: loc ? loc.lon : 16.97,
        appid: config.open_weather_key,
        units: config.units,
      },
    })
    .then(({ data }) => data);

export const getOneCallMock = async () => {
  await Promise.resolve(() => setTimeout(() => null, 1000));
  return Promise.resolve(onecallexample);
};
