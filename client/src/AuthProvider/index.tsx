import React, { createContext, useState, useContext } from "react";

interface StoreContextValues {
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  token: string;
  setToken: React.Dispatch<React.SetStateAction<string>>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const StoreContext = createContext({} as StoreContextValues);

export const useAuth = () => useContext(StoreContext);

interface AuthProviderProps {
  children: JSX.Element;
}

interface ResponseBody {
  token: string;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [token, setToken] = useState<string>("");

  const login = async () => {
    const response = await fetch("http://localhost:5000/login", {
      method: "POST",
      body: JSON.stringify({
        username,
        password,
      }),
      headers: { "Content-Type": "application/json" },
    });
    const body: ResponseBody = await response.json();
    setToken(body.token);
  };

  const logout = async () => {
    setToken("");
    // const response = await fetch("http://localhost:5000/logout", {
    await fetch("http://localhost:5000/logout", {
      method: "POST",
      body: JSON.stringify({
        username,
        token,
      }),
      headers: { "Content-Type": "application/json" },
    });
    // const body: ResponseBody = await response.json();
  };

  const store: StoreContextValues = {
    username,
    setUsername,
    password,
    setPassword,
    token,
    setToken,
    login,
    logout,
  };

  return (
    <StoreContext.Provider value={store as StoreContextValues}>
      {children}
    </StoreContext.Provider>
  );
}
