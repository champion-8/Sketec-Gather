import React, { useRef, useState, useEffect, useCallback } from "react";
import "./styles.css";
import { Room, RoomEvent, Track } from "livekit-client";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  MonitorOff,
  Sparkles,
  Volume2,
  Settings,
  Users,
  DoorOpen,
  DoorClosed,
  BellRing,
  CheckCircle2,
  XCircle,
  Hand,
  Lock,
  MessageCircle,
  Footprints,
  GitPullRequestArrow,
} from "lucide-react";

const GOOGLE_TOKEN_ENDPOINT =
  import.meta.env.VITE_GOOGLE_TOKEN_ENDPOINT ||
  "http://localhost:3001/livekit/google-token";
const TOKEN_ENDPOINT =
  import.meta.env.VITE_TOKEN_ENDPOINT || "http://localhost:3001/livekit/token";
const MUTE_MIC_ENDPOINT =
  import.meta.env.VITE_MUTE_MIC_ENDPOINT ||
  "http://localhost:3001/livekit/mute-mic";
const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL;

const MAP_WIDTH = 2670;
const MAP_HEIGHT = 2000;
const SPEED = 8;
const COLLISION_RADIUS = 40;
const GRID_SIZE = 40;

// --- Assets ---
const AVATARS = [
  "https://www.pngkey.com/png/full/148-1483951_natsu-chibi-png.png",
  "https://www.wallsnapy.com/img_gallery/cute-one-piece-chibi-luffy-anime-style-uhd-323923.png",
  "https://freepngimg.com/thumb/one_piece/23087-3-one-piece-chibi-transparent-thumb.png",
  "https://png.pngtree.com/png-vector/20230801/ourmid/pngtree-cartoon-one-piece-stickers-with-a-hat-vector-png-image_6818478.png",
  "https://mystickermania.com/cdn/stickers/chibi-marvel-dc-comics/marvel-cute-groot-512x512.png",
  "https://www.pngplay.com/wp-content/uploads/8/Thor-Avengers-Background-PNG-Image.png",
  "https://png.pngtree.com/png-clipart/20230913/original/pngtree-avenger-clipart-cartoon-character-with-red-hair-and-metal-suit-vector-png-image_11074409.png",
  "https://mystickermania.com/cdn/stickers/chibi-marvel-dc-comics/chibi-marvel-deadpool-512x512.png",
  "https://mystickermania.com/cdn/stickers/chibi-marvel-dc-comics/marvel-chibi-thor-512x512.png",
  "https://mystickermania.com/cdn/stickers/chibi-marvel-dc-comics/marvel-chibi-doctor-strange-512x512.png",
  "https://file.aiquickdraw.com/imgcompressed/img/compressed_255d3d4fcb5101e4842d30dde465a6da.webp",
  "https://png.pngtree.com/png-vector/20241025/ourmid/pngtree-adorable-super-baby-young-superhero-kid-cartoon-on-transparent-background-png-image_14153984.png",
  "https://freepngimg.com/save/149647-chibi-iron-man-png-download-free/555x555",
  "https://png.pngtree.com/png-vector/20241203/ourmid/pngtree-professional-chibi-character-with-a-red-tie-png-image_14191758.png",
  "https://png.pngtree.com/png-clipart/20230407/original/pngtree-cute-school-anime-chibi-character-png-image_9035249.png",
  "https://png.pngtree.com/png-vector/20241122/ourmid/pngtree-cute-santa-chibi-characters-vector-png-image_14537022.png",
  "https://static.vecteezy.com/system/resources/thumbnails/051/135/766/small/stylized-cartoon-ninja-character-illustration-free-png.png",
  "https://png.pngtree.com/png-vector/20250609/ourmid/pngtree-3d-chibi-dragon-knight-character-png-image_16401585.png",
  "https://png.pngtree.com/png-vector/20241009/ourmid/pngtree-cute-chibi-costume-dragon-png-image_14042529.png",
  "https://png.pngtree.com/png-clipart/20240806/original/pngtree-teacher-chibi-3d-transparent-png-image_15714206.png",
  "https://static.vecteezy.com/system/resources/previews/033/494/475/non_2x/cute-chibi-school-girl-ai-generative-png.png",
  "https://static.vecteezy.com/system/resources/thumbnails/033/494/737/small/cute-chibi-school-girl-ai-generative-png.png",
  "https://static.vecteezy.com/system/resources/thumbnails/033/494/777/small/cute-chibi-girl-wearing-a-cat-hoodie-ai-generative-png.png",
  "https://png.pngtree.com/png-vector/20240506/ourmid/pngtree-cute-chibi-girl-manga-characters-png-image_12368178.png",
];

const ZONES = [
  {
    id: "hospital",
    name: "Hospital",
    x: 280,
    y: 200,
    w: 500,
    h: 550,
    color: "#3b82f6",
  },
  { id: "bar", name: "Bar", x: 100, y: 1200, w: 680, h: 430, color: "#eab308" },
  {
    id: "holiday_villa",
    name: "Holiday Villa",
    x: 850,
    y: 1150,
    w: 960,
    h: 520,
    color: "#ec4899",
  },
  {
    id: "meeting_2",
    name: "Meeting",
    x: 940,
    y: 80,
    w: 840,
    h: 380,
    color: "#45cca8ff",
  },
  {
    id: "garden",
    name: "Garden",
    x: 810,
    y: 510,
    w: 850,
    h: 590,
    color: "#6945c5ff",
  },
  {
    id: "basketball",
    name: "Basketball",
    x: 1790,
    y: 80,
    w: 790,
    h: 380,
    color: "#38bb77ff",
  },
  {
    id: "fashion",
    name: "Fashion",
    x: 0,
    y: 850,
    w: 370,
    h: 300,
    color: "#bb3838ff",
  },
  {
    id: "barber",
    name: "Barber",
    x: 1740,
    y: 480,
    w: 590,
    h: 250,
    color: "#085972ff",
  },
  {
    id: "shop",
    name: "Shop",
    x: 1720,
    y: 780,
    w: 420,
    h: 300,
    color: "#b38300ff",
  },
  {
    id: "car",
    name: "Car",
    x: 1990,
    y: 1120,
    w: 180,
    h: 150,
    color: "#b10000ff",
  },
  {
    id: "house",
    name: "House",
    x: 2120,
    y: 1420,
    w: 350,
    h: 280,
    color: "#190aa5ff",
  },
];

const OBSTACLES = [
  { id: "wall-top", x: 0, y: 0, w: 2000, h: 80 },
  { id: "wall-bottom", x: 0, y: 1910, w: 2000, h: 90 },
];

const STATUS_OPTIONS = [
  { label: "Available", color: "#22c55e" },
  { label: "Busy", color: "#f59e0b" },
  { label: "Do Not Disturb", color: "#ef4444" },
];

const LS_KEY = "sketec_world_profile_v1";

const DEFAULT_PROFILE_PIC = "https://www.gravatar.com/avatar/?d=mp&f=y"; // 👤 neutral

function loadAllProfiles() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function loadProfileByEmail(email) {
  if (!email) return null;
  const all = loadAllProfiles();
  return all[email] || null;
}

function saveProfileByEmail(email, profile) {
  if (!email) return;
  const all = loadAllProfiles();
  all[email] = profile;
  localStorage.setItem(LS_KEY, JSON.stringify(all));
}

function clearProfileByEmail(email) {
  if (!email) return;
  const all = loadAllProfiles();
  delete all[email];
  localStorage.setItem(LS_KEY, JSON.stringify(all));
}

function getDistance(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}
function checkZone(x, y) {
  return (
    ZONES.find(
      (z) => x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h
    ) || null
  );
}
function checkObstacle(x, y) {
  return OBSTACLES.some(
    (o) => x >= o.x && x <= o.x + o.w && y >= o.y && y <= o.y + o.h
  );
}

function getRandomSpawn() {
  let spawn;
  let valid = false;
  while (!valid) {
    spawn = {
      x: 1000 + (Math.random() * 400 - 200),
      y: 1000 + (Math.random() * 400 - 200),
    };
    if (!checkObstacle(spawn.x, spawn.y)) valid = true;
  }
  return spawn;
}

function hasLineOfSight(a, b) {
  const step = 10;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy);
  const n = Math.ceil(dist / step);

  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = a.x + dx * t;
    const y = a.y + dy * t;
    if (checkObstacle(x, y)) return false;
  }
  return true;
}

function smoothPath(path) {
  if (!path || path.length <= 2) return path || [];
  const out = [path[0]];
  let i = 0;

  while (i < path.length - 1) {
    let j = path.length - 1;
    while (j > i + 1) {
      if (hasLineOfSight(path[i], path[j])) break;
      j--;
    }
    out.push(path[j]);
    i = j;
  }
  return out;
}

