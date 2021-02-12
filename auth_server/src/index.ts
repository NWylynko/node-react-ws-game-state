import "source-map-support/register";
import express from "express";
import crypto from "crypto";
import cors from "cors";
import morgan from "morgan";

console.log("starting auth server");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get("/", (req, res) => {
  res.send("hey from auth server");
});

interface ClientWithPassword {
  username: string;
  password: string;
}

interface ConnectionRequest {
  serverId: string;
  timeout: number;
}

interface ClientWithToken {
  username: string;
  token: string;
}

interface GameServerWithToken {
  token: string;
  serverId: string;
}

interface Database extends ClientWithToken {
  connectionRequest?: ConnectionRequest;
}

let clients: Database[] = [];

app.post("/login", (req, res) => {
  const { body }: { body: ClientWithPassword } = req;
  const { username, password } = body;

  // need to look up user in db and throw error if not found / wrong password

  const newToken = crypto.randomBytes(32).toString("hex");
  console.log(newToken);

  // add the client and token to database
  clients.push({
    username,
    token: newToken,
  });

  res.json({ token: newToken });
});

app.post("/logout", (req, res) => {
  const { body }: { body: ClientWithToken } = req;

  // find and remove the client from the database
  clients = clients.filter((client) => client.token !== body.token);

  res.json({ info: "goodbye, thanks for playing" });
});

app.post("/game_server_connection_request", (req, res) => {
  const { body }: { body: GameServerWithToken } = req;

  clients = clients.map((client) => {
    if (client.token === body.token) {
      return {
        ...client,
        connectionRequest: {
          serverId: body.serverId,
          timeout: Date.now() + 30 * 1000,
        },
      };
    }
    return client;
  });

  res.json({ info: "have fun gaming" });
});

interface GameServerTokenVerifyBody extends ClientWithToken {
  serverId: string;
}

app.post("/verify_token", (req, res) => {
  const { body }: { body: GameServerTokenVerifyBody } = req;

  // check if token sent from server is in database
  const findClient = clients.filter((client) => client.token === body.token);

  if (findClient.length === 1) {
    const client = findClient[0];

    if (client.connectionRequest?.serverId === body.serverId) {
      if (client.connectionRequest.timeout > Date.now()) {
        res.json({
          valid: true,
        });
      } else {
        res.json({
          valid: false,
          reason: "connecting timeout ran out",
        });
      }
    } else {
      res.json({
        valid: false,
        reason: "rogue connection request to wrong server",
      });
    }
  } else {
    res.json({
      valid: false,
      reason: "client token is invalid",
    });
  }
});

app.get("/tokens", (req, res) => {
  res.json(clients);
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
