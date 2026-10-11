import axios from "axios";
import { useEffect, useState } from "react";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api" });

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const p = window.location.pathname;
    if (err.response?.status === 401 && !p.startsWith("/login") && !p.startsWith("/register")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const errMsg = (e) =>
  e.response?.data?.message ||
  (e.request
    ? "Cannot reach the server. If it is on a free host it may be waking up - try again in a minute."
    : e.message);

export const today = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

export const pretty = (s) => (s || "").replace(/_/g, " ").toLowerCase().replace(/^\w|\s\w/g, (c) => c.toUpperCase());

export function useExercises() {
  const [list, setList] = useState([]);
  useEffect(() => {
    api.get("/exercises").then((r) => setList(r.data)).catch(() => {});
  }, []);
  return list;
}

export default api;