// --- Pathfinding Logic (A*) ---
let grid = null;
function initGrid() {
  const cols = Math.ceil(MAP_WIDTH / GRID_SIZE);
  const rows = Math.ceil(MAP_HEIGHT / GRID_SIZE);
  grid = new Array(rows).fill(0).map(() => new Array(cols).fill(0));
  OBSTACLES.forEach((o) => {
    const startX = Math.floor(o.x / GRID_SIZE);
    const startY = Math.floor(o.y / GRID_SIZE);
    const endX = Math.floor((o.x + o.w) / GRID_SIZE);
    const endY = Math.floor((o.y + o.h) / GRID_SIZE);
    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        if (y >= 0 && y < rows && x >= 0 && x < cols) grid[y][x] = 1;
      }
    }
  });
}
function findPath(startX, startY, endX, endY) {
  if (!grid) initGrid();
  const startNode = {
    x: Math.floor(startX / GRID_SIZE),
    y: Math.floor(startY / GRID_SIZE),
  };
  const endNode = {
    x: Math.floor(endX / GRID_SIZE),
    y: Math.floor(endY / GRID_SIZE),
  };
  if (startNode.x < 0 || startNode.y < 0 || endNode.x < 0 || endNode.y < 0)
    return [];
  if (grid[endNode.y] && grid[endNode.y][endNode.x] === 1) return [];

  let openList = [startNode];
  let closedList = [];
  let cameFrom = {};
  startNode.g = 0;
  startNode.f = getDistance(startNode, endNode);

  while (openList.length > 0) {
    openList.sort((a, b) => a.f - b.f);
    let current = openList.shift();
    if (current.x === endNode.x && current.y === endNode.y) {
      let path = [];
      let temp = current;
      while (temp) {
        path.push({
          x: temp.x * GRID_SIZE + GRID_SIZE / 2,
          y: temp.y * GRID_SIZE + GRID_SIZE / 2,
        });
        temp = cameFrom[`${temp.x},${temp.y}`];
      }
      return path.reverse();
    }
    closedList.push(current);

    const neighbors = [
      { x: current.x + 1, y: current.y, cost: 1 },
      { x: current.x - 1, y: current.y, cost: 1 },
      { x: current.x, y: current.y + 1, cost: 1 },
      { x: current.x, y: current.y - 1, cost: 1 },
      { x: current.x + 1, y: current.y + 1, cost: Math.SQRT2 },
      { x: current.x + 1, y: current.y - 1, cost: Math.SQRT2 },
      { x: current.x - 1, y: current.y + 1, cost: Math.SQRT2 },
      { x: current.x - 1, y: current.y - 1, cost: Math.SQRT2 },
    ];

    for (let neighbor of neighbors) {
      if (
        neighbor.x < 0 ||
        neighbor.y < 0 ||
        neighbor.y >= grid.length ||
        neighbor.x >= grid[0].length
      )
        continue;
      if (grid[neighbor.y][neighbor.x] === 1) continue;
      if (closedList.find((n) => n.x === neighbor.x && n.y === neighbor.y))
        continue;

      let tentativeG = current.g + neighbor.cost;
      let existing = openList.find(
        (n) => n.x === neighbor.x && n.y === neighbor.y
      );
      if (!existing || tentativeG < existing.g) {
        neighbor.g = tentativeG;
        neighbor.f = neighbor.g + getDistance(neighbor, endNode);
        cameFrom[`${neighbor.x},${neighbor.y}`] = current;
        if (!existing) openList.push(neighbor);
      }
    }
  }
  return [];
}

function getNearestOutsidePointOnZoneEdge(x, y, zone, margin = 18) {
  const left = zone.x;
  const right = zone.x + zone.w;
  const top = zone.y;
  const bottom = zone.y + zone.h;

  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

  const candidates = [
    { edge: "left", x: left - margin, y: clamp(y, top, bottom) },
    { edge: "right", x: right + margin, y: clamp(y, top, bottom) },
    { edge: "top", x: clamp(x, left, right), y: top - margin },
    { edge: "bottom", x: clamp(x, left, right), y: bottom + margin },
  ];

  candidates.sort(
    (a, b) => getDistance({ x, y }, a) - getDistance({ x, y }, b)
  );
  return candidates[0];
}

function clampOutsideLocked(x, y, myId, isZoneLocked, isAllowedInZone) {
  const z = checkZone(x, y);
  if (z?.id && isZoneLocked(z.id) && !isAllowedInZone(z.id, myId)) {
    // ดันออกไปขอบนอกห้องแทน
    const outside = getNearestOutsidePointOnZoneEdge(x, y, z, 24); // margin 24 แนะนำเพิ่มนิด
    return { x: outside.x, y: outside.y, blocked: true };
  }
  return { x, y, blocked: false };
}

function forceKickOutsideZone(pos, zone) {
  const outside = getNearestOutsidePointOnZoneEdge(
    pos.x,
    pos.y,
    zone,
    28 // margin กันติดขอบ
  );

  return {
    x: outside.x,
    y: outside.y,
  };
}

const VideoRenderer = ({
  track,
  participantId,
  isLocal,
  onMaximize,
  isMaximized,
  showRightPanel,
}) => {
  const videoRef = useRef(null);
  useEffect(() => {
    const el = videoRef.current;
    if (track && el) track.attach(el);
    return () => {
      if (track && el) {
        track.detach(el);
        el.srcObject = null;
      }
    };
  }, [track]);

  return (
    <div
      className={`video-card ${isMaximized ? "maximized" : ""}`}
      style={{
        width: isMaximized
          ? showRightPanel
            ? "calc(100vw - 320px)"
            : "100vw"
          : "200px",
      }}
    >
      <video ref={videoRef} playsInline autoPlay muted={isLocal} />
      <div className="video-info-bar">
        <span>{isLocal ? "Me" : participantId}</span>
        <button className="expand-btn" onClick={() => onMaximize(track.sid)}>
          {isMaximized ? "✖" : "⤢"}
        </button>
      </div>
    </div>
  );
};

function getLastLoggedInProfile() {
  const all = loadAllProfiles();
  const list = Object.values(all || {}).filter((p) => p?.loggedIn && p?.email);

  if (!list.length) return null;

  // เอาคนที่ login ล่าสุด
  list.sort((a, b) => (b.lastLoginAt || 0) - (a.lastLoginAt || 0));
  return list[0];
}

