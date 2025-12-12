import React, { useRef, useState, useEffect, useCallback } from "react";
import "./styles.css";
import { Room, RoomEvent, Track } from "livekit-client";

const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL;

const MAP_WIDTH = 2000;
const MAP_HEIGHT = 2000;
const SPEED = 8;
const COLLISION_RADIUS = 40; 
const GRID_SIZE = 40;

// --- Assets ---
const AVATARS = [
  "https://gameartpartners.com/wp-content/uploads/edd/2015/06/goblin_featured.png",
  "https://www.pngkey.com/png/full/106-1066616_ninja-royalty-free-game-art-character-png-character.png",
  "https://png.pngtree.com/png-vector/20250805/ourmid/pngtree-ashen-blonde-elf-in-magenta-cape-with-curved-sword-16-bit-png-image_17026789.webp",
  "https://static.vecteezy.com/system/resources/previews/058/267/325/non_2x/adorable-cartoon-ninja-character-with-two-katanas-ready-for-action-free-png.png",
  "https://png.pngtree.com/png-vector/20241203/ourmid/pngtree-anime-style-chibi-mongol-warrior-holding-sword-in-traditional-mongolian-battle-png-image_13784919.png",
  "https://png.pngtree.com/png-vector/20240315/ourmid/pngtree-cute-unicorn-unicorn-kawaii-chibi-drawing-style-unicorn-cartoon-png-image_11972740.png",
];

const ZONES = [
  { id: 'meeting', name: 'Meeting Room', x: 280, y: 200, w: 500, h: 550, color: '#3b82f6' },
  { id: 'bar', name: 'Bar', x: 100, y: 1200, w: 680, h: 430, color: '#eab308' },
  { id: 'holiday_villa', name: 'Holiday Villa', x: 850, y: 1150, w: 960, h: 520, color: '#ec4899' },
  { id: 'meeting_2', name: 'Meeting', x: 940, y: 80, w: 840, h: 380, color: '#45cca8ff' },
  { id: 'garden', name: 'Garden', x: 810, y: 510, w: 850, h: 590, color: '#6945c5ff' },
];

const OBSTACLES = [
  { id: 'wall-top', x: 0, y: 0, w: 2000, h: 80 },
  { id: 'wall-bottom', x: 0, y: 1910, w: 2000, h: 90 },
  // { id: 'wall-1-1', x: 0, y: 750, w: 220, h: 10 },
  // { id: 'wall-1-2', x: 280, y: 750, w: 100, h: 10 },
  // { id: 'wall-1-3', x: 650, y: 750, w: 130, h: 10 },
  // { id: 'wall-1-4', x: 220, y: 550, w: 10, h: 210 },
  // { id: 'wall-1-5', x: 280, y: 210, w: 10, h: 540 },
  // { id: 'wall-1-6', x: 780, y: 80, w: 10, h: 680 },
  // { id: 'wall-1-7', x: 280, y: 200, w: 500, h: 10 },
  { id: 'tree-1', x: 1130, y: 680, w: 230, h: 220 },
];

const STATUS_OPTIONS = [
  { label: "Available", color: "#22c55e" },
  { label: "Busy", color: "#f59e0b" },
  { label: "Do Not Disturb", color: "#ef4444" }
];

function getDistance(p1, p2) { return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)); }
function checkZone(x, y) { return ZONES.find(z => x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h) || null; }
function checkObstacle(x, y) { return OBSTACLES.some(o => x >= o.x && x <= o.x + o.w && y >= o.y && y <= o.y + o.h); }

function getRandomSpawn() {
  let spawn;
  let valid = false;
  while (!valid) {
    spawn = { x: 1000 + (Math.random() * 400 - 200), y: 1000 + (Math.random() * 400 - 200) };
    if (!checkObstacle(spawn.x, spawn.y)) valid = true;
  }
  return spawn;
}

