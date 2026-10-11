import { createContext, useContext, useState } from "react";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  });

  const login = (data) => {
    localStorage.setItem("token", data.token);
    const u = { id: data.id, name: data.name, email: data.email };
    localStorage.setItem("user", JSON.stringify(u));
    setToken(data.token);
    setUser(u);
  };
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };
  return <Ctx.Provider value={{ token, user, login, logout }}>{children}</Ctx.Provider>;
}