export default function App() {
  const REQUEST_TTL_MS = 20000;
  const [requestCountdown, setRequestCountdown] = useState(0);
  const requestTimerRef = useRef(null);
  const googleBtnRef = useRef(null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const [knock, setKnock] = useState(false);
  const knockTimerRef = useRef(null);

  const [joined, setJoined] = useState(false);
  const [inputName, setInputName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [connected, setConnected] = useState(false);
  const [identity, setIdentity] = useState("Player");
  const [displayName, setDisplayName] = useState("Player");

  const initialPos = getRandomSpawn();
  const [myPos, setMyPos] = useState(initialPos);

  const [myFacing, setMyFacing] = useState("right");
  const [myZone, setMyZone] = useState(null);
  const [myAvatar, setMyAvatar] = useState(selectedAvatar);

  const [myAvailability, setMyAvailability] = useState("Available");
  const [myStatusText, setMyStatusText] = useState("");

  const [otherPlayers, setOtherPlayers] = useState({});
  const [speakingIds, setSpeakingIds] = useState([]);

  const [lockedZones, setLockedZones] = useState({});
  const lockedZonesRef = useRef({});
  useEffect(() => {
    lockedZonesRef.current = lockedZones;
  }, [lockedZones]);

  const [joinRequests, setJoinRequests] = useState([]);
  const pendingEnterRef = useRef(null); // { zoneId, x, y }

  const pinchRef = useRef({ active: false, startDist: 0, startZoom: 1 });

  const roomRef = useRef(null);
  const audioTracksRef = useRef({});
  const posRef = useRef(initialPos);
  const targetRef = useRef(initialPos);
  const pathRef = useRef([]);
  const facingRef = useRef("right");
  const isMovingRef = useRef(false);
  const micOnRef = useRef(true);
  const markerIdRef = useRef(0);
  const followingRef = useRef(null);
  const otherPlayersRef = useRef({});
  const isGhostRef = useRef(false);
  const requestTokenRef = useRef(0);

  const [authed, setAuthed] = useState(false); // ✅ login ผ่าน google แล้ว
  const [profile, setProfile] = useState(null); // {email,name,avatar,picture}
  const [draftName, setDraftName] = useState(""); // ✅ ให้แก้ชื่อก่อน join
  const [draftAvatar, setDraftAvatar] = useState(AVATARS[0]);

  useEffect(() => {
    const p = getLastLoggedInProfile(); // ✅ โหลดคนที่ login ค้างไว้ล่าสุด
    if (p?.email) {
      setAuthed(true);
      setProfile(p);
      setDraftName(p.name || "");
      setDraftAvatar(p.avatar || AVATARS[0]);
      setJoined(false);
    } else {
      setAuthed(false);
      setProfile(null);
    }
  }, []);

  const stopJoinRequestTimers = () => {
    if (requestTimerRef.current) {
      clearInterval(requestTimerRef.current);
      requestTimerRef.current = null;
    }
    if (knockTimerRef.current) {
      clearTimeout(knockTimerRef.current);
      knockTimerRef.current = null;
    }
    setRequestCountdown(0);
    setKnock(false);
  };

  // ✅ cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (requestTimerRef.current) {
        clearInterval(requestTimerRef.current);
        requestTimerRef.current = null;
      }
      if (knockTimerRef.current) {
        clearTimeout(knockTimerRef.current);
        knockTimerRef.current = null;
      }
    };
  }, []);

  const publishReliable = async (msg) => {
    if (!roomRef.current) return;
    await roomRef.current.localParticipant.publishData(
      new TextEncoder().encode(JSON.stringify(msg)),
      { reliable: true }
    );
  };

  const setZoneLockState = async (zoneId, locked) => {
    const allowed = new Set();

    if (locked) {
      allowed.add(identity);
      Object.entries(otherPlayersRef.current).forEach(([pid, p]) => {
        if (p?.z === zoneId) allowed.add(pid);
      });
    }

    const next = {
      ...(lockedZonesRef.current || {}),
      [zoneId]: {
        locked,
        by: displayName,
        byId: identity,
        allowedIds: locked ? Array.from(allowed) : [],
        ts: Date.now(),
      },
    };

    setLockedZones(next);

    await publishReliable({
      type: "zone_lock",
      zoneId,
      state: next[zoneId],
    });

    // 🔴 ถ้าตัวเราอยู่ในห้องนี้ แต่ไม่ได้อยู่ใน allowedIds → ดีดออก
    const z = myZone;
    if (
      locked &&
      z?.id === zoneId &&
      !next[zoneId].allowedIds.includes(identity)
    ) {
      const kicked = forceKickOutsideZone(posRef.current, z);

      posRef.current = kicked;
      targetRef.current = kicked;
      pathRef.current = [];
      setMyPos({ ...kicked });
    }
  };

  const cancelJoinRequest = async (zoneId) => {
    await publishReliable({
      type: "zone_join_cancel",
      zoneId,
      requesterId: identity,
    });
  };

  const requestJoinZone = async (zoneId, x, y) => {
    pendingEnterRef.current = { zoneId, x, y };

    // เคลียร์ของเก่าก่อนเริ่มใหม่
    stopJoinRequestTimers();

    // token กัน interval เก่าค้าง
    const myToken = ++requestTokenRef.current;

    // เคาะประตู 1.2s
    setKnock(true);
    knockTimerRef.current = setTimeout(() => setKnock(false), 1200);

    // countdown
    setRequestCountdown(Math.ceil(REQUEST_TTL_MS / 1000));
    const startedAt = Date.now();

    // ✅ เก็บ intervalId แบบ local เพื่อ clear "ตัวเอง"
    const intervalId = setInterval(async () => {
      // ถ้าไม่ใช่ request ล่าสุด ให้หยุด interval ตัวนี้ทันที
      if (requestTokenRef.current !== myToken) {
        clearInterval(intervalId);
        return;
      }

      const left = REQUEST_TTL_MS - (Date.now() - startedAt);
      const sec = Math.max(0, Math.ceil(left / 1000));
      setRequestCountdown(sec);

      if (left <= 0) {
        // invalidate + stop
        requestTokenRef.current++;
        clearInterval(intervalId);

        // เฉพาะถ้า interval นี้คืออันล่าสุดค่อยล้าง ref
        if (requestTimerRef.current === intervalId) {
          requestTimerRef.current = null;
        }

        stopJoinRequestTimers();
        pendingEnterRef.current = null;

        await cancelJoinRequest(zoneId);

        setChatMessages((prev) => [
          ...prev,
          {
            sender: "System",
            text: `⌛ Request timed out.`,
            type: "global",
            timestamp: Date.now(),
          },
        ]);
      }
    }, 250);

    // ✅ เก็บ ref ของ "อันล่าสุด"
    requestTimerRef.current = intervalId;

    await publishReliable({
      type: "zone_join_req",
      zoneId,
      requesterId: identityRef.current, // ✅ ใช้ ref
      requesterName: displayNameRef.current, // ✅ ใช้ ref
    });
  };

  const respondJoinZone = async (zoneId, requesterId, ok) => {
    await publishReliable({
      type: "zone_join_resp",
      zoneId,
      requesterId,
      ok,
      approverId: identityRef.current,
      approverName: displayNameRef.current,
    });

    if (ok) {
      const cur = lockedZonesRef.current?.[zoneId];
      if (cur?.locked) {
        const allowed = new Set(cur.allowedIds || []);
        allowed.add(requesterId);

        const next = {
          ...lockedZonesRef.current,
          [zoneId]: { ...cur, allowedIds: Array.from(allowed) },
        };
        setLockedZones(next);

        await publishReliable({
          type: "zone_lock",
          zoneId,
          state: next[zoneId],
        });
      }
    }
  };

  const getTouchDist = (t1, t2) => {
    const dx = t2.clientX - t1.clientX;
    const dy = t2.clientY - t1.clientY;
    return Math.hypot(dx, dy);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = getTouchDist(e.touches[0], e.touches[1]);
      pinchRef.current = { active: true, startDist: dist, startZoom: zoom };
    }
  };

  const handleTouchMove = (e) => {
    if (pinchRef.current.active && e.touches.length === 2) {
      e.preventDefault();
      const dist = getTouchDist(e.touches[0], e.touches[1]);
      const ratio = dist / pinchRef.current.startDist;

      const minZoom = getMinZoom();
      const next = pinchRef.current.startZoom * ratio;

      setZoom(Math.min(Math.max(minZoom, next), 2.5));
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length < 2) pinchRef.current.active = false;
  };

  const muteOtherForEveryone = async (targetId, muted = true) => {
    // ✅ กติกา: ปิดได้เฉพาะคนที่ "คุยกันได้"
    if (!canHear(targetId)) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "System",
          text: "🔇 You can mute only nearby / same room users.",
          type: "global",
          timestamp: Date.now(),
        },
      ]);
      return;
    }

    await publishReliable({
      type: "force_mute",
      targetId: targetId,
    });
    // await fetch(MUTE_MIC_ENDPOINT, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     roomName: "OfficeMap",
    //     targetIdentity: targetId,
    //     muted,
    //   }),
    // });
  };

  const [zoom, setZoom] = useState(0.6);
  const [viewport, setViewport] = useState({
    w: window.innerWidth,
    h: window.innerHeight,
  });

  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const [activeTab, setActiveTab] = useState("members");
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [dmTarget, setDmTarget] = useState(null);
  const [summonRequest, setSummonRequest] = useState(null);
  const [joinResult, setJoinResult] = useState(null);
  const [followingId, setFollowingId] = useState(null);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef(null);

  const [clickMarker, setClickMarker] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(false);
  const [screenOn, setScreenOn] = useState(false);
  const [noiseOn, setNoiseOn] = useState(true);

  const [isGhost, setIsGhost] = useState(false);

  const [videoTracks, setVideoTracks] = useState([]);
  const [maximizedTrackId, setMaximizedTrackId] = useState(null);

  const [audioInputs, setAudioInputs] = useState([]);
  const [audioOutputs, setAudioOutputs] = useState([]);
  const [selectedMic, setSelectedMic] = useState("");
  const [selectedSpeaker, setSelectedSpeaker] = useState("");

  const identityRef = useRef(identity);
  const displayNameRef = useRef(displayName);

  useEffect(() => {
    identityRef.current = identity;
  }, [identity]);
  useEffect(() => {
    displayNameRef.current = displayName;
  }, [displayName]);

  useEffect(() => {
    return () => {
      stopJoinRequestTimers();
    };
  }, []);

  useEffect(() => {
    initGrid();
    const handleResize = () =>
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", handleResize);

    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === "g" && !e.repeat) {
        isGhostRef.current = true;
        setIsGhost(true);
      }
    };
    const handleKeyUp = (e) => {
      if (e.key.toLowerCase() === "g") {
        isGhostRef.current = false;
        setIsGhost(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (chatEndRef.current)
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, activeTab]);

  useEffect(() => {
    otherPlayersRef.current = otherPlayers;
  }, [otherPlayers]);

  const removeVideoTrack = (sid) =>
    setVideoTracks((prev) => prev.filter((t) => t.id !== sid));

  const isZoneLocked = (zoneId) => !!lockedZonesRef.current?.[zoneId]?.locked;
  const isAllowedInZone = (zoneId, pid) =>
    !!lockedZonesRef.current?.[zoneId]?.allowedIds?.includes(pid);

  async function connectWithToken(userId, token) {
    try {
      // const res = await fetch(TOKEN_ENDPOINT, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ roomName: "OfficeMap", identity: userId }),
      // });
      // const { token } = await res.json();

      const room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;

      room.on(RoomEvent.ActiveSpeakersChanged, (speakers) =>
        setSpeakingIds(
          speakers.map((s) => s.identity).filter((pid) => canHear(pid))
        )
      );

      room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        if (track.kind === Track.Kind.Audio) {
          const el = track.attach();
          el.autoplay = true;
          if (selectedSpeaker && typeof el.setSinkId === "function")
            el.setSinkId(selectedSpeaker).catch(console.error);
          document.body.appendChild(el);
          audioTracksRef.current[participant.identity] = { track, element: el };
        } else if (track.kind === Track.Kind.Video) {
          setVideoTracks((prev) => {
            if (prev.some((t) => t.id === track.sid)) return prev;
            return [
              ...prev,
              {
                id: track.sid,
                track,
                participantId: participant.identity,
                isLocal: false,
              },
            ];
          });
        }
      });

      room.on(RoomEvent.TrackUnsubscribed, (track, pub, participant) => {
        if (track?.kind === Track.Kind.Audio) {
          track.detach().forEach((el) => el.remove());
          delete audioTracksRef.current[participant.identity];
        } else if (pub?.kind === Track.Kind.Video) {
          removeVideoTrack(pub.trackSid);
        }
      });

      room.on(RoomEvent.LocalTrackPublished, (pub, participant) => {
        if (pub.kind === Track.Kind.Video) {
          const trackSid = pub.track.sid;
          setVideoTracks((prev) => {
            if (prev.some((t) => t.id === trackSid)) return prev;
            return [
              ...prev,
              {
                id: trackSid,
                track: pub.track,
                participantId: userId,
                isLocal: true,
              },
            ];
          });
        }
      });

      room.on(RoomEvent.LocalTrackUnpublished, (pub, participant) => {
        if (pub.kind === Track.Kind.Video) {
          removeVideoTrack(pub.trackSid);
          if (pub.source === Track.Source.Camera) setCamOn(false);
          if (pub.source === Track.Source.ScreenShare) setScreenOn(false);
        }
      });

      room.on(RoomEvent.TrackMuted, (pub, participant) => {
        if (pub.source === Track.Source.Camera) {
          removeVideoTrack(pub.trackSid);
          if (participant.isLocal && pub.source === Track.Source.Camera)
            setCamOn(false);
        }
      });

      room.on(RoomEvent.TrackUnmuted, (pub, participant) => {
        if (pub.source === Track.Source.Camera) {
          const trackSid = pub.track.sid;
          setVideoTracks((prev) => {
            if (prev.some((t) => t.id === trackSid)) return prev;
            return [
              ...prev,
              {
                id: trackSid,
                track: pub.track,
                participantId: userId,
                isLocal: participant.isLocal,
              },
            ];
          });
        }
      });

      room.on(RoomEvent.DataReceived, async (payload, participant) => {
        let data;
        try {
          data = JSON.parse(new TextDecoder().decode(payload));
        } catch {
          return;
        }

        const senderId = participant?.identity || data.senderId || "unknown";

        if (data.type === "move") {
          if (senderId === "unknown") return;
          setOtherPlayers((prev) => ({
            ...prev,
            [senderId]: {
              x: data.x,
              y: data.y,
              f: data.f,
              m: data.m,
              mv: data.mv,
              z: data.z,
              a: data.a,
              n: data.n,
              s: data.s,
              st: data.st,
            },
          }));

          // ✅ host kick unauthorized เมื่อเห็นว่าเข้าไปในห้อง lock
          const hostId = lockedZonesRef.current?.[data.z]?.byId;
          const isHost = hostId && identityRef.current === hostId;

          if (isHost && data.z) {
            const lock = lockedZonesRef.current?.[data.z];
            if (lock?.locked && !lock.allowedIds?.includes(senderId)) {
              // ส่ง kick ไปหาเจ้าตัว
              publishReliable({
                type: "zone_kick",
                targetId: senderId,
                zoneId: data.z,
              });
            }
          }
        } else if (data.type === "chat") {
          if (data.scope === "private" && !senderId) return;
          if (
            data.scope === "room" &&
            data.target !== myZone?.id &&
            data.target !== "Lobby" &&
            myZone?.id
          )
            return;

          setChatMessages((prev) => [
            ...prev,
            {
              sender: data.senderName || senderId,
              senderId, // ✅ เพิ่ม
              targetId: data.target, // ✅ เพิ่ม (สำหรับ private = คนที่ถูกส่งหา)
              text: data.text,
              type: data.scope, // "private" | "global" | "room"
              timestamp: Date.now(),
            },
          ]);

          if (data.scope === "private") {
            setDmTarget(senderId);
            setActiveTab("dm");
          }
        } else if (data.type === "summon" && data.targetId === userId) {
          setSummonRequest({
            requester: data.requesterName || senderId,
            requesterId: senderId,
            x: data.x,
            y: data.y,
          });
        } else if (data.type === "zone_lock") {
          const { zoneId, state } = data;

          lockedZonesRef.current = {
            ...(lockedZonesRef.current || {}),
            [zoneId]: state,
          };
          setLockedZones((prev) => ({ ...prev, [zoneId]: state }));

          if (!state.locked) return;

          const zone = ZONES.find((z) => z.id === zoneId);
          if (!zone) return;

          // 🔴 ตรวจตัวเราเอง
          if (
            myZone?.id === zoneId &&
            !state.allowedIds.includes(identityRef.current)
          ) {
            const kicked = forceKickOutsideZone(posRef.current, zone);

            posRef.current = kicked;
            targetRef.current = kicked;
            pathRef.current = [];
            setMyPos({ ...kicked });
          }

          // 🔴 ตรวจ remote players
          setOtherPlayers((prev) => {
            const next = { ...prev };

            Object.entries(next).forEach(([pid, p]) => {
              if (p.z === zoneId && !state.allowedIds.includes(pid)) {
                const kicked = forceKickOutsideZone({ x: p.x, y: p.y }, zone);
                next[pid] = {
                  ...p,
                  x: kicked.x,
                  y: kicked.y,
                  z: null,
                };
              }
            });

            return next;
          });
        } else if (data.type === "zone_join_req") {
          const { zoneId, requesterId, requesterName } = data;

          // ✅ จำกัดเฉพาะ host ห้องกด Allow
          const hostId = lockedZonesRef.current?.[zoneId]?.byId;
          if (hostId && identityRef.current === hostId) {
            setJoinRequests((prev) => {
              if (
                prev.some(
                  (r) => r.zoneId === zoneId && r.requesterId === requesterId
                )
              )
                return prev;
              return [
                ...prev,
                { zoneId, requesterId, requesterName, ts: Date.now() },
              ];
            });
          }
        } else if (data.type === "zone_join_resp") {
          const { zoneId, requesterId, ok } = data;

          // ✅ ใช้ identityRef.current กัน stale
          if (requesterId === identityRef.current) {
            // ✅ invalidate + stop
            requestTokenRef.current++;
            stopJoinRequestTimers();

            pendingEnterRef.current = null;

            const zoneName = ZONES.find((z) => z.id === zoneId)?.name || zoneId;

            // ✅ แสดงผลแบบ summon toast
            setJoinResult({
              ok,
              zoneName,
            });
          }
        } else if (data.type === "zone_join_cancel") {
          const { zoneId, requesterId } = data;
          setJoinRequests((prev) =>
            prev.filter(
              (r) => !(r.zoneId === zoneId && r.requesterId === requesterId)
            )
          );
        } else if (data.type === "locks_sync") {
          if (data.targetId !== identityRef.current) return;

          const locks = data.locks || {};
          lockedZonesRef.current = locks;
          setLockedZones(locks);

          // ถ้าเราดัน spawn อยู่ในห้องที่ lock และเราไม่ allowed → ดีดออกทันที
          const z = checkZone(posRef.current.x, posRef.current.y);
          if (
            z?.id &&
            locks[z.id]?.locked &&
            !locks[z.id]?.allowedIds?.includes(identityRef.current)
          ) {
            const kicked = forceKickOutsideZone(posRef.current, z);
            posRef.current = kicked;
            targetRef.current = kicked;
            pathRef.current = [];
            setMyPos({ ...kicked });
          }
        } else if (data.type === "zone_kick") {
          if (data.targetId !== identityRef.current) return;

          const zone = ZONES.find((z) => z.id === data.zoneId);
          if (!zone) return;

          const kicked = forceKickOutsideZone(posRef.current, zone);
          posRef.current = kicked;
          targetRef.current = kicked;
          pathRef.current = [];
          setMyPos({ ...kicked });

          setChatMessages((prev) => [
            ...prev,
            {
              sender: "System",
              text: `🚪 You were moved outside (room locked).`,
              type: "global",
              timestamp: Date.now(),
            },
          ]);
        } else if (data.type === "force_mute") {
          if (data.targetId !== identityRef.current) return;

          // ปิดไมค์ตัวเอง
          try {
            await roomRef.current.localParticipant.setMicrophoneEnabled(false);
            setMicOn(false);
            micOnRef.current = false;
          } catch {}
        }
      });

      room.on(RoomEvent.ParticipantDisconnected, (p) => {
        setOtherPlayers((prev) => {
          const next = { ...prev };
          delete next[p.identity];
          return next;
        });
        setVideoTracks((prev) =>
          prev.filter((t) => t.participantId !== p.identity)
        );
      });

      room.on(RoomEvent.ParticipantConnected, (p) => {
        // ถ้าเราเป็นคนที่อยู่ก่อน (ทุกคนก็ส่งได้ แต่เอา host ส่งจะชัวร์)
        // ส่งสถานะ lock ทั้งหมดให้คนที่เพิ่งเข้ามา
        publishReliable({
          type: "locks_sync",
          targetId: p.identity,
          locks: lockedZonesRef.current || {},
        });
      });

      await room.connect(LIVEKIT_URL, token);
      await room.localParticipant.setMicrophoneEnabled(false, {
        echoCancellation: true,
        noiseSuppression: true,
      });
      micOnRef.current = false;
      setMicOn(false);
      setConnected(true);
      await loadDevices();
      return true;
    } catch (e) {
      console.error(e);
      alert("Connection Failed");
      setConnected(false);
      return false; // ✅ fail
    }
  }

  const handleJoinAfterLogin = async () => {
    if (!profile?.email) return alert("Please login first");
    if (!draftName.trim()) return alert("Please enter display name");

    // อัปเดต localStorage (จำชื่อ+avatar ล่าสุด)
    const next = {
      ...profile,
      name: draftName.trim(),
      avatar: draftAvatar,
      lastLoginAt: Date.now(),
      loggedIn: true,
    };
    saveProfileByEmail(next.email, next);
    setProfile(next);

    // ตั้งค่าผู้เล่น
    setIdentity(next.email); // ✅ 1 gmail = 1 identity
    setDisplayName(next.name);
    setMyAvatar(next.avatar);

    const r = await fetch(GOOGLE_TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomName: "OfficeMap",
        idToken: profile.idToken, // 👈 ดูข้อ 3
        avatar: next.avatar,
      }),
    });

    const data = await r.json();
    if (!r.ok) {
      alert(data?.error || "Get token failed");
      return;
    }

    const ok = await connectWithToken(next.email, data.token);
    if (ok) setJoined(true);
  };

  useEffect(() => {
    if (joined) return; // อยู่ในเกมไม่ต้อง render
    if (authed) return; // login แล้วไม่ต้อง render
    if (!window.google) return;
    if (!googleBtnRef.current) return;

    // เคลียร์ก่อนกัน render ซ้อน
    googleBtnRef.current.innerHTML = "";

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (resp) => {
        try {
          const idToken = resp.credential;

          const r = await fetch(GOOGLE_TOKEN_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomName: "OfficeMap", idToken }),
          });

          const data = await r.json();
          if (!r.ok) return alert(data?.error || "Login failed");

          const prev = loadProfileByEmail(data.profile.email);

          const p = {
            email: data.profile.email,
            // ✅ ใช้ชื่อที่เคยแก้ ถ้ามี
            name: prev?.name || data.profile.name || data.profile.email,
            picture:
              data.profile.picture && data.profile.picture.trim()
                ? data.profile.picture
                : DEFAULT_PROFILE_PIC, // ✅ fallback
            avatar: prev?.avatar || AVATARS[0],
            lastLoginAt: Date.now(),
            loggedIn: true, // ✅
            idToken, // 👈 เก็บไว้ใช้ขอ token ตอน join
          };

          saveProfileByEmail(p.email, p);

          setProfile(p);
          setDraftName(p.name);
          setDraftAvatar(p.avatar);

          setJoined(false); // ✅ login แล้ว แต่ยังไม่ join

          
          setAuthed(true);
        } catch (e) {
          console.error(e);
          alert("Google login error");
        }
      },
    });

    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: "outline",
      size: "large",
      text: "signin_with",
      shape: "pill",
    });
  }, [authed, joined]);

  const loadDevices = async () => {
    try {
      const d = await navigator.mediaDevices.enumerateDevices();
      setAudioInputs(d.filter((x) => x.kind === "audioinput"));
      setAudioOutputs(d.filter((x) => x.kind === "audiooutput"));
    } catch {}
  };

  const handleMicChange = async (v) => {
    if (!roomRef.current) return;
    setSelectedMic(v);
    await roomRef.current.switchActiveDevice("audioinput", v);
  };

  const handleSpeakerChange = async (v) => {
    setSelectedSpeaker(v);
    if (roomRef.current)
      await roomRef.current.switchActiveDevice("audiooutput", v);
    Object.values(audioTracksRef.current).forEach(({ element }) => {
      if (element && typeof element.setSinkId === "function")
        element.setSinkId(v).catch(console.error);
    });
  };

  const toggleMic = async () => {
    if (!roomRef.current) return;
    const t = !micOn;
    try {
      await roomRef.current.localParticipant.setMicrophoneEnabled(t);
      setMicOn(t);
      micOnRef.current = t;
    } catch {}
  };

  const toggleCam = async () => {
    if (!roomRef.current) return;
    const target = !camOn;
    try {
      await roomRef.current.localParticipant.setCameraEnabled(target);
      setCamOn(target);
    } catch (e) {
      console.error("Cam toggle error", e);
    }
  };

  const toggleScreen = async () => {
    if (!roomRef.current) return;
    const target = !screenOn;
    try {
      await roomRef.current.localParticipant.setScreenShareEnabled(target);
      setScreenOn(target);
    } catch (e) {
      console.error("Screen toggle error", e);
      if (target) setScreenOn(false);
    }
  };

  const toggleNoise = async () => {
    const n = !noiseOn;
    setNoiseOn(n);
    if (roomRef.current && micOn) {
      const t = roomRef.current.localParticipant.getTrackPublication(
        Track.Source.Microphone
      );
      if (t && t.track)
        await t.track.restart({
          echoCancellation: true,
          noiseSuppression: n,
          autoGainControl: true,
        });
    }
  };

  const handleMaximize = (id) =>
    setMaximizedTrackId((prev) => (prev === id ? null : id));
  const handleStatusChange = (s) => {
    setMyAvailability(s);
    setShowStatusMenu(false);
  };

  const [showRightPanelState, setShowRightPanelState] = useState(true); // (keep same behavior)
  useEffect(() => {
    setShowRightPanel(showRightPanelState);
  }, [showRightPanelState]); // eslint-disable-line

  const handleWalkTo = useCallback(
    (x, y, targetId = null) => {
      followingRef.current = targetId;
      setFollowingId(targetId);
      if (x === undefined || y === undefined) return;

      const targetZone = checkZone(x, y);
      const zoneId = targetZone?.id;

      if (
        targetZone &&
        isZoneLocked(zoneId) &&
        !isAllowedInZone(zoneId, identity)
      ) {
        // 1) เดินไป "นอกขอบห้อง" (ไม่เข้า)
        const outside = getNearestOutsidePointOnZoneEdge(x, y, targetZone, 18);

        const path = findPath(
          posRef.current.x,
          posRef.current.y,
          outside.x,
          outside.y
        );
        const smooth = smoothPath(path);
        if (smooth?.length) {
          pathRef.current = smooth;
          targetRef.current = smooth[0];
        } else {
          targetRef.current = { x: outside.x, y: outside.y };
          pathRef.current = [];
        }

        // 2) ส่ง request (เหมือน summon) + เคาะประตู + countdown auto-cancel
        requestJoinZone(zoneId, x, y);

        setChatMessages((prev) => [
          ...prev,
          {
            sender: "System",
            text: `🔒 "${
              targetZone.name
            }" is locked. Knocked & requested (${Math.ceil(
              REQUEST_TTL_MS / 1000
            )}s).`,
            type: "global",
            timestamp: Date.now(),
          },
        ]);
        return;
      }

      if (isGhostRef.current) {
        targetRef.current = { x, y };
        pathRef.current = [];
      } else {
        const path = findPath(posRef.current.x, posRef.current.y, x, y);
        const smooth = smoothPath(path);
        if (smooth?.length) {
          pathRef.current = smooth;
          targetRef.current = smooth[0];
        } else {
          targetRef.current = { x, y };
          pathRef.current = [];
        }
      }

      setClickMarker({ x, y, id: markerIdRef.current++ });
      setSelectedMemberId(null);
    },
    [identity]
  );

  const handleMapClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const worldX = (e.clientX - rect.left) / zoom;
    const worldY = (e.clientY - rect.top) / zoom;

    setClickMarker({ x: worldX, y: worldY, id: markerIdRef.current++ });
    handleWalkTo(worldX, worldY, null);
  };

  const getMinZoom = useCallback(() => {
    const rightPanelW = showRightPanel ? 320 : 0;
    const usableW = viewport.w - rightPanelW;
    const usableH = viewport.h - 80;
    return Math.min(usableW / MAP_WIDTH, usableH / MAP_HEIGHT);
  }, [viewport.w, viewport.h, showRightPanel]);

  const handleWheel = (e) => {
    setZoom((prev) => {
      const minZoom = getMinZoom();
      return Math.min(Math.max(minZoom, prev + -e.deltaY * 0.001), 2.5);
    });
  };

  useEffect(() => {
    const minZoom = getMinZoom();
    setZoom((z) => (z < minZoom ? minZoom : z));
  }, [getMinZoom]);

  useEffect(() => {
    const el = document.querySelector(".game-container");
    if (!el) return;

    const ts = (e) => handleTouchStart(e);
    const tm = (e) => handleTouchMove(e);
    const te = (e) => handleTouchEnd(e);

    el.addEventListener("touchstart", ts, { passive: false });
    el.addEventListener("touchmove", tm, { passive: false });
    el.addEventListener("touchend", te, { passive: false });

    return () => {
      el.removeEventListener("touchstart", ts);
      el.removeEventListener("touchmove", tm);
      el.removeEventListener("touchend", te);
    };
  }, [zoom, getMinZoom]);

  const sendChat = async () => {
    if (!chatInput.trim() || !roomRef.current) return;
    let scope = activeTab === "members" ? "global" : activeTab;
    let target = null;
    if (scope === "room") target = myZone ? myZone.id : "Lobby";
    if (scope === "dm") {
      scope = "private";
      target = dmTarget;
      if (!target) {
        alert("Select user first");
        return;
      }
    }
    const msg = {
      type: "chat",
      senderId: identity,
      text: chatInput,
      scope,
      target,
      senderName: displayName,
    };
    await roomRef.current.localParticipant.publishData(
      new TextEncoder().encode(JSON.stringify(msg)),
      { reliable: true }
    );
    setChatMessages((prev) => [
      ...prev,
      {
        sender: displayName,
        senderId: identity, // ✅ เพิ่ม
        targetId: target, // ✅ เพิ่ม (ตอน private target = dmTarget)
        text: chatInput,
        type: scope, // "private" | "global" | "room"
        timestamp: Date.now(),
      },
    ]);
    setChatInput("");
  };

  const sendSummon = async (targetId) => {
    if (!roomRef.current) return;
    const p = otherPlayers[targetId];
    if (p && p.s === "Do Not Disturb") return alert("User is Do Not Disturb");
    const msg = {
      type: "summon",
      senderId: identity,
      targetId,
      x: posRef.current.x,
      y: posRef.current.y,
      requesterName: displayName,
    };
    await roomRef.current.localParticipant.publishData(
      new TextEncoder().encode(JSON.stringify(msg)),
      { reliable: true }
    );
    setSelectedMemberId(null);
  };

  const HEAR_DISTANCE = 600;

  const canHear = useCallback(
    (pid) => {
      if (pid === identity) return true;
      const other = otherPlayersRef.current[pid];
      if (!other) return false;

      const myZoneId = myZone?.id || null;
      const otherZoneId = other.z || null;

      if (myZoneId && otherZoneId && myZoneId === otherZoneId) return true;
      if (myZoneId || otherZoneId) return false;

      const dist = getDistance(posRef.current, other);
      return dist <= HEAR_DISTANCE;
    },
    [identity, myZone]
  );

  const isParticipantVisible = (targetId) => {
    if (targetId === identity) return true;
    const other = otherPlayers[targetId];
    if (!other) return false;
    const myZoneId = myZone?.id;
    const otherZoneId = other.z;
    if (myZoneId && otherZoneId && myZoneId === otherZoneId) return true;
    if (
      !myZoneId &&
      !otherZoneId &&
      getDistance(myPos, { x: other.x, y: other.y }) <= 600
    )
      return true;
    return false;
  };

  useEffect(() => {
    if (!connected) return;
    const loop = setInterval(() => {
      if (followingRef.current) {
        const p = otherPlayersRef.current[followingRef.current];
        if (p) {
          targetRef.current = { x: p.x, y: p.y };
          pathRef.current = [];
        } else {
          followingRef.current = null;
          setFollowingId(null);
        }
      }

      let currentTarget = targetRef.current;
      const dx = currentTarget.x - posRef.current.x;
      const dy = currentTarget.y - posRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let moveX = 0,
        moveY = 0,
        isMoving = false;

      if (dist > SPEED) {
        const angle = Math.atan2(dy, dx);
        moveX = Math.cos(angle) * SPEED;
        moveY = Math.sin(angle) * SPEED;
        isMoving = true;
        if (Math.abs(dx) > 1) facingRef.current = dx > 0 ? "right" : "left";
      } else if (pathRef.current.length > 0) {
        targetRef.current = pathRef.current.shift();
      } else {
        const guarded = clampOutsideLocked(
          currentTarget.x,
          currentTarget.y,
          identity,
          isZoneLocked,
          isAllowedInZone
        );

        posRef.current.x = guarded.x;
        posRef.current.y = guarded.y;

        if (guarded.blocked) {
          targetRef.current = { ...posRef.current };
          pathRef.current = [];
        }
      }

      if (isMoving) {
        let nextX = posRef.current.x + moveX;
        let nextY = posRef.current.y + moveY;

        const guarded = clampOutsideLocked(
          nextX,
          nextY,
          identity,
          isZoneLocked,
          isAllowedInZone
        );
        if (guarded.blocked) {
          // หยุดที่ขอบนอก (ไม่เข้าห้อง)
          posRef.current.x = guarded.x;
          posRef.current.y = guarded.y;
          targetRef.current = { ...posRef.current };
          pathRef.current = [];
          return;
        }

        posRef.current.x = guarded.x;
        posRef.current.y = guarded.y;
      }

      const z = checkZone(posRef.current.x, posRef.current.y);
      if (z?.id !== myZone?.id) setMyZone(z);
      setMyPos({ ...posRef.current });
      setMyFacing(facingRef.current);
      if (isMoving !== isMovingRef.current) isMovingRef.current = isMoving;

      const data = JSON.stringify({
        type: "move",
        senderId: identity,
        x: posRef.current.x,
        y: posRef.current.y,
        f: facingRef.current,
        mv: isMovingRef.current,
        m: !micOnRef.current,
        z: z ? z.id : null,
        a: myAvatar,
        n: displayName,
        s: myAvailability,
        st: myStatusText,
      });

      roomRef.current?.localParticipant.publishData(
        new TextEncoder().encode(data),
        { reliable: false }
      );
    }, 30);

    return () => clearInterval(loop);
  }, [
    connected,
    myZone,
    myAvatar,
    displayName,
    identity,
    myAvailability,
    myStatusText,
  ]);

  useEffect(() => {
    if (!joinResult) return;
    const t = setTimeout(() => setJoinResult(null), 2000);
    return () => clearTimeout(t);
  }, [joinResult]);

  useEffect(() => {
    if (!connected) return;

    Object.keys(otherPlayers).forEach((pid) => {
      const other = otherPlayers[pid];
      const obj = audioTracksRef.current[pid];
      if (!obj) return;

      if (
        other.m ||
        myAvailability === "Do Not Disturb" ||
        other.s === "Do Not Disturb"
      ) {
        obj.track.setVolume(0);
        return;
      }

      if (!canHear(pid)) {
        obj.track.setVolume(0);
        return;
      }

      const myZoneId = myZone?.id || null;
      if (myZoneId && other.z && myZoneId === other.z) {
        obj.track.setVolume(1);
        return;
      }

      const MAX = 600,
        MIN = 100;
      const dist = getDistance(posRef.current, other);
      let vol = 0;
      if (dist <= MIN) vol = 1;
      else if (dist > MAX) vol = 0;
      else vol = 1 - Math.pow((dist - MIN) / (MAX - MIN), 2);

      obj.track.setVolume(vol);
    });
  }, [myPos, otherPlayers, connected, myZone, myAvailability, canHear]);

  const targetCamX =
    (viewport.w - (showRightPanel ? 320 : 0)) / 2 - myPos.x * zoom;
  const targetCamY = (viewport.h - 80) / 2 - myPos.y * zoom;
  const camX = Math.min(0, Math.max(viewport.w - MAP_WIDTH * zoom, targetCamX));
  const camY = Math.min(
    0,
    Math.max(viewport.h - MAP_HEIGHT * zoom, targetCamY)
  );

  const allMembers = [
    {
      id: identity,
      name: displayName + " (You)",
      status: "Online",
      z: myZone?.name || "Lobby",
      avatar: myAvatar,
      s: myAvailability,
      st: myStatusText,
      x: myPos.x,
      y: myPos.y,
      zoneId: myZone?.id,
      micMuted: !micOn,
    },
    ...Object.entries(otherPlayers).map(([id, d]) => ({
      id,
      name: d.n || id,
      status: "Online",
      z: d.z ? ZONES.find((z) => z.id === d.z)?.name : "Lobby",
      avatar: d.a || AVATARS[0],
      s: d.s,
      st: d.st,
      x: d.x,
      y: d.y,
      zoneId: d.z,
      micMuted: !!d.m,
    })),
  ];

  const groupedMembers = allMembers.reduce((acc, m) => {
    let key = "Lobby";
    if (m.zoneId) key = ZONES.find((z) => z.id === m.zoneId)?.name || "Unknown";
    else if (!myZone && getDistance(myPos, { x: m.x, y: m.y }) < 600)
      key = "🗣️ Nearby";
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const sortedKeys = Object.keys(groupedMembers).sort((a, b) =>
    a.includes("Nearby")
      ? -1
      : b.includes("Nearby")
      ? 1
      : a === "Lobby"
      ? 1
      : b === "Lobby"
      ? -1
      : a.localeCompare(b)
  );

  const displayMessages = chatMessages.filter((msg) => {
    if (activeTab === "global") return msg.type === "global";
    if (activeTab === "room") return msg.type === "room";
    if (activeTab === "dm") {
      if (msg.type !== "private") return false;
      if (!dmTarget) return false;

      const a = msg.senderId;
      const b = msg.targetId;

      // ✅ เก็บเฉพาะบทสนทนา: me <-> dmTarget
      return (
        (a === identity && b === dmTarget) || (a === dmTarget && b === identity)
      );
    }
    return false;
  });

  const getStatusColor = (s) =>
    s === "Do Not Disturb" ? "#ef4444" : s === "Busy" ? "#f59e0b" : "#22c55e";

  const isDM = activeTab === "dm";
  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  const renderDM = () => (
    <div className="dm-thread">
      {displayMessages.map((msg, i) => {
        const isMe = msg.senderId === identity; // ใช้ senderId จะชัวร์กว่า sender name
        const avatar = isMe
          ? myAvatar
          : otherPlayers[msg.senderId]?.a || AVATARS[0];
        const name = isMe ? "You" : otherPlayers[msg.senderId]?.n || msg.sender;

        return (
          <div key={i} className={`dm-row ${isMe ? "me" : "other"}`}>
            {!isMe && (
              <div className="dm-avatar">
                <img src={avatar} alt="avatar" />
              </div>
            )}

            <div className="dm-col">
              {!isMe && <div className="dm-name">{name}</div>}

              <div className="dm-bubble-wrap">
                {isMe && (
                  <div className="dm-meta me">
                    <span className="dm-time">{formatTime(msg.timestamp)}</span>
                  </div>
                )}

                <div className={`dm-bubble ${isMe ? "me" : "other"}`}>
                  {msg.text}
                </div>

                {!isMe && (
                  <div className="dm-meta other">
                    <span className="dm-time">{formatTime(msg.timestamp)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={chatEndRef} />
    </div>
  );

  useEffect(() => {
    const onClick = () => setShowAccountMenu(false);
    if (showAccountMenu) {
      window.addEventListener("click", onClick);
    }
    return () => window.removeEventListener("click", onClick);
  }, [showAccountMenu]);

  const isLoggedIn = !!profile?.email;

  return (
    <div
      className="game-container"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {!joined && (
        <div className="login-screen">
          <div className="login-card">
            <h2 style={{ color: "white", marginBottom: 16 }}>Sketec World</h2>

            {!isLoggedIn ? (
              <>
                <div style={{ marginTop: 12 }}>
                  <div ref={googleBtnRef} />
                </div>
              </>
            ) : (
              <>
                <input
                  className="login-input"
                  placeholder="Display name"
                  value={draftName}
                  onChange={(e) => {
                    const v = e.target.value;
                    setDraftName(v);

                    if (profile?.email) {
                      const next = { ...profile, name: v };
                      saveProfileByEmail(profile.email, next);
                      setProfile(next);
                    }
                  }}
                />

                <div className="avatar-selector">
                  {AVATARS.map((a, i) => (
                    <div
                      key={i}
                      className={`avatar-option ${
                        draftAvatar === a ? "selected" : ""
                      }`}
                      onClick={() => {
                        setDraftAvatar(a);

                        if (profile?.email) {
                          const next = { ...profile, avatar: a };
                          saveProfileByEmail(profile.email, next);
                          setProfile(next);
                        }
                      }}
                    >
                      <img src={a} alt="char" />
                    </div>
                  ))}
                </div>

                <button className="start-btn" onClick={handleJoinAfterLogin}>
                  Join
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {!joined && authed && profile && (
        <div className="account-wrap">
          <div
            className="account-avatar"
            onClick={(e) => {
              e.stopPropagation();
              setShowAccountMenu((v) => !v);
            }}
          >
            {profile.picture ? (
              <img src={profile.picture} alt="me" />
            ) : (
              <div className="account-avatar-fallback" />
            )}
          </div>

          {showAccountMenu && (
            <div className="account-menu">
              <div className="account-email">{profile.email}</div>

              <button
                className="account-logout"
                onClick={() => {
                  if (profile?.email) {
                    saveProfileByEmail(profile.email, {
                      ...profile,
                      loggedIn: false,
                    });
                  }

                  setAuthed(false);
                  setProfile(null);
                  setDraftName("");
                  setDraftAvatar(AVATARS[0]);

                  try {
                    roomRef.current?.disconnect();
                  } catch {}

                  setJoined(false);
                  setConnected(false);
                  setShowAccountMenu(false);
                  if (googleBtnRef.current) googleBtnRef.current.innerHTML = "";
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}

      {joined && (
        <>
          <div
            className="world-layer"
            style={{
              transform: `translate(${camX}px, ${camY}px) scale(${zoom})`,
              transformOrigin: "0 0",
            }}
            onClick={handleMapClick}
          >
            {myZone && (
              <div
                className="room-spotlight"
                style={{
                  left: myZone.x,
                  top: myZone.y,
                  width: myZone.w,
                  height: myZone.h,
                }}
              />
            )}

            {ZONES.map((z) => (
              <div
                key={z.id}
                className="zone-area"
                style={{
                  left: z.x,
                  top: z.y,
                  width: z.w,
                  height: z.h,
                  borderColor: z.color,
                  opacity: myZone?.id === z.id ? 1 : 0,
                  visibility: myZone?.id === z.id ? "visible" : "hidden",
                  transition: "all 0.3s ease",
                }}
              >
                <div className="zone-label" style={{ background: z.color }}>
                  {z.name}
                </div>
              </div>
            ))}

            {clickMarker && (
              <div
                key={clickMarker.id}
                className="click-marker"
                style={{ left: clickMarker.x, top: clickMarker.y }}
              />
            )}

            <div
              className={`chibi ${myFacing === "left" ? "face-left" : ""} ${
                speakingIds.includes(identity) ? "speaking" : ""
              } ${isGhost ? "ghost" : ""}`}
              style={{ left: myPos.x, top: myPos.y }}
            >
              <img src={myAvatar} alt="me" />
              <div className="name-tag">
                <span
                  className="name-status-dot"
                  style={{ background: getStatusColor(myAvailability) }}
                />
                <span className="name-text">{displayName}</span>
              </div>
              {!micOn && <div className="mute-icon">🔇</div>}
            </div>

            {Object.entries(otherPlayers).map(([pid, d]) => {
              const isHidden = d.z && d.z !== myZone?.id;
              const isSpeaking = speakingIds.includes(pid);
              return (
                <div
                  key={pid}
                  className={`chibi ${d.f === "left" ? "face-left" : ""} ${
                    isHidden ? "in-zone-hidden" : ""
                  } ${isSpeaking ? "speaking" : ""}`}
                  style={{ left: d.x, top: d.y }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWalkTo(d.x, d.y, pid);
                  }}
                >
                  <img src={d.a || AVATARS[0]} alt="other" />
                  <div className="name-tag">
                    <span
                      className="name-status-dot"
                      style={{ background: getStatusColor(d.s) }}
                    />
                    <span className="name-text">{d.n || pid}</span>
                  </div>
                  {d.m && <div className="mute-icon">🔇</div>}
                </div>
              );
            })}
          </div>

          {followingId && (
            <div
              style={{
                position: "absolute",
                bottom: 100,
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(0,230,118,0.9)",
                color: "#0d1117",
                padding: "8px 20px",
                borderRadius: "25px",
                fontWeight: "bold",
                fontSize: "13px",
                zIndex: 150,
                pointerEvents: "none",
              }}
            >
              <span>👣</span> Following...
            </div>
          )}

          {requestCountdown > 0 && (
            <div className="summon-toast">
              <Lock size={18} />
              <div>
                <b>Room is locked. Request expires in {requestCountdown} s</b>
              </div>
            </div>
          )}

          {joinResult && (
            <div className="summon-toast">
              <div>
                {joinResult.ok ? "✅" : "❌"}{" "}
                {joinResult.ok ? (
                  <>
                    You are allowed to enter <b>{joinResult.zoneName}</b>
                  </>
                ) : (
                  <>
                    Request to enter <b>{joinResult.zoneName}</b> was denied
                  </>
                )}
              </div>
            </div>
          )}

          {summonRequest && myAvailability !== "Do Not Disturb" && (
            <div className="summon-toast">
              <div>
                <b>{summonRequest.requester}</b> request follow !
              </div>
              <div className="summon-actions">
                <div
                  className="btn-accept"
                  onClick={() => {
                    handleWalkTo(
                      summonRequest.x,
                      summonRequest.y,
                      summonRequest.requesterId
                    );
                    setSummonRequest(null);
                  }}
                >
                  Go
                </div>
                <div
                  className="btn-ignore"
                  onClick={() => setSummonRequest(null)}
                >
                  Ignore
                </div>
              </div>
            </div>
          )}

          {joinRequests.length > 0 && (
            <div className="summon-toast">
              <div>
                <b>Room join requests</b>
              </div>
              {joinRequests.slice(0, 3).map((r) => (
                <div key={r.zoneId + r.requesterId} style={{ marginTop: 6 }}>
                  <Users size={16} /> <b>{r.requesterName}</b> wants to enter{" "}
                  <b>
                    {ZONES.find((z) => z.id === r.zoneId)?.name || r.zoneId}
                  </b>
                  <div className="summon-actions">
                    <div
                      className="btn-accept"
                      onClick={() => {
                        respondJoinZone(r.zoneId, r.requesterId, true);
                        setJoinRequests((prev) => prev.filter((x) => x !== r));
                      }}
                    >
                      <CheckCircle2 size={16} />
                      <span>Allow</span>
                    </div>
                    <div
                      className="btn-ignore"
                      onClick={() => {
                        respondJoinZone(r.zoneId, r.requesterId, false);
                        setJoinRequests((prev) => prev.filter((x) => x !== r));
                      }}
                    >
                      <XCircle size={16} />
                      <span>Deny</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className={`right-panel ${showRightPanel ? "" : "hidden"}`}>
            <div className="panel-header">
              <div className="header-title">Sketec</div>
              <span
                className="header-actions"
                onClick={() => setShowRightPanel(false)}
              >
                ✖
              </span>
            </div>

            <div className="panel-tabs">
              <div
                className={`panel-tab ${
                  activeTab === "members" ? "active" : ""
                }`}
                onClick={() => setActiveTab("members")}
              >
                Members
              </div>
              <div
                className={`panel-tab ${activeTab === "dm" ? "active" : ""}`}
                onClick={() => setActiveTab("dm")}
              >
                DM
              </div>
            </div>

            <div className="tab-content">
              {activeTab === "members" ? (
                <div className="member-list">
                  {sortedKeys.map((zName) => (
                    <div key={zName}>
                      <div className="group-header">{zName}</div>
                      {groupedMembers[zName].map((m) => (
                        <div
                          key={m.id}
                          className="member-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (m.id !== identity)
                              setSelectedMemberId((prev) =>
                                prev === m.id ? null : m.id
                              );
                          }}
                        >
                          <div
                            className={`avatar-circle ${
                              speakingIds.includes(m.id) ? "speaking" : ""
                            }`}
                          >
                            <img
                              src={m.avatar}
                              alt="avatar"
                              style={{ imageRendering: "pixelated" }}
                            />
                          </div>
                          <div className="member-info">
                            <div className="member-name">
                              {m.name}
                              {m.id === identity && (
                                <span
                                  style={{
                                    marginLeft: 5,
                                    cursor: "pointer",
                                    fontSize: 10,
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowStatusMenu(!showStatusMenu);
                                  }}
                                >
                                  ✏️
                                </span>
                              )}
                            </div>
                            <div
                              className="member-custom-status"
                              style={{ color: getStatusColor(m.s) }}
                            >
                              {m.st || m.s || "Available"}
                            </div>

                            {m.id === identity && showStatusMenu && (
                              <div
                                className="member-menu-popup"
                                style={{ top: 25, zIndex: 600 }}
                              >
                                {STATUS_OPTIONS.map((opt) => (
                                  <button
                                    key={opt.label}
                                    className="menu-action-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusChange(opt.label);
                                    }}
                                  >
                                    <span style={{ color: opt.color }}>●</span>{" "}
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <div
                            className="status-dot"
                            style={{ background: getStatusColor(m.s) }}
                          ></div>
                          {m.micMuted && (
                            <div className="menu-mute-icon">🔇</div>
                          )}

                          {selectedMemberId === m.id && m.id !== identity && (
                            <div className="member-menu-popup">
                              <button
                                className="menu-action-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleWalkTo(m.x, m.y, m.id);
                                  setSelectedMemberId(null);
                                }}
                              >
                                <Footprints size={16} /> Walk to
                              </button>
                              <button
                                className="menu-action-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  sendSummon(m.id);
                                }}
                              >
                                <GitPullRequestArrow size={16} />
                                <span>Request to me</span>
                              </button>
                              <button
                                className="menu-action-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDmTarget(m.id);
                                  setActiveTab("dm");
                                  setSelectedMemberId(null);
                                }}
                              >
                                <MessageCircle size={16} /> Message
                              </button>
                              {!m.micMuted && canHear(m.id) && (
                                <button
                                  className="menu-action-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    muteOtherForEveryone(m.id, true);
                                    setSelectedMemberId(null);
                                  }}
                                >
                                  <span>🔇</span> Mute mic
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="chat-container">
                  {activeTab === "dm" && dmTarget && (
                    <div className="dm-target-info">
                      <div className="dm-to">
                        <div className="dm-avatar">
                          <img
                            src={otherPlayers[dmTarget]?.a || AVATARS[0]}
                            alt="to"
                          />
                        </div>
                        <div className="dm-to-text">
                          <div className="dm-to-name">
                            {otherPlayers[dmTarget]?.n || dmTarget}
                          </div>
                        </div>
                      </div>
                      <span
                        className="dm-close"
                        onClick={() => setDmTarget(null)}
                      >
                        ✖
                      </span>
                    </div>
                  )}
                  {renderDM()}
                  {/* <div className={`chat-messages ${isDM ? "dm" : ""}`}>
                    {displayMessages.map((msg, i) => {
                      const isMe = msg.sender === displayName;
                      const isSystem = msg.sender === "System";

                      return (
                        <div
                          key={i}
                          className={[
                            "chat-msg",
                            msg.type,
                            isDM ? "dm" : "",
                            isMe ? "me" : "",
                            isSystem ? "system" : "",
                          ].join(" ")}
                          data-time={formatTime(msg.timestamp)}
                        >
                          
                          <div className="text">{msg.text}</div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div> */}
                  <div className="chat-input-area">
                    <input
                      className="chat-input"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendChat()}
                    />
                    <button className="chat-send-btn" onClick={sendChat}>
                      ➤
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bottom-panel">
            <div className="bottom-group">
              <button
                className={`icon-btn ${micOn ? "on" : "off"}`}
                onClick={toggleMic}
                title={micOn ? "Mic on" : "Mic off"}
              >
                {micOn ? <Mic size={18} /> : <MicOff size={18} />}
              </button>
              <button
                className={`icon-btn ${camOn ? "on" : "off"}`}
                onClick={toggleCam}
                title={camOn ? "Camera on" : "Camera off"}
              >
                {camOn ? <Video size={18} /> : <VideoOff size={18} />}
              </button>
              <button
                className={`icon-btn ${screenOn ? "on" : "off"}`}
                onClick={toggleScreen}
                title={screenOn ? "Share screen" : "Stop sharing"}
              >
                {screenOn ? <MonitorOff size={18} /> : <MonitorUp size={18} />}
              </button>

              <div className="divider"></div>

              <button
                className={`icon-btn ${noiseOn ? "on" : ""}`}
                onClick={toggleNoise}
                title="Noise suppression"
              >
                {noiseOn ? <Sparkles size={18} /> : <Volume2 size={18} />}
              </button>

              {myZone?.id && (
                <button
                  className="pill-btn"
                  onClick={() =>
                    setZoneLockState(myZone.id, !isZoneLocked(myZone.id))
                  }
                  title="Lock/Unlock this room"
                >
                  {isZoneLocked(myZone.id) ? (
                    <>
                      <DoorOpen size={14} /> Unlock
                    </>
                  ) : (
                    <>
                      <DoorClosed size={14} /> Lock
                    </>
                  )}
                </button>
              )}

              <button
                className="icon-btn"
                onClick={() => setShowSettings(!showSettings)}
                title="Settings"
              >
                <Settings size={18} />
              </button>
            </div>

            <div className="bottom-group">
              <button
                className="pill-btn"
                onClick={() => setShowRightPanel(!showRightPanel)}
                title="Members"
              >
                <Users size={16} />
                <span>{allMembers.length}</span>
              </button>
            </div>
          </div>

          {showSettings && (
            <div className="settings-modal">
              <h3>⚙️ Settings</h3>
              <div className="settings-group">
                <label>Microphone</label>
                <select
                  onChange={(e) => handleMicChange(e.target.value)}
                  value={selectedMic}
                >
                  {audioInputs.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label || d.deviceId}
                    </option>
                  ))}
                </select>
              </div>
              <div className="settings-group">
                <label>Speaker</label>
                <select
                  onChange={(e) => handleSpeakerChange(e.target.value)}
                  value={selectedSpeaker}
                >
                  {audioOutputs.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label || d.deviceId}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="close-btn"
                onClick={() => setShowSettings(false)}
              >
                Close
              </button>
            </div>
          )}

          <div
            className="video-grid"
            style={{ right: showRightPanel ? "340px" : "20px" }}
          >
            {videoTracks.map((v) => {
              if (v.isLocal || isParticipantVisible(v.participantId)) {
                return (
                  <VideoRenderer
                    key={v.id}
                    track={v.track}
                    participantId={v.participantId}
                    isLocal={v.isLocal}
                    onMaximize={handleMaximize}
                    isMaximized={maximizedTrackId === v.id}
                    showRightPanel={showRightPanel}
                  />
                );
              }
              return null;
            })}
          </div>
        </>
      )}
    </div>
  );
}