// --- Pathfinding Logic (A*) ---
let grid = null;
function initGrid() {
  const cols = Math.ceil(MAP_WIDTH / GRID_SIZE);
  const rows = Math.ceil(MAP_HEIGHT / GRID_SIZE);
  grid = new Array(rows).fill(0).map(() => new Array(cols).fill(0));
  OBSTACLES.forEach(o => {
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
  const startNode = { x: Math.floor(startX / GRID_SIZE), y: Math.floor(startY / GRID_SIZE) };
  const endNode = { x: Math.floor(endX / GRID_SIZE), y: Math.floor(endY / GRID_SIZE) };
  if (startNode.x < 0 || startNode.y < 0 || endNode.x < 0 || endNode.y < 0) return [];
  if (grid[endNode.y] && grid[endNode.y][endNode.x] === 1) return [];

  let openList = [startNode];
  let closedList = [];
  let cameFrom = {};
  startNode.g = 0; startNode.f = getDistance(startNode, endNode);

  while (openList.length > 0) {
    openList.sort((a, b) => a.f - b.f);
    let current = openList.shift();
    if (current.x === endNode.x && current.y === endNode.y) {
      let path = [];
      let temp = current;
      while (temp) { path.push({ x: temp.x * GRID_SIZE + GRID_SIZE/2, y: temp.y * GRID_SIZE + GRID_SIZE/2 }); temp = cameFrom[`${temp.x},${temp.y}`]; }
      return path.reverse();
    }
    closedList.push(current);
    const neighbors = [{ x: current.x + 1, y: current.y }, { x: current.x - 1, y: current.y }, { x: current.x, y: current.y + 1 }, { x: current.x, y: current.y - 1 }];
    for (let neighbor of neighbors) {
      if (neighbor.x < 0 || neighbor.y < 0 || neighbor.y >= grid.length || neighbor.x >= grid[0].length) continue;
      if (grid[neighbor.y][neighbor.x] === 1) continue;
      if (closedList.find(n => n.x === neighbor.x && n.y === neighbor.y)) continue;
      let tentativeG = current.g + 1;
      let existing = openList.find(n => n.x === neighbor.x && n.y === neighbor.y);
      if (!existing || tentativeG < existing.g) {
        neighbor.g = tentativeG; neighbor.f = neighbor.g + getDistance(neighbor, endNode);
        cameFrom[`${neighbor.x},${neighbor.y}`] = current;
        if (!existing) openList.push(neighbor);
      }
    }
  }
  return [];
}

const VideoRenderer = ({ track, participantId, isLocal, onMaximize, isMaximized, showRightPanel }) => {
  const videoRef = useRef(null);
  useEffect(() => {
    const el = videoRef.current;
    if (track && el) {
      track.attach(el);
    }
    return () => {
      if (track && el) {
        track.detach(el);
        el.srcObject = null; // Important: Clear source to prevent frozen frame
      }
    };
  }, [track]);

  return (
    <div className={`video-card ${isMaximized ? 'maximized' : ''}`} style={{ width: isMaximized ? showRightPanel ? 'calc(100vw - 320px)' : '100vw' : '200px' }}>
      <video ref={videoRef} playsInline autoPlay muted={isLocal} />
      <div className="video-info-bar">
        <span>{isLocal ? "Me" : participantId}</span>
        <button className="expand-btn" onClick={() => onMaximize(track.sid)}>{isMaximized ? "✖" : "⤢"}</button>
      </div>
    </div>
  );
};

export default function App() {
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
  
  // Status State
  const [myAvailability, setMyAvailability] = useState("Available");
  const [myStatusText, setMyStatusText] = useState(""); 

  const [otherPlayers, setOtherPlayers] = useState({});
  const [speakingIds, setSpeakingIds] = useState([]);
  
  // Initial Zoom OUT (60%)
  const [zoom, setZoom] = useState(0.6); 
  const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight });

  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showBottomPanel, setShowBottomPanel] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  const [activeTab, setActiveTab] = useState('members');
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [dmTarget, setDmTarget] = useState(null);
  const [summonRequest, setSummonRequest] = useState(null);
  const [followingId, setFollowingId] = useState(null);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [tempStatusText, setTempStatusText] = useState("");

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

  useEffect(() => {
    initGrid();
    const handleResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    
    const handleKeyDown = (e) => { 
        if(e.key.toLowerCase() === 'g' && !e.repeat) {
            isGhostRef.current = true; 
            setIsGhost(true);
        }
    };
    const handleKeyUp = (e) => { 
        if(e.key.toLowerCase() === 'g') {
            isGhostRef.current = false; 
            setIsGhost(false);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => { if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages, activeTab]);

  useEffect(() => { otherPlayersRef.current = otherPlayers; }, [otherPlayers]);

  // Helper to remove video safely
  const removeVideoTrack = (sid) => {
    setVideoTracks(prev => prev.filter(t => t.id !== sid));
  };

  const handleJoin = async () => {
    if (!inputName.trim()) return alert("Please enter your name");
    const spawn = getRandomSpawn();
    setMyPos(spawn); posRef.current = spawn; targetRef.current = spawn;
    const uid = `${inputName}#${Math.random().toString(36).slice(2, 6)}`;
    setIdentity(uid); setDisplayName(inputName); setMyAvatar(selectedAvatar); setJoined(true);
    await connect(uid);
  };

  async function connect(userId) {
    try {
      const res = await fetch("http://localhost:3001/livekit/token", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName: "OfficeMap", identity: userId }),
      });
      const { token } = await res.json();
      const room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;

      room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => setSpeakingIds(speakers.map(s => s.identity)));
      
      // --- Handle Remote Tracks ---
      room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        if (track.kind === Track.Kind.Audio) {
          const el = track.attach(); el.autoplay = true;
          if (selectedSpeaker && typeof el.setSinkId === 'function') el.setSinkId(selectedSpeaker).catch(console.error);
          document.body.appendChild(el);
          audioTracksRef.current[participant.identity] = { track, element: el };
        } else if (track.kind === Track.Kind.Video) {
          setVideoTracks(prev => {
             // Avoid duplicates
             if(prev.some(t => t.id === track.sid)) return prev;
             return [...prev, { id: track.sid, track, participantId: participant.identity, isLocal: false }];
          });
        }
      });
      
      
      room.on(RoomEvent.TrackUnsubscribed, (track, pub, participant) => {
        if (track.kind === Track.Kind.Audio) { track.detach().forEach(el => el.remove()); delete audioTracksRef.current[participant.identity]; }
        else if (track.kind === Track.Kind.Video) {
           // --- FIX: Use correct property name from event ---
           // track might be null, use pub.trackSid
           removeVideoTrack(pub.trackSid);
        }
      });

      // --- Handle Local Tracks ---
      room.on(RoomEvent.LocalTrackPublished, (pub, participant) => {
        if (pub.kind === Track.Kind.Video) {
          const trackSid = pub.track.sid;
          setVideoTracks(prev => {
             if(prev.some(t => t.id === trackSid)) return prev;
             return [...prev, { id: trackSid, track: pub.track, participantId: userId, isLocal: true }];
          });
        }
      });

      room.on(RoomEvent.LocalTrackUnpublished, (pub, participant) => {
        if (pub.kind === Track.Kind.Video) {
          // Reliable removal using publication.trackSid
          removeVideoTrack(pub.trackSid);
          
          if (pub.source === Track.Source.Camera) setCamOn(false);
          if (pub.source === Track.Source.ScreenShare) setScreenOn(false);
        }
      });

      room.on(RoomEvent.TrackMuted, (pub, participant) => {
        if (pub.source === Track.Source.Camera) {
          // Reliable removal using publication.trackSid
          removeVideoTrack(pub.trackSid);
          
          if (participant.isLocal && pub.source === Track.Source.Camera) setCamOn(false);
        }
      });

      room.on(RoomEvent.TrackUnmuted, (pub, participant) => {
        if (pub.source === Track.Source.Camera) {
          // แสดงกลับ
          const trackSid = pub.track.sid;
          setVideoTracks(prev => {
             if(prev.some(t => t.id === trackSid)) return prev;
             return [...prev, { id: trackSid, track: pub.track, participantId: userId, isLocal: participant.isLocal }];
          });
        }
      });

      room.on(RoomEvent.DataReceived, (payload, participant) => {
        const data = JSON.parse(new TextDecoder().decode(payload));
        if (data.type === "move") {
          setOtherPlayers(prev => ({ ...prev, [participant.identity]: { x: data.x, y: data.y, f: data.f, m: data.m, mv: data.mv, z: data.z, a: data.a, n: data.n, s: data.s, st: data.st } }));
        } else if (data.type === "chat") {
          if (data.scope === 'private' && data.target !== userId) return;
          if (data.scope === 'room' && data.target !== myZone?.id && data.target !== 'Lobby' && myZone?.id) return;
          setChatMessages(prev => [...prev, { sender: data.senderName || participant.identity, text: data.text, type: data.scope, timestamp: Date.now() }]);
          if (data.scope === 'private') { setDmTarget(participant.identity); setActiveTab('dm'); }
        } else if (data.type === "summon" && data.targetId === userId) {
          setSummonRequest({ requester: data.requesterName || participant.identity, requesterId: participant.identity, x: data.x, y: data.y });
        }
      });
      room.on(RoomEvent.ParticipantDisconnected, (p) => {
        setOtherPlayers(prev => { const next = { ...prev }; delete next[p.identity]; return next; });
        setVideoTracks(prev => prev.filter(t => t.participantId !== p.identity));
      });

      await room.connect(LIVEKIT_URL, token);
      await room.localParticipant.setMicrophoneEnabled(true, { echoCancellation: true, noiseSuppression: true });
      micOnRef.current = true; setMicOn(true); setConnected(true); await loadDevices();
    } catch (e) { console.error(e); alert("Connection Failed"); }
  }

  const loadDevices = async () => { try { const d = await navigator.mediaDevices.enumerateDevices(); setAudioInputs(d.filter(x => x.kind === 'audioinput')); setAudioOutputs(d.filter(x => x.kind === 'audiooutput')); } catch (e) {} };
  const handleMicChange = async (v) => { if (!roomRef.current) return; setSelectedMic(v); await roomRef.current.switchActiveDevice('audioinput', v); };
  const handleSpeakerChange = async (v) => { setSelectedSpeaker(v); if (roomRef.current) await roomRef.current.switchActiveDevice('audiooutput', v); Object.values(audioTracksRef.current).forEach(({ element }) => { if (element && typeof element.setSinkId === 'function') element.setSinkId(v).catch(console.error); }); };
  const toggleMic = async () => { if (!roomRef.current) return; const t = !micOn; try { await roomRef.current.localParticipant.setMicrophoneEnabled(t); setMicOn(t); micOnRef.current = t; } catch {} };
  
  // --- Video Toggles (Pure Event Driven) ---
  const toggleCam = async () => { 
    if (!roomRef.current) return; 
    const target = !camOn;
    
    // We only call the API. The UI State (videoTracks) will be updated by 
    // LocalTrackPublished/Unpublished events to avoid race conditions.
    try {
      await roomRef.current.localParticipant.setCameraEnabled(target);
      setCamOn(target); // Sync button state
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
    }
  };

  const toggleNoise = async () => { const n = !noiseOn; setNoiseOn(n); if (roomRef.current && micOn) { const t = roomRef.current.localParticipant.getTrackPublication(Track.Source.Microphone); if (t && t.track) await t.track.restart({ echoCancellation: true, noiseSuppression: n, autoGainControl: true }); } };
  const handleMaximize = (id) => setMaximizedTrackId(prev => prev === id ? null : id);
  const handleStatusChange = (s) => { setMyAvailability(s); setShowStatusMenu(false); };
  const handleCustomStatus = () => { setMyStatusText(tempStatusText); setTempStatusText(""); setShowStatusMenu(false); };

  const handleWalkTo = useCallback((x, y, targetId = null) => {
    followingRef.current = targetId; setFollowingId(targetId);
    if (x === undefined || y === undefined) return;

    if (isGhostRef.current) {
        targetRef.current = { x, y };
        pathRef.current = [];
    } else {
        const path = findPath(posRef.current.x, posRef.current.y, x, y);
        if (path && path.length > 0) { pathRef.current = path; targetRef.current = path[0]; }
        else { targetRef.current = { x, y }; pathRef.current = []; }
    }
    setClickMarker({ x, y, id: markerIdRef.current++ }); setSelectedMemberId(null);
  }, []);

  const handleMapClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const worldX = (e.clientX - rect.left) / zoom;
    const worldY = (e.clientY - rect.top) / zoom;
    handleWalkTo(worldX, worldY, null);
  };

  const handleWheel = (e) => setZoom(prev => Math.min(Math.max(0.3, prev + (-e.deltaY * 0.001)), 2.5));

  const sendChat = async () => {
    if (!chatInput.trim() || !roomRef.current) return;
    let scope = activeTab === 'members' ? 'global' : activeTab;
    let target = null;
    if (scope === 'room') target = myZone ? myZone.id : 'Lobby';
    if (scope === 'dm') { scope = 'private'; target = dmTarget; if (!target) { alert("Select user first"); return; } }
    const msg = { type: 'chat', text: chatInput, scope, target, senderName: displayName };
    await roomRef.current.localParticipant.publishData(new TextEncoder().encode(JSON.stringify(msg)), { reliable: true });
    setChatMessages(prev => [...prev, { sender: displayName, text: chatInput, type: scope, timestamp: Date.now() }]);
    setChatInput("");
  };

  const sendSummon = async (targetId) => {
    if (!roomRef.current) return;
    const p = otherPlayers[targetId];
    if(p && p.s === "Do Not Disturb") return alert("User is Do Not Disturb");
    const msg = { type: 'summon', targetId, x: posRef.current.x, y: posRef.current.y, requesterName: displayName };
    await roomRef.current.localParticipant.publishData(new TextEncoder().encode(JSON.stringify(msg)), { reliable: true });
    setSelectedMemberId(null);
  };

  const isParticipantVisible = (targetId) => {
    if (targetId === identity) return true;
    const other = otherPlayers[targetId];
    if (!other) return false;
    const myZoneId = myZone?.id; const otherZoneId = other.z;
    if (myZoneId && otherZoneId && myZoneId === otherZoneId) return true;
    if (!myZoneId && !otherZoneId && getDistance(myPos, {x: other.x, y: other.y}) <= 600) return true;
    return false;
  };

  useEffect(() => {
    if (!connected) return;
    const loop = setInterval(() => {
      if (followingRef.current) {
        const p = otherPlayersRef.current[followingRef.current];
        if (p) { targetRef.current = { x: p.x, y: p.y }; pathRef.current = []; }
        else { followingRef.current = null; setFollowingId(null); }
      }
      let currentTarget = targetRef.current;
      const dx = currentTarget.x - posRef.current.x;
      const dy = currentTarget.y - posRef.current.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      let moveX = 0, moveY = 0, isMoving = false;

      if (dist > SPEED) {
        const angle = Math.atan2(dy, dx);
        moveX = Math.cos(angle) * SPEED; moveY = Math.sin(angle) * SPEED;
        isMoving = true;
        if (Math.abs(dx) > 1) facingRef.current = dx > 0 ? "right" : "left";
      } else if (pathRef.current.length > 0) {
        targetRef.current = pathRef.current.shift();
      } else {
        posRef.current.x = currentTarget.x; posRef.current.y = currentTarget.y;
      }

      if (isMoving) {
        let nextX = posRef.current.x + moveX; let nextY = posRef.current.y + moveY;
        let cx = false, cy = false;
        
        if (!isGhostRef.current) {
            if (checkObstacle(nextX, posRef.current.y)) cx = true;
            if (checkObstacle(posRef.current.x, nextY)) cy = true;
            Object.values(otherPlayersRef.current).forEach(p => {
              if (getDistance(posRef.current, p) < 10) return;
              if (getDistance({x: nextX, y: posRef.current.y}, p) < COLLISION_RADIUS) cx = true;
              if (getDistance({x: posRef.current.x, y: nextY}, p) < COLLISION_RADIUS) cy = true;
            });
        }
        if (cx) moveX = 0; if (cy) moveY = 0;
        if (isGhostRef.current || !checkObstacle(posRef.current.x + moveX, posRef.current.y + moveY)) {
          posRef.current.x += moveX; posRef.current.y += moveY;
        }
      }

      const z = checkZone(posRef.current.x, posRef.current.y);
      if (z?.id !== myZone?.id) setMyZone(z);
      setMyPos({ ...posRef.current }); setMyFacing(facingRef.current);
      if (isMoving !== isMovingRef.current) isMovingRef.current = isMoving;

      const data = JSON.stringify({ type: "move", x: posRef.current.x, y: posRef.current.y, f: facingRef.current, mv: isMovingRef.current, m: !micOnRef.current, z: z ? z.id : null, a: myAvatar, n: displayName, s: myAvailability, st: myStatusText });
      roomRef.current?.localParticipant.publishData(new TextEncoder().encode(data), { reliable: false });
    }, 30);
    return () => clearInterval(loop);
  }, [connected, myZone, myAvatar, displayName, identity, myAvailability, myStatusText]);

  useEffect(() => {
    if (!connected) return;
    const MAX = 600, MIN = 100;
    Object.keys(otherPlayers).forEach(pid => {
      const other = otherPlayers[pid];
      const obj = audioTracksRef.current[pid];
      if (obj) {
        if (other.m || myAvailability === "Do Not Disturb" || other.s === "Do Not Disturb") { 
          obj.track.setVolume(0); 
        } else {
          const z1 = myZone?.id, z2 = other.z;
          let vol = 0;
          if (z1 && z2 && z1 === z2) vol = 1;
          else if (z1 || z2) vol = 0;
          else {
            const dist = getDistance(posRef.current, other);
            if (dist <= MIN) vol = 1; else if (dist > MAX) vol = 0;
            else vol = 1 - Math.pow((dist - MIN) / (MAX - MIN), 2);
          }
          obj.track.setVolume(vol);
        }
      }
    });
  }, [myPos, otherPlayers, connected, myZone, myAvailability]);

  const targetCamX = (viewport.w - (showRightPanel ? 320 : 0)) / 2 - myPos.x * zoom;
  const targetCamY = (viewport.h - 80) / 2 - myPos.y * zoom;
  const camX = Math.min(0, Math.max(viewport.w - MAP_WIDTH * zoom, targetCamX));
  const camY = Math.min(0, Math.max(viewport.h - MAP_HEIGHT * zoom, targetCamY));

  const allMembers = [
    { id: identity, name: displayName + " (You)", status: "Online", z: myZone?.name || "Lobby", avatar: myAvatar, s: myAvailability, st: myStatusText, x: myPos.x, y: myPos.y, zoneId: myZone?.id },
    ...Object.entries(otherPlayers).map(([id, d]) => ({ id, name: d.n || id, status: "Online", z: d.z ? ZONES.find(z=>z.id===d.z)?.name : "Lobby", avatar: d.a || AVATARS[0], s: d.s, st: d.st, x: d.x, y: d.y, zoneId: d.z }))
  ];
  const groupedMembers = allMembers.reduce((acc, m) => { 
    let key = "Lobby";
    if(m.zoneId) key = ZONES.find(z=>z.id===m.zoneId)?.name || "Unknown";
    else if (!myZone && getDistance(myPos, {x: m.x, y: m.y}) < 600) key = "🗣️ Nearby";
    if(!acc[key]) acc[key]=[]; acc[key].push(m); return acc; 
  }, {});
  const sortedKeys = Object.keys(groupedMembers).sort((a,b) => a.includes("Nearby")?-1:b.includes("Nearby")?1:a==="Lobby"?1:b==="Lobby"?-1:a.localeCompare(b));
  
  const displayMessages = chatMessages.filter(msg => {
    if (activeTab === 'global') return msg.type === 'global';
    if (activeTab === 'room') return msg.type === 'room';
    if (activeTab === 'dm') return msg.type === 'private';
    return false;
  });

  const getStatusColor = (s) => s === "Do Not Disturb" ? "#ef4444" : s === "Busy" ? "#f59e0b" : "#22c55e";

  return (
    <div className="game-container" onWheel={handleWheel}>
      {!joined && (
        <div className="login-screen">
          <div className="login-card">
            <h2 style={{color: 'white', marginBottom: '20px'}}>Sketec World Login</h2>
            <input className="login-input" placeholder="Name" value={inputName} onChange={e => setInputName(e.target.value)} />
            <div className="avatar-selector">{AVATARS.map((a, i) => <div key={i} className={`avatar-option ${selectedAvatar === a ? 'selected' : ''}`} onClick={() => setSelectedAvatar(a)}><img src={a} alt="char" /></div>)}</div>
            <button className="start-btn" onClick={handleJoin}>Join</button>
          </div>
        </div>
      )}

      {joined && (
        <>
          <div className="world-layer" style={{ transform: `translate(${camX}px, ${camY}px) scale(${zoom})`, transformOrigin: '0 0' }} onClick={handleMapClick}>
            {myZone && <div className="room-spotlight" style={{ left: myZone.x, top: myZone.y, width: myZone.w, height: myZone.h }} />}
            {ZONES.map(z => <div key={z.id} className="zone-area" style={{ left: z.x, top: z.y, width: z.w, height: z.h, borderColor: z.color, opacity: myZone?.id === z.id ? 1 : 0, visibility: myZone?.id === z.id ? 'visible' : 'hidden', transition: 'all 0.3s ease' }}><div className="zone-label" style={{ background: z.color }}>{z.name}</div></div>)}
            {clickMarker && <div key={clickMarker.id} className="click-marker" style={{ left: clickMarker.x, top: clickMarker.y }} />}
            
            <div className={`chibi ${myFacing === "left" ? "face-left" : ""} ${speakingIds.includes(identity) ? "speaking" : ""} ${isGhost ? "ghost" : ""}`} style={{ left: myPos.x, top: myPos.y }}>
              <img src={myAvatar} alt="me" /><div className="name-tag"><span className="name-status-dot" style={{ background: getStatusColor(myAvailability) }} /><span className="name-text">{displayName}</span></div>{!micOn && <div className="mute-icon">🔇</div>}
            </div>
            {Object.entries(otherPlayers).map(([pid, d]) => {
              const isHidden = d.z && d.z !== myZone?.id;
              const isSpeaking = speakingIds.includes(pid);
              return (
                <div key={pid} className={`chibi ${d.f === "left" ? "face-left" : ""} ${isHidden ? "in-zone-hidden" : ""} ${isSpeaking ? "speaking" : ""}`} style={{ left: d.x, top: d.y }} onClick={(e) => { e.stopPropagation(); handleWalkTo(d.x, d.y, pid); }}>
                  <img src={d.a || AVATARS[0]} alt="other" /><div className="name-tag"><span className="name-status-dot" style={{ background: getStatusColor(d.s) }} /><span className="name-text">{d.n || pid}</span></div>{d.m && <div className="mute-icon">🔇</div>}
                </div>
              );
            })}
          </div>

          {followingId && <div style={{position:'absolute',bottom:100,left:'50%',transform:'translateX(-50%)',background:'rgba(0,230,118,0.9)',color:'#0d1117',padding:'8px 20px',borderRadius:'25px',fontWeight:'bold',fontSize:'13px',zIndex:150,pointerEvents:'none'}}><span>👣</span> Following...</div>}
          {summonRequest && myAvailability !== "Do Not Disturb" && <div className="summon-toast"><div>👋 <b>{summonRequest.requester}</b> calls!</div><div className="summon-actions"><div className="btn-accept" onClick={()=>{handleWalkTo(summonRequest.x, summonRequest.y, summonRequest.requesterId); setSummonRequest(null);}}>Go</div><div className="btn-ignore" onClick={()=>setSummonRequest(null)}>Ignore</div></div></div>}

          <div className={`right-panel ${showRightPanel?'':'hidden'}`}>
            <div className="panel-header"><div className="header-title">Sketec</div><span className="header-actions" onClick={()=>setShowRightPanel(false)}>✖</span></div>
            <div className="panel-tabs">
               <div className={`panel-tab ${activeTab==='members'?'active':''}`} onClick={()=>setActiveTab('members')}>Members</div>
               <div className={`panel-tab ${activeTab==='global'?'active':''}`} onClick={()=>setActiveTab('global')}>Global</div>
               <div className={`panel-tab ${activeTab==='room'?'active':''}`} onClick={()=>setActiveTab('room')}>Room</div>
               <div className={`panel-tab ${activeTab==='dm'?'active':''}`} onClick={()=>setActiveTab('dm')}>DM</div>
            </div>
            <div className="tab-content">
              {activeTab === 'members' ? (
                <div className="member-list">
                  {sortedKeys.map((zName) => (
                    <div key={zName}>
                      <div className="group-header">{zName}</div>
                      {groupedMembers[zName].map((m) => (
                        <div key={m.id} className="member-item" onClick={(e)=>{ e.stopPropagation(); if(m.id!==identity) setSelectedMemberId(prev=>prev===m.id?null:m.id); }}>
                           <div className={`avatar-circle ${speakingIds.includes(m.id)?"speaking":""}`}><img src={m.avatar} alt="avatar" style={{imageRendering:'pixelated'}} /></div>
                           <div className="member-info">
                              <div className="member-name">{m.name} 
                                {m.id === identity && <span style={{marginLeft:5, cursor:'pointer', fontSize:10}} onClick={(e)=>{e.stopPropagation(); setShowStatusMenu(!showStatusMenu)}}>✏️</span>}
                              </div>
                              <div className="member-custom-status" style={{color: getStatusColor(m.s)}}>{m.st || m.s || "Available"}</div>
                              {m.id === identity && showStatusMenu && <div className="member-menu-popup" style={{top: 25, zIndex: 600}}>
                                  {STATUS_OPTIONS.map(opt => <button key={opt.label} className="menu-action-btn" onClick={(e)=>{e.stopPropagation(); handleStatusChange(opt.label);}}><span style={{color: opt.color}}>●</span> {opt.label}</button>)}
                                  <div style={{padding: '5px 8px'}}>
                                    <input className="status-edit-input" placeholder="Custom status..." value={tempStatusText} onChange={(e)=>setTempStatusText(e.target.value)} onKeyDown={(e)=>{if(e.key==='Enter') handleCustomStatus()}} />
                                  </div>
                              </div>}
                           </div>
                           <div className="status-dot" style={{background: getStatusColor(m.s)}}></div>
                           {selectedMemberId===m.id && m.id!==identity && <div className="member-menu-popup">
                             <button className="menu-action-btn" onClick={(e)=>{e.stopPropagation(); handleWalkTo(m.x, m.y, m.id); setSelectedMemberId(null);}}><span>👣</span> Walk to</button>
                             <button className="menu-action-btn" onClick={(e)=>{e.stopPropagation(); sendSummon(m.id);}}><span>👋</span> Summon</button>
                             <button className="menu-action-btn" onClick={(e)=>{e.stopPropagation(); setDmTarget(m.id); setActiveTab('dm'); setSelectedMemberId(null);}}><span>💬</span> Message</button>
                           </div>}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                 <div className="chat-container">
                    {activeTab === 'dm' && dmTarget && <div className="dm-target-info"><span>To: <b>{otherPlayers[dmTarget]?.n || dmTarget}</b></span><span className="dm-close" onClick={()=>setDmTarget(null)}>✖</span></div>}
                    <div className="chat-messages">{displayMessages.map((msg,i)=><div key={i} className={`chat-msg ${msg.sender===displayName?'me':''} ${msg.type}`}><b>{msg.sender}</b>{msg.text}</div>)}<div ref={chatEndRef} /></div>
                    <div className="chat-input-area"><input className="chat-input" value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendChat()} /><button className="chat-send-btn" onClick={sendChat}>➤</button></div>
                 </div>
              )}
            </div>
          </div>
          <div className="bottom-panel">
             <div className="bottom-group">
               <button className={micOn?"active":""} onClick={toggleMic}>{micOn?"🎙️":"🔇"}</button>
               <button className={camOn?"active":""} onClick={toggleCam}>📷</button>
               <button className={screenOn?"active":""} onClick={toggleScreen}>🖥️</button>
               <div className="divider"></div>
               <button onClick={toggleNoise}>{noiseOn?"✨":"🔊"}</button>
               <button onClick={()=>setShowSettings(!showSettings)}>⚙️</button>
               </div>
             <div className="bottom-group">
               <button onClick={()=>setShowRightPanel(!showRightPanel)}>👥 {allMembers.length}</button>
             </div>
          </div>

          {showSettings && <div className="settings-modal">
              <h3>⚙️ Settings</h3>
              <div className="settings-group"><label>Microphone</label><select onChange={(e) => handleMicChange(e.target.value)} value={selectedMic}>{audioInputs.map((d) => <option key={d.deviceId} value={d.deviceId}>{d.label || d.deviceId}</option>)}</select></div>
              <div className="settings-group"><label>Speaker</label><select onChange={(e) => handleSpeakerChange(e.target.value)} value={selectedSpeaker}>{audioOutputs.map((d) => <option key={d.deviceId} value={d.deviceId}>{d.label || d.deviceId}</option>)}</select></div>
              <button className="close-btn" onClick={() => setShowSettings(false)}>Close</button>
          </div>}

          <div className="video-grid" style={{right: showRightPanel ? '340px' : '20px'}}>
            {videoTracks.map((v) => {
              if (v.isLocal || isParticipantVisible(v.participantId)) {
                return <VideoRenderer key={v.id} track={v.track} participantId={v.participantId} isLocal={v.isLocal} onMaximize={handleMaximize} isMaximized={maximizedTrackId === v.id} showRightPanel={showRightPanel}/>;
              }
              return null;
            })}
          </div>
        </>
      )}
    </div>
  );
}