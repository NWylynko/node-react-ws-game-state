import "source-map-support/register";
import type { GameState } from "../../Types";

import geckos, { Data, GeckosServer } from "@geckos.io/server";
import http from "http";
import express from "express";
import fetch from "node-fetch";
import morgan from "morgan";

const name = "offical server";
const url = "http://localhost";
const port = 4000;
let id: number;

const app = express();
app.use(morgan('dev'));
const server = http.createServer(app);
const io: GeckosServer = geckos({
  authorization: async (
    auth: string | undefined = ". .",
    request: http.IncomingMessage
  ) => {
    const x = auth?.split(" ");

    const username = x[0];
    const token = x[1];

    console.log(`token: ${token}`);

    const response = await fetch("http://localhost:5000/verify_token", {
      method: "POST",
      body: JSON.stringify({
        serverId: id,
        username,
        token,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const body = await response.json();

    return body.valid;
  },
});

app.get("/", (req, res) => {
  res.send("hey from game server");
});

app.get("/ping", (req, res) => {
  res.send("pong");
});

io.addServer(server);

io.onConnection((channel) => {
  console.log(`${channel.id} connected ${Date.now()}`);

  const messageChannel = "chat message";

  channel.on(messageChannel, (data: Data) => {
    console.log(`got ${data} from ${messageChannel} in ${channel.roomId}`);

    io.emit(messageChannel, `a short message: "${data}" sent to the client`);
  });

  channel.onDisconnect(() => {
    console.log(`${channel.id} disconnected`);
  });
});

server.listen(port, async () => {
  console.log(`listening on port ${port}`);

  try {
    const response = await fetch("http://localhost:7000/", {
      method: "POST",
      body: JSON.stringify({
        name,
        url,
        port,
      }),
      headers: { "Content-Type": "application/json" },
    });
    const json = await response.json();
    console.log(`successfully contacted server list with id: ${json.id}`);
    id = json.id;
  } catch (error) {
    console.error("failed to contact server list");
  }
});

const exitHandler = async (event: NodeJS.Signals) => {
  console.log(`--- Stopping ---`);

  console.log("Signal: ", event);

  server.close();

  console.log("GoodBye 👋");

  try {
    await fetch("http://localhost:7000/", {
      method: "DELETE",
      body: JSON.stringify({
        name,
        url,
        port,
        id,
      }),
      headers: { "Content-Type": "application/json" },
    });
    console.log(`successfully contacted server list`);
  } catch (error) {
    console.error("failed to contact server list");
  }

  process.exit(0);
};

process.on("SIGINT", exitHandler);
process.on("SIGTERM", exitHandler);
process.on("SIGUSR2", exitHandler);
