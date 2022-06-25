import { instance } from "./config";
import { setupConfig } from "../utils";
import { onecallexample } from "./onecallmock";
import { OneCallModel } from "./onecall.model";

const config = setupConfig("./config.json");

export const getOneCall = () =>
  instance
    .get<OneCallModel>("/onecall", {
      params: {
        lat: 51.06,
        lon: 16.97,
        appid: config.open_weather_key,
      },
    })
    .then(({ data }) => data);

export const getOneCallMock = async () => {
  await Promise.resolve(() => setTimeout(() => null, 1000));
  return Promise.resolve(onecallexample);
};
