import { Controller, ControllerRead, SensorRead } from "@esavaner/home-station";
import axios from "axios";

export const readTemp = (ip: string) =>
  axios.get<number>(`http://${ip}/temp`).then(({ data }) => data);

export const readSensors = (con: Controller) =>
  axios
    .post<SensorRead[]>(`http://${con.ip}/read`, {
      sensors: con.sensors,
    })
    .then(({ data }) => data);
