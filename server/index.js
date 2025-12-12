import express from "express";
import cors from "cors";
import { AccessToken } from "livekit-server-sdk";

const app = express();
app.use(cors());
app.use(express.json());

// ใช้ devkey/secret ตอน local dev
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY ?? "devkey";
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET ?? "secret";

app.post("/livekit/token", async (req, res) => {
  const { roomName, identity, name } = req.body;
  if (!roomName || !identity) {
    return res.status(400).json({ error: "roomName and identity required" });
  }

  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity,
    name: name ?? identity,
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  const token = await at.toJwt();
  res.json({ token  });
});

app.listen(3001, () => {
  console.log("Token server on http://localhost:3001/livekit/token");
});
