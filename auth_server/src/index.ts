import "source-map-support/register";
import express from "express";
import crypto from "crypto";
import cors from "cors";

console.log("starting auth server");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("hey from auth server");
});

interface ClientWithPassword {
  username: string;
  password: string;
}

interface ClientWithToken {
  username: string;
  token: string;
}

let clients: ClientWithToken[] = [];

app.post("/login", (req, res) => {
  const { body }: { body: ClientWithPassword } = req;
  const { username, password } = body;

  // need to look up user in db and throw error if not found / wrong password

  const newToken = crypto.randomBytes(32).toString("hex");
  console.log(newToken);

  clients.push({
    username,
    token: newToken,
  });

  res.json({ token: newToken });
});

app.post("/logout", (req, res) => {
  const { body }: { body: ClientWithToken } = req;

  clients = clients.filter((client) => client.token !== body.token);

  res.json({ info: "goodbye, thanks for playing" });
});

app.post("/verify_token", (req, res) => {
  const { body }: { body: ClientWithToken } = req;

  const findClient = clients.filter((client) => client.token === body.token);

  res.json({
    valid: findClient.length === 1,
  });
});

app.get("/tokens", (req, res) => {
  res.json(clients);
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
