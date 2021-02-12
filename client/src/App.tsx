import React, { useState, useEffect } from "react";
import type { ServerWithId } from "../../Types";
// import geckos, { ClientChannel, Data } from "@geckos.io/client";

import { useGameServer } from "./ServerConnection";
import { useAuth } from "./AuthProvider";

export const App = () => {
  const { connected, id, lastMessage } = useGameServer();
  const { token, logout } = useAuth();

  // useEffect(() => {
  //   setUrl("http://localhost");
  //   setPort(4000);

  //   return () => {};
  // }, []);

  return (
    <div>
      <pre>id: {id}</pre>
      <pre>token: {token}</pre>
      <pre style={connected ? { color: "green" } : { color: "red" }}>
        status: {connected ? "connected" : "disconnected"}
      </pre>
      <pre>last message: {lastMessage}</pre>
      {token !== "" ? <button onClick={logout}>logout</button> : <LoginForm />}
      {token !== "" && <ServerList />}
    </div>
  );
};

const LoginForm = () => {
  // const { sendMessage } = useGameServer();

  const { username, setUsername, password, setPassword, login } = useAuth();

  return (
    <form style={{ display: "flex", flexDirection: "column", maxWidth: 300 }}>
      <label>Username</label>
      <input value={username} onChange={(e) => setUsername(e.target.value)} />
      <label>Password</label>
      <input value={password} onChange={(e) => setPassword(e.target.value)} />
      <button
        onClick={(e) => {
          e.preventDefault();
          login();
        }}
      >
        Login
      </button>
    </form>
  );
};

const ServerList = () => {
  const { setServerDetails } = useGameServer();
  const { token, username } = useAuth();

  const [data, setData] = useState<ServerWithId[]>([]);

  useEffect(() => {
    const fetchList = async () => {
      const response = await fetch("http://localhost:7000/");
      const body: ServerWithId[] = await response.json();
      setData(body);
    };
    fetchList();
  }, []);

  const onClick = async (server: ServerWithId) => {
    await fetch("http://localhost:5000/game_server_connection_request", {
      method: "POST",
      body: JSON.stringify({
        serverId: server.id,
        token,
      }),
      headers: { "Content-Type": "application/json" },
    });
    setServerDetails({
      url: server.url,
      port: parseInt(server.port),
      authorization: `${username} ${token}`,
    });
  };

  return (
    <div>
      {data.map((server) => (
        <div key={server.id}>
          <button
            onClick={() => {
              onClick(server);
            }}
          >
            {server.name}
          </button>
        </div>
      ))}
    </div>
  );
};
