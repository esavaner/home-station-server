import axios from "axios";
import { OPEN_WEATHER_URL } from "../consts.js";

export const instance = axios.create({
  baseURL: OPEN_WEATHER_URL,
});
