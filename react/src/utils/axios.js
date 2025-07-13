import axios from "axios";

const HOST_API = "http://localhost:5050/api";

const axiosInstance = axios.create({
  baseURL: HOST_API,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
