import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient";

const ADMIN = { username: "admin", password: "assassin2026" };

function genCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function displayName(u) { return u?.replace(/_/g, " ") || "—"; }

const css = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap');

*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

:root {
  --red: #cc0000; --red-dim: #880000;
  --bg: #080808; --bg2: #0e0e0e; --bg3: #141414;
  --border: #1e1e1e; --border2: #2a2a2a;
  --text: #e2d9cc; --text2: #888; --text3: #444;
  --gold: #d4a843;
}

body { background: var(--bg); color: var(--text); font-family: 'Courier Prime', monospace; min-height:100vh; }

.app { max-width: 430px; margin: 0 auto; min-height: 100vh; background: var(--bg); position: relative; overflow-x: hidden; }
.app::before { content:''; position:fixed; inset:0; pointer-events:none; z-index:9999; opacity:0.025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }

.auth-wrap { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:32px 24px;
  background: radial-gradient(ellipse 80% 60% at 50% 0%, #1a0000 0%, transparent 65%); }

.logo-mark { width:90px; height:90px; margin-bottom:20px; animation:slowspin 25s linear infinite; }
@keyframes slowspin { to { transform: rotate(360deg); } }

.auth-title { font-family:'Bebas Neue',sans-serif; font-size:52px; letter-spacing:6px; text-align:center; line-height:0.9; color:#fff; text-shadow:0 0 60px rgba(200,0,0,0.4); margin-bottom:4px; }
.auth-sub { font-size:9px; letter-spacing:6px; color:var(--red); text-transform:uppercase; margin-bottom:40px; }
.auth-card { width:100%; background:var(--bg2); border:1px solid var(--border); padding:28px; }

.auth-tabs { display:flex; margin-bottom:24px; border-bottom:1px solid var(--border); }
.auth-tab { flex:1; background:none; border:none; font-family:'Courier Prime',monospace; font-size:10px; letter-spacing:3px; text-transform:uppercase; color:var(--text3); padding:10px; cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-1px; transition:all 0.15s; }
.auth-tab.active { color:var(--red); border-bottom-color:var(--red); }

.field { margin-bottom:16px; }
.field-label { font-size:9px; letter-spacing:3px; text-transform:uppercase; color:var(--text3); margin-bottom:6px; }

.inp { width:100%; background:var(--bg); border:1px solid var(--border); color:var(--text); padding:12px 14px; font-family:'Courier Prime',monospace; font-size:14px; outline:none; transition:border-color 0.15s; border-radius:0; -webkit-appearance:none; }
.inp:focus { border-color:var(--red); }
.inp::placeholder { color:var(--text3); }

.inp-code { text-align:center; font-family:'Bebas Neue',sans-serif; font-size:36px; letter-spacing:10px; background:#050505; border-color:var(--red-dim); color:var(--red); padding:16px; }
.inp-code:focus { border-color:var(--red); }
.inp-code::placeholder { color:#2a0000; letter-spacing:6px; }

.err { font-size:11px; color:var(--red); letter-spacing:1px; margin-bottom:12px; }

.btn { display:block; width:100%; padding:14px 20px; font-family:'Courier Prime',monospace; font-size:12px; font-weight:700; letter-spacing:3px; text-transform:uppercase; cursor:pointer; border:none; transition:all 0.15s; }
.btn-primary { background:var(--red); color:#fff; clip-path:polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%); }
.btn-primary:hover { background:#e00; box-shadow:0 6px 24px rgba(200,0,0,0.35); transform:translateY(-1px); }
.btn-primary:disabled { opacity:0.3; cursor:not-allowed; transform:none; box-shadow:none; }
.btn-outline { background:transparent; color:var(--text2); border:1px solid var(--border2); }
.btn-outline:hover { border-color:#444; color:var(--text); }
.btn-danger { background:linear-gradient(135deg,#5a0000,var(--red)); color:#fff; clip-path:polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%); }
.btn-danger:hover { background:linear-gradient(135deg,#800,#f00); box-shadow:0 8px 32px rgba(200,0,0,0.4); transform:translateY(-1px); }
.btn-danger:disabled { opacity:0.3; cursor:not-allowed; transform:none; }
.btn-gold { background:var(--gold); color:#111; clip-path:polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%); font-weight:700; }
.btn-gold:hover { background:#e0b84e; transform:translateY(-1px); }
.btn-sm { padding:9px 16px; font-size:10px; letter-spacing:2px; }

.header { position:sticky; top:0; z-index:50; display:flex; align-items:center; justify-content:space-between; padding:14px 18px; background:rgba(8,8,8,0.97); backdrop-filter:blur(12px); border-bottom:1px solid var(--border); }
.header-title { font-family:'Bebas Neue',sans-serif; font-size:20px; letter-spacing:4px; }
.header-user { font-size:10px; letter-spacing:2px; color:var(--text3); }
.header-logout { background:none; border:none; color:var(--text3); font-family:'Courier Prime',monospace; font-size:10px; letter-spacing:2px; text-transform:uppercase; cursor:pointer; transition:color 0.15s; padding:4px 0; }
.header-logout:hover { color:var(--red); }

.nav { display:flex; border-bottom:1px solid var(--border); position:sticky; top:53px; z-index:40; background:var(--bg2); }
.nav-tab { flex:1; padding:12px 4px; background:none; border:none; font-family:'Courier Prime',monospace; font-size:9px; letter-spacing:2px; text-transform:uppercase; color:var(--text3); cursor:pointer; border-bottom:2px solid transparent; transition:all 0.15s; }
.nav-tab.active { color:var(--red); border-bottom-color:var(--red); }

.page { padding:20px 18px; }
.section-label { font-size:9px; letter-spacing:4px; text-transform:uppercase; color:var(--red); margin-bottom:10px; }

.status-pill { display:inline-block; font-size:8px; letter-spacing:3px; text-transform:uppercase; padding:3px 10px; border:1px solid; }
.pill-alive { color:#0a0; border-color:#020; background:rgba(0,170,0,0.06); }
.pill-dead { color:var(--red); border-color:#200; background:rgba(200,0,0,0.06); }
.pill-lobby { color:var(--gold); border-color:#3a2a00; background:rgba(212,168,67,0.06); }

.target-card { border:1px solid var(--red-dim); background:rgba(200,0,0,0.04); padding:24px; margin:16px 0; position:relative; }
.target-card::before { content:''; position:absolute; inset:5px; border:1px solid rgba(200,0,0,0.15); pointer-events:none; }
.target-card-label { font-size:9px; letter-spacing:5px; color:var(--red); text-transform:uppercase; margin-bottom:8px; }
.target-card-name { font-family:'Bebas Neue',sans-serif; font-size:44px; letter-spacing:3px; color:#fff; line-height:1; text-shadow:0 0 30px rgba(200,0,0,0.3); }
.target-card-sub { font-size:10px; color:var(--text3); letter-spacing:2px; margin-top:6px; text-transform:uppercase; }

.code-display-box { background:var(--bg2); border:1px solid var(--border2); padding:20px; margin:16px 0; text-align:center; }
.code-display-label { font-size:9px; letter-spacing:4px; color:var(--text3); text-transform:uppercase; margin-bottom:10px; }
.code-display { font-family:'Bebas Neue',sans-serif; font-size:48px; letter-spacing:12px; color:var(--gold); text-shadow:0 0 20px rgba(212,168,67,0.3); transition:filter 0.3s; }
.code-display.hidden { filter:blur(12px); }
.code-warning { font-size:9px; color:var(--text3); letter-spacing:1px; margin-top:8px; line-height:1.6; }
.show-code-btn { background:none; border:1px solid var(--border2); color:var(--text3); font-family:'Courier Prime',monospace; font-size:9px; letter-spacing:2px; text-transform:uppercase; padding:6px 16px; cursor:pointer; margin-top:10px; transition:all 0.15s; }
.show-code-btn:hover { border-color:#444; color:var(--text2); }

.stat-row { display:grid; grid-template-columns:1fr 1fr; gap:1px; background:var(--border); margin:16px 0; }
.stat-cell { background:var(--bg2); padding:16px; }
.stat-num { font-family:'Bebas Neue',sans-serif; font-size:36px; color:#fff; line-height:1; }
.stat-lab { font-size:9px; letter-spacing:3px; color:var(--text3); text-transform:uppercase; margin-top:3px; }

.lb-header { display:flex; align-items:center; padding:12px 18px; background:var(--bg3); border-bottom:1px solid var(--border); font-size:9px; letter-spacing:3px; text-transform:uppercase; color:var(--text3); }
.lb-row { display:flex; align-items:center; padding:14px 18px; border-bottom:1px solid var(--border); gap:14px; transition:background 0.12s; }
.lb-row:hover { background:var(--bg2); }
.lb-row.me { background:rgba(200,0,0,0.04); border-left:2px solid var(--red-dim); }
.lb-row.elim { opacity:0.4; }
.lb-pos { font-family:'Bebas Neue',sans-serif; font-size:22px; color:var(--text3); width:28px; text-align:center; flex-shrink:0; }
.lb-pos.gold { color:var(--gold); } .lb-pos.silver { color:#aaa; } .lb-pos.bronze { color:#cd7f32; }
.lb-name { flex:1; font-size:14px; letter-spacing:1px; }
.lb-name-you { font-size:9px; letter-spacing:2px; color:var(--red); text-transform:uppercase; display:block; margin-top:2px; }
.lb-kills { font-family:'Bebas Neue',sans-serif; font-size:26px; color:var(--red); min-width:36px; text-align:right; }
.lb-kills-lab { font-size:8px; letter-spacing:2px; color:var(--text3); text-transform:uppercase; text-align:right; }

.admin-banner { background:linear-gradient(90deg,#1a0000,#0d0000); border-bottom:1px solid var(--red-dim); padding:10px 18px; font-size:9px; letter-spacing:4px; text-transform:uppercase; color:var(--red); }
.player-row { display:flex; align-items:center; padding:12px 18px; border-bottom:1px solid var(--border); gap:12px; }
.player-row.elim { opacity:0.4; }
.player-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
.dot-alive { background:#0a0; box-shadow:0 0 6px #0a0; animation:pdot 2s ease-in-out infinite; }
.dot-dead { background:var(--red); }
@keyframes pdot { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
.player-row-name { flex:1; font-size:13px; letter-spacing:1px; }
.player-row-kills { font-size:11px; color:var(--red); letter-spacing:1px; }
.player-row-target { font-size:9px; color:var(--text3); letter-spacing:1px; margin-top:2px; }

.divider { border:none; border-top:1px solid var(--border); margin:20px 0; }

.toast { position:fixed; bottom:28px; left:50%; transform:translateX(-50%); background:var(--bg3); border:1px solid var(--border2); padding:10px 22px; font-size:10px; letter-spacing:2px; text-transform:uppercase; color:var(--text2); z-index:10000; white-space:nowrap; animation:tin 0.25s ease, tout 0.25s ease 1.75s forwards; }
.toast.success { border-color:var(--red); color:var(--red); }
.toast.warn { border-color:var(--gold); color:var(--gold); }
@keyframes tin { from{opacity:0;transform:translate(-50%,16px);} to{opacity:1;transform:translate(-50%,0);} }
@keyframes tout { to{opacity:0;} }

.winner-wrap { min-height:60vh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px 24px; text-align:center; }
.winner-trophy { font-size:72px; animation:bob 1.2s ease-in-out infinite alternate; }
@keyframes bob { from{transform:translateY(0) scale(1);} to{transform:translateY(-14px) scale(1.05);} }
.winner-title { font-family:'Bebas Neue',sans-serif; font-size:56px; letter-spacing:5px; color:var(--gold); text-shadow:0 0 40px rgba(212,168,67,0.5); }
.winner-name { font-family:'Bebas Neue',sans-serif; font-size:38px; letter-spacing:3px; color:#fff; }
.winner-stat { font-size:11px; letter-spacing:3px; color:var(--text3); text-transform:uppercase; margin-top:6px; }

.lobby-wrap { padding:24px 18px; text-align:center; }
.lobby-icon { font-size:48px; margin-bottom:16px; }
.lobby-title { font-family:'Bebas Neue',sans-serif; font-size:32px; letter-spacing:4px; margin-bottom:8px; }
.lobby-desc { font-size:11px; color:var(--text3); letter-spacing:1px; line-height:1.8; }

.info-box { background:var(--bg2); border:1px solid var(--border); padding:16px; margin:16px 0; font-size:11px; color:var(--text2); line-height:1.7; text-align:left; }
.info-box strong { color:var(--gold); }

.game-over-stripe { background:repeating-linear-gradient(-45deg,#0e0e0e,#0e0e0e 10px,#111 10px,#111 20px); border:1px solid var(--border2); padding:14px 18px; margin:16px 0; font-size:10px; letter-spacing:3px; text-transform:uppercase; color:var(--text3); }

.counter-badge { display:inline-block; background:var(--red); color:#fff; font-size:9px; font-family:'Bebas Neue',sans-serif; letter-spacing:1px; padding:1px 7px; border-radius:2px; margin-left:6px; }
.empty { text-align:center; padding:48px 20px; font-size:11px; color:var(--text3); letter-spacing:2px; text-transform:uppercase; }
.separator { display:flex; align-items:center; gap:12px; margin:20px 0; }
.sep-line { flex:1; height:1px; background:var(--border); }
.sep-text { font-size:9px; letter-spacing:3px; color:var(--text3); text-transform:uppercase; }
.live-dot { width:7px; height:7px; border-radius:50%; background:#0c0; box-shadow:0 0 8px #0c0; display:inline-block; margin-right:6px; animation:pdot 2s ease-in-out infinite; }
`;

export default function App() {
  const [session, setSession]   = useState(null);
  const [authTab, setAuthTab]   = useState("login");
  const [formUser, setFormUser] = useState("");
  const [formPass, setFormPass] = useState("");
  const [authErr, setAuthErr]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [players, setPlayers]   = useState([]);
  const [game, setGame]         = useState({ status: "lobby" });
  const [tab, setTab]           = useState("home");
  const [elimCode, setElimCode] = useState("");
  const [elimMsg, setElimMsg]   = useState("");
  const [elimOk, setElimOk]     = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [toast, setToast]       = useState(null);

  function flash(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2200);
  }

  const loadData = useCallback(async () => {
    const [{ data: pData }, { data: gData }] = await Promise.all([
      supabase.from("players").select("*").order("kills", { ascending: false }),
      supabase.from("game").select("*").eq("id", 1).single(),
    ]);
    if (pData) setPlayers(pData);
    if (gData) setGame(gData);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const ch = supabase.channel("live")
      .on("postgres_changes", { event: "*", schema: "public", table: "players" }, loadData)
      .on("postgres_changes", { event: "*", schema: "public", table: "game" }, loadData)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [loadData]);

  async function handleLogin() {
    setAuthErr(""); setLoading(true);
    const u = formUser.trim().toLowerCase();
    const p = formPass;
    if (!u || !p) { setAuthErr("Fill in both fields."); setLoading(false); return; }
    if (u === ADMIN.username && p === ADMIN.password) { setSession({ username: "admin", isAdmin: true }); setLoading(false); return; }
    const { data, error } = await supabase.from("players").select("*").eq("username", u).single();
    if (error || !data) { setAuthErr("Agent not found."); setLoading(false); return; }
    if (data.password !== p) { setAuthErr("Wrong password."); setLoading(false); return; }
    setSession({ username: u, isAdmin: false });
    setLoading(false);
  }

  async function handleSignup() {
    setAuthErr(""); setLoading(true);
    const u = formUser.trim().toLowerCase().replace(/\s+/g, "_");
    const p = formPass;
    if (!u || !p) { setAuthErr("Fill in both fields."); setLoading(false); return; }
    if (u === "admin") { setAuthErr("Reserved username."); setLoading(false); return; }
    if (u.length < 2) { setAuthErr("Username too short."); setLoading(false); return; }
    if (p.length < 4) { setAuthErr("Password min 4 characters."); setLoading(false); return; }
    const { data: g } = await supabase.from("game").select("status").eq("id", 1).single();
    if (g?.status !== "lobby") { setAuthErr("Game already in progress."); setLoading(false); return; }
    const { data: ex } = await supabase.from("players").select("username").eq("username", u).single();
    if (ex) { setAuthErr("Username taken."); setLoading(false); return; }
    const code = genCode();
    const { error } = await supabase.from("players").insert({ username: u, password: p, code, kills: 0, eliminated: false, target: null });
    if (error) { setAuthErr("Sign up failed. Try again."); setLoading(false); return; }
    setSession({ username: u, isAdmin: false });
    setLoading(false);
    loadData();
  }

  function logout() {
    setSession(null); setFormUser(""); setFormPass("");
    setElimCode(""); setElimMsg(""); setElimOk(false); setShowCode(false); setTab("home");
  }

  async function adminStartGame() {
    const { data: pList } = await supabase.from("players").select("username");
    if (!pList || pList.length < 3) { flash("Need at least 3 agents", "warn"); return; }
    const ids = shuffle(pList.map(p => p.username));
    for (let i = 0; i < ids.length; i++) {
      await supabase.from("players").update({ target: ids[(i + 1) % ids.length] }).eq("username", ids[i]);
    }
    await supabase.from("game").update({ status: "active", started_at: new Date().toISOString() }).eq("id", 1);
    flash("Operation deployed!"); loadData();
  }

  async function adminReset() {
    if (!confirm("Reset entire game? This cannot be undone.")) return;
    await supabase.from("players").delete().neq("username", "___");
    await supabase.from("game").update({ status: "lobby", winner: null, started_at: null }).eq("id", 1);
    flash("Game reset", "warn"); loadData();
  }

  async function adminKick(username) {
    if (!confirm(`Remove ${username}?`)) return;
    await supabase.from("players").delete().eq("username", username);
    flash(`${username} removed`, "warn"); loadData();
  }

  async function handleEliminate() {
    setElimMsg(""); setElimOk(false);
    const { data: me } = await supabase.from("players").select("*").eq("username", session.username).single();
    const { data: g }  = await supabase.from("game").select("*").eq("id", 1).single();
    if (!me) { setElimMsg("Session error."); return; }
    if (g.status !== "active") { setElimMsg("Game is not active."); return; }
    if (me.eliminated) { setElimMsg("You are eliminated."); return; }
    if (!me.target) { setElimMsg("No target assigned."); return; }
    const { data: target } = await supabase.from("players").select("*").eq("username", me.target).single();
    if (!target) { setElimMsg("Target not found."); return; }
    if (target.eliminated) { setElimMsg("Target already eliminated."); return; }
    if (elimCode.trim().toUpperCase() !== target.code) { setElimMsg("Invalid code. Wrong target or wrong code."); return; }

    await supabase.from("players").update({ eliminated: true, target: null }).eq("username", target.username);
    const nextTarget = target.target === me.username ? null : target.target;
    await supabase.from("players").update({ kills: me.kills + 1, target: nextTarget }).eq("username", me.username);

    const { data: alive } = await supabase.from("players").select("username").eq("eliminated", false);
    if (alive && alive.length === 1) {
      await supabase.from("game").update({ status: "ended", winner: alive[0].username }).eq("id", 1);
    }
    setElimCode(""); setElimOk(true);
    setElimMsg(`✓ ${displayName(target.username)} eliminated.`);
    flash(`${displayName(target.username)} eliminated!`);
    loadData();
  }

  const me         = players.find(p => p.username === session?.username);
  const myTarget   = players.find(p => p.username === me?.target);
  const aliveCount = players.filter(p => !p.eliminated).length;
  const totalCount = players.length;
  const gameActive = game.status === "active";
  const gameLobby  = game.status === "lobby";
  const gameEnded  = game.status === "ended";
  const isEliminated = me?.eliminated;

  if (!session) return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="auth-wrap">
          <svg className="logo-mark" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="46" stroke="#cc0000" strokeWidth="1"/>
            <circle cx="50" cy="50" r="32" stroke="#cc0000" strokeWidth="0.5" strokeDasharray="3 5"/>
            <circle cx="50" cy="50" r="8" stroke="#cc0000" strokeWidth="1.5"/>
            <circle cx="50" cy="50" r="2.5" fill="#cc0000"/>
            <line x1="50" y1="2" x2="50" y2="24" stroke="#cc0000" strokeWidth="1"/>
            <line x1="50" y1="76" x2="50" y2="98" stroke="#cc0000" strokeWidth="1"/>
            <line x1="2" y1="50" x2="24" y2="50" stroke="#cc0000" strokeWidth="1"/>
            <line x1="76" y1="50" x2="98" y2="50" stroke="#cc0000" strokeWidth="1"/>
          </svg>
          <div className="auth-title">SENIOR<br/>ASSASSIN</div>
          <div className="auth-sub">Class of 2026 · Classified</div>
          <div className="auth-card">
            <div className="auth-tabs">
              <button className={`auth-tab ${authTab==="login"?"active":""}`} onClick={()=>{setAuthTab("login");setAuthErr("")}}>Login</button>
              <button className={`auth-tab ${authTab==="signup"?"active":""}`} onClick={()=>{setAuthTab("signup");setAuthErr("")}}>Enroll</button>
            </div>
            {authTab === "login" ? <>
              <div className="field"><div className="field-label">Username</div>
                <input className="inp" value={formUser} onChange={e=>setFormUser(e.target.value)} placeholder="your_username" onKeyDown={e=>e.key==="Enter"&&handleLogin()} autoComplete="username"/>
              </div>
              <div className="field"><div className="field-label">Password</div>
                <input className="inp" type="password" value={formPass} onChange={e=>setFormPass(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&handleLogin()} autoComplete="current-password"/>
              </div>
              {authErr && <div className="err">{authErr}</div>}
              <button className="btn btn-primary" onClick={handleLogin} disabled={loading}>{loading?"Verifying...":"Access System"}</button>
            </> : <>
              <div className="info-box">Sign up to join. You'll get a <strong>secret 6-character code</strong> — only reveal it when you've been tagged by your assassin.</div>
              <div className="field"><div className="field-label">Choose Username</div>
                <input className="inp" value={formUser} onChange={e=>setFormUser(e.target.value)} placeholder="firstname_lastname" onKeyDown={e=>e.key==="Enter"&&handleSignup()} autoComplete="username"/>
              </div>
              <div className="field"><div className="field-label">Choose Password</div>
                <input className="inp" type="password" value={formPass} onChange={e=>setFormPass(e.target.value)} placeholder="min 4 characters" onKeyDown={e=>e.key==="Enter"&&handleSignup()} autoComplete="new-password"/>
              </div>
              {authErr && <div className="err">{authErr}</div>}
              <button className="btn btn-primary" onClick={handleSignup} disabled={loading}>{loading?"Enrolling...":"Enroll as Agent"}</button>
            </>}
          </div>
        </div>
        {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
      </div>
    </>
  );

  if (session.isAdmin) return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="header">
          <div><div className="header-title">COMMAND</div><div className="header-user">Admin Console</div></div>
          <button className="header-logout" onClick={logout}>Logout</button>
        </div>
        <div className="admin-banner"><span className="live-dot"/>Admin — Full Access</div>
        <div className="page">
          <div className="section-label">Operation Status</div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,flexWrap:"wrap"}}>
            <span className={`status-pill ${gameLobby?"pill-lobby":gameActive?"pill-alive":"pill-dead"}`}>
              {gameLobby?"Lobby":gameActive?"Active":"Ended"}
            </span>
            <span style={{fontSize:11,color:"var(--text3)",letterSpacing:1}}>{totalCount} enrolled · {aliveCount} alive</span>
          </div>
          {gameLobby && <button className="btn btn-gold" onClick={adminStartGame} disabled={totalCount<3} style={{marginBottom:12}}>▶ Deploy Operation ({totalCount}/3+ agents)</button>}
          {gameEnded && <div className="game-over-stripe">Operation Concluded · Winner: {displayName(game.winner)||"None"}</div>}
          <hr className="divider"/>
          <div className="section-label">Enrolled Agents <span className="counter-badge">{totalCount}</span></div>
          {players.length === 0 && <div className="empty">No agents enrolled yet</div>}
          {[...players].sort((a,b)=>new Date(a.joined_at)-new Date(b.joined_at)).map(p=>(
            <div key={p.username} className={`player-row ${p.eliminated?"elim":""}`}>
              <div className={`player-dot ${p.eliminated?"dot-dead":"dot-alive"}`}/>
              <div style={{flex:1}}>
                <div className="player-row-name">{displayName(p.username)}</div>
                {gameActive&&!p.eliminated&&<div className="player-row-target">→ {displayName(p.target)}</div>}
              </div>
              <div style={{textAlign:"right"}}>
                <div className="player-row-kills">{p.kills} kill{p.kills!==1?"s":""}</div>
                {p.eliminated&&<div style={{fontSize:9,letterSpacing:2,color:"var(--red)",textTransform:"uppercase"}}>out</div>}
              </div>
              {gameLobby&&<button className="btn btn-outline btn-sm" style={{marginLeft:8,width:"auto",padding:"6px 12px"}} onClick={()=>adminKick(p.username)}>✕</button>}
            </div>
          ))}
          <hr className="divider"/>
          <button className="btn btn-outline btn-sm" style={{width:"auto",color:"var(--red)",borderColor:"#300"}} onClick={adminReset}>⚠ Reset Entire Game</button>
        </div>
      </div>
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="header">
          <div><div className="header-title">DOSSIER</div><div className="header-user">{displayName(session.username)}</div></div>
          <button className="header-logout" onClick={logout}>Logout</button>
        </div>
        <div className="nav">
          <button className={`nav-tab ${tab==="home"?"active":""}`} onClick={()=>setTab("home")}>Home</button>
          <button className={`nav-tab ${tab==="eliminate"?"active":""}`} onClick={()=>setTab("eliminate")}>Eliminate</button>
          <button className={`nav-tab ${tab==="board"?"active":""}`} onClick={()=>setTab("board")}>Board</button>
        </div>

        {tab==="home"&&<div className="page">
          {gameLobby&&<div className="lobby-wrap">
            <div className="lobby-icon">⏳</div>
            <div className="lobby-title">Awaiting Deployment</div>
            <div className="lobby-desc">You're enrolled. The admin will start once everyone has signed up.</div>
            <div className="info-box" style={{marginTop:20}}><strong>{totalCount} agent{totalCount!==1?"s":""}</strong> enrolled and waiting.</div>
          </div>}
          {(gameActive||gameEnded)&&me&&<>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
              <span className={`status-pill ${isEliminated?"pill-dead":"pill-alive"}`}>{isEliminated?"Eliminated":"Active"}</span>
              <span style={{fontSize:10,color:"var(--text3)",letterSpacing:1}}>{aliveCount}/{totalCount} alive</span>
              <span className="live-dot" style={{marginLeft:"auto"}}/>
            </div>
            {gameEnded&&<div className="winner-wrap">
              <div className="winner-trophy">🏆</div>
              <div className="winner-title">GAME OVER</div>
              <div className="winner-name">{displayName(game.winner)}</div>
              <div className="winner-stat">{game.winner===session.username?"You win! 🎉":`${players.find(p=>p.username===game.winner)?.kills||0} eliminations`}</div>
            </div>}
            {!gameEnded&&!isEliminated&&<>
              <div className="section-label">Your Target</div>
              <div className="target-card">
                <div className="target-card-label">Assigned Target</div>
                <div className="target-card-name">{myTarget?displayName(me.target):"—"}</div>
                <div className="target-card-sub">{myTarget?"Locate · Tag · Report":"No target"}</div>
              </div>
            </>}
            {isEliminated&&!gameEnded&&<div className="game-over-stripe" style={{marginTop:16}}>You have been eliminated. Watch the leaderboard.</div>}
            <div className="stat-row">
              <div className="stat-cell"><div className="stat-num">{me.kills||0}</div><div className="stat-lab">Your Kills</div></div>
              <div className="stat-cell"><div className="stat-num">{aliveCount}</div><div className="stat-lab">Alive</div></div>
            </div>
            <div className="section-label" style={{marginTop:24}}>Your Elimination Code</div>
            <div className="code-display-box">
              <div className="code-display-label">Secret Code — only reveal when tagged</div>
              <div className={`code-display ${showCode?"":"hidden"}`}>{me.code}</div>
              <div><button className="show-code-btn" onClick={()=>setShowCode(v=>!v)}>{showCode?"Hide Code":"Reveal Code"}</button></div>
              <div className="code-warning">When tagged with a water gun, reveal this code to your assassin so they can log the kill.</div>
            </div>
          </>}
        </div>}

        {tab==="eliminate"&&<div className="page">
          {(!gameActive||isEliminated)?<div className="empty">{isEliminated?"You are eliminated.":"Game is not active."}</div>:<>
            <div className="section-label">Report Elimination</div>
            <div className="info-box" style={{marginBottom:20}}>After tagging your target, ask them to open their app and reveal their <strong>secret code</strong>. Enter it below.</div>
            <div className="field">
              <div className="field-label">Target's Secret Code</div>
              <input className="inp inp-code" maxLength={6} value={elimCode} onChange={e=>{setElimCode(e.target.value.toUpperCase());setElimMsg("");setElimOk(false);}} placeholder="XXXXXX" onKeyDown={e=>e.key==="Enter"&&elimCode.length===6&&handleEliminate()}/>
            </div>
            {elimMsg&&<div className="err" style={{color:elimOk?"#0a0":"var(--red)"}}>{elimMsg}</div>}
            <button className="btn btn-danger" onClick={handleEliminate} disabled={elimCode.length<6} style={{marginTop:8}}>Confirm Elimination</button>
            <div className="separator"><div className="sep-line"/><div className="sep-text">Your Target</div><div className="sep-line"/></div>
            <div style={{fontSize:10,color:"var(--text3)",letterSpacing:1}}>Currently assigned to:</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,letterSpacing:3,color:"var(--red)",marginTop:4}}>{me?.target?displayName(me.target):"—"}</div>
          </>}
        </div>}

        {tab==="board"&&<>
          <div style={{padding:"12px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div className="section-label" style={{margin:0}}>Kill Board</div>
            <span className="live-dot"/>
          </div>
          <div className="lb-header">
            <span style={{width:28,textAlign:"center"}}>#</span>
            <span style={{flex:1,marginLeft:14}}>Agent</span>
            <span>Kills</span>
          </div>
          {players.length===0&&<div className="empty">No agents enrolled</div>}
          {players.map((p,i)=>{
            const pc=i===0&&!p.eliminated?"gold":i===1?"silver":i===2?"bronze":"";
            return <div key={p.username} className={`lb-row ${p.eliminated?"elim":""} ${p.username===session.username?"me":""}`}>
              <div className={`lb-pos ${pc}`}>{i===0&&!p.eliminated?"★":(i+1)}</div>
              <div style={{flex:1}}>
                <div className="lb-name">{displayName(p.username)}{p.username===session.username&&<span className="lb-name-you">You</span>}</div>
                <span className={`status-pill ${p.eliminated?"pill-dead":"pill-alive"}`} style={{fontSize:"7px",padding:"2px 7px",marginTop:3,display:"inline-block"}}>{p.eliminated?"OUT":"ALIVE"}</span>
              </div>
              <div><div className="lb-kills">{p.kills||0}</div><div className="lb-kills-lab">kills</div></div>
            </div>;
          })}
        </>}
      </div>
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </>
  );
}