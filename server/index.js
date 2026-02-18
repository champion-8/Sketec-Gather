import express from "express";
import cors from "cors";
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import { OAuth2Client } from "google-auth-library";

const app = express();
app.use(cors());
app.use(express.json());

// ใช้ devkey/secret ตอน local dev
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY ?? "devkey";
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET ?? "secret";
const LIVEKIT_HOST = process.env.LIVEKIT_HOST ?? "http://localhost:7880";

const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ??
  "808589453016-4t5lj4i5vp3oqqi72u5nbj1igmv3uket.apps.googleusercontent.com";

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const roomService = new RoomServiceClient(
  LIVEKIT_HOST,
  LIVEKIT_API_KEY,
  LIVEKIT_API_SECRET,
);

// ✅ memory store (โปรดักชันควรใช้ DB)
const userStore = new Map(); // email -> { name, avatar }

app.post("/livekit/google-token", async (req, res) => {
  try {
    const { roomName, idToken, name } = req.body;
    if (!roomName || !idToken) {
      return res.status(400).json({ error: "roomName and idToken required" });
    }
    // if (!GOOGLE_CLIENT_ID) {
    //   return res.status(500).json({ error: "GOOGLE_CLIENT_ID not configured" });
    // }

    // // 1) verify Google ID token
    // const ticket = await googleClient.verifyIdToken({
    //   idToken,
    //   audience: GOOGLE_CLIENT_ID,
    // });
    // const payload = ticket.getPayload();
    // const email = payload?.email;
    // const nameFromGoogle = payload?.name ?? email;

    // if (!email)
    //   return res.status(401).json({ error: "google email not found" });

    // // 2) 1 Gmail = 1 character (จำครั้งแรกไว้)
    // const existing = userStore.get(email);
    // const profile = existing ?? {
    //   name: nameFromGoogle,
    //   avatar: avatar || null,
    // };

    // // ล็อกตัวละครไว้: ถ้าเคยมีแล้ว ไม่ให้เปลี่ยน avatar (ตาม requirement)
    // if (!existing) {
    //   userStore.set(email, profile);
    // }

    // // 3) ดีดของเก่าออก (ถ้ามีอยู่ในห้อง)
    // try {
    //   const list = await roomService.listParticipants(roomName);
    //   const found = list?.participants?.some((p) => p.identity === email);

    //   if (found) {
    //     await roomService.removeParticipant(roomName, email);
    //   }
    // } catch (e) {
    //   // ถ้าห้องยังไม่ถูกสร้าง หรือ list ไม่ได้ ค่อย log ไว้ดู
    //   console.warn("kick-old-session failed:", e?.message || e);
    // }

    // 4) ออก LiveKit token โดยใช้ email เป็น identity
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: idToken,
      name: name ?? idToken,
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      // ไม่ต้อง roomAdmin ถ้าไม่อยากให้ทุกคนเป็นแอดมิน
    });

    const token = await at.toJwt();
    res.json({
      token,
      profile: { email: idToken, name: name ?? idToken, avatar: null },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e?.message || e) });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Token server listening on port ${port}`);
});
