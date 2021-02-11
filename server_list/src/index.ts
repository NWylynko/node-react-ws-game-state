import "source-map-support/register";
import express from "express";
import type { Server, ServerWithId } from "../../Types";
import cors from "cors";

console.log("starting server list server");

const app = express();
const PORT = 7000;

app.use(cors());
app.use(express.json());

const servers: ServerWithId[] = [];

app.get("/", (req, res) => {
  res.json(servers);
});

app.post("/", (req, res) => {
  const { body }: { body: Server } = req;
  console.log(body);
  const newServer: ServerWithId = { ...body, id: servers.length }; // dont -1 from servers.length because grabbing length before adding new item
  servers.push(newServer);

  res.json({ info: "thanks Mr gameserver", ...newServer });
});

app.delete("/", (req, res) => {
  const { body }: { body: ServerWithId } = req;
  console.log(body);

  servers.splice(body.id, 1);

  res.send("goodbye Mr gameserver");
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
