import axios from "axios";
import { OPEN_WEATHER_URL } from "../consts";

export const instance = axios.create({
  baseURL: OPEN_WEATHER_URL,
});
