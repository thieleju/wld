import axios from "axios";

const server_url = import.meta.env.DEV
  ? import.meta.env.VITE_API_DEV
  : import.meta.env.VITE_API_PROD;

// axios instance
const instance = axios.create({
  baseURL: server_url,
  // headers: {
  //   "Content-Type": "application/json",
  // },
});

export default instance;
