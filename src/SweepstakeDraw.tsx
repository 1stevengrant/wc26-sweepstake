import {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
  type CSSProperties,
} from "react";

// --- Types ---
type GroupLetter =
  | "A" | "B" | "C" | "D" | "E" | "F"
  | "G" | "H" | "I" | "J" | "K" | "L";

interface Team {
  name: string;
  group: GroupLetter;
  rank: number;
  flag: string;
}

interface PlayerEntry {
  name: string;
  entries: number;
}

interface DrawPick {
  team: Team;
  playerIndex: number;
}

interface DrawSequence {
  picks: Array<DrawPick>;
  undrawn: Array<Team>;
}

interface PlayerBucket {
  player: string;
  entries: number;
  teams: Array<Team>;
}

interface DrawRecord {
  id: string;
  seed: number;
  players: Array<PlayerEntry>;
  fee: string;
  currency: string;
  createdAt: number;
  label: string | null;
}

// --- Tournament data (from the team sheet) ---
const TEAMS: Array<Team> = [
  { name: "Algeria", group: "J", rank: 28, flag: "🇩🇿" },
  { name: "Argentina", group: "J", rank: 3, flag: "🇦🇷" },
  { name: "Australia", group: "D", rank: 27, flag: "🇦🇺" },
  { name: "Austria", group: "J", rank: 24, flag: "🇦🇹" },
  { name: "Belgium", group: "G", rank: 9, flag: "🇧🇪" },
  { name: "Bosnia-Herzegovina", group: "B", rank: 65, flag: "🇧🇦" },
  { name: "Brazil", group: "C", rank: 6, flag: "🇧🇷" },
  { name: "Cabo Verde", group: "H", rank: 69, flag: "🇨🇻" },
  { name: "Canada", group: "B", rank: 30, flag: "🇨🇦" },
  { name: "Colombia", group: "K", rank: 13, flag: "🇨🇴" },
  { name: "Congo DR", group: "K", rank: 46, flag: "🇨🇩" },
  { name: "Côte d'Ivoire", group: "E", rank: 34, flag: "🇨🇮" },
  { name: "Croatia", group: "L", rank: 11, flag: "🇭🇷" },
  { name: "Curaçao", group: "E", rank: 82, flag: "🇨🇼" },
  { name: "Czechia", group: "A", rank: 41, flag: "🇨🇿" },
  { name: "Ecuador", group: "E", rank: 23, flag: "🇪🇨" },
  { name: "Egypt", group: "G", rank: 29, flag: "🇪🇬" },
  { name: "England", group: "L", rank: 4, flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { name: "France", group: "I", rank: 1, flag: "🇫🇷" },
  { name: "Germany", group: "E", rank: 10, flag: "🇩🇪" },
  { name: "Ghana", group: "L", rank: 74, flag: "🇬🇭" },
  { name: "Haiti", group: "C", rank: 83, flag: "🇭🇹" },
  { name: "IR Iran", group: "G", rank: 21, flag: "🇮🇷" },
  { name: "Iraq", group: "I", rank: 57, flag: "🇮🇶" },
  { name: "Japan", group: "F", rank: 18, flag: "🇯🇵" },
  { name: "Jordan", group: "J", rank: 63, flag: "🇯🇴" },
  { name: "Korea Republic", group: "A", rank: 25, flag: "🇰🇷" },
  { name: "Mexico", group: "A", rank: 15, flag: "🇲🇽" },
  { name: "Morocco", group: "C", rank: 8, flag: "🇲🇦" },
  { name: "Netherlands", group: "F", rank: 7, flag: "🇳🇱" },
  { name: "New Zealand", group: "G", rank: 85, flag: "🇳🇿" },
  { name: "Norway", group: "I", rank: 31, flag: "🇳🇴" },
  { name: "Panama", group: "L", rank: 33, flag: "🇵🇦" },
  { name: "Paraguay", group: "D", rank: 40, flag: "🇵🇾" },
  { name: "Portugal", group: "K", rank: 5, flag: "🇵🇹" },
  { name: "Qatar", group: "B", rank: 55, flag: "🇶🇦" },
  { name: "Saudi Arabia", group: "H", rank: 61, flag: "🇸🇦" },
  { name: "Scotland", group: "C", rank: 43, flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  { name: "Senegal", group: "I", rank: 14, flag: "🇸🇳" },
  { name: "South Africa", group: "A", rank: 60, flag: "🇿🇦" },
  { name: "Spain", group: "H", rank: 2, flag: "🇪🇸" },
  { name: "Sweden", group: "F", rank: 38, flag: "🇸🇪" },
  { name: "Switzerland", group: "B", rank: 19, flag: "🇨🇭" },
  { name: "Tunisia", group: "F", rank: 44, flag: "🇹🇳" },
  { name: "Türkiye", group: "D", rank: 22, flag: "🇹🇷" },
  { name: "Uruguay", group: "H", rank: 17, flag: "🇺🇾" },
  { name: "USA", group: "D", rank: 16, flag: "🇺🇸" },
  { name: "Uzbekistan", group: "K", rank: 50, flag: "🇺🇿" },
];

const PALETTE = {
  field: "#0b2e24",
  fieldDeep: "#072019",
  card: "#0f3a2d",
  cardSoft: "#10402f",
  line: "#eaf6ef",
  muted: "rgba(234,246,239,0.58)",
  faint: "rgba(234,246,239,0.12)",
  gold: "#e8c468",
  grass: "#4cd08a",
} as const;

// --- Entrants (from the team sheet) — 48 entries across 26 players ---
const ROSTER: Array<PlayerEntry> = [
  { name: "Liam", entries: 2 },
  { name: "Mikey", entries: 2 },
  { name: "Mikey's Boy", entries: 2 },
  { name: "Luke B", entries: 1 },
  { name: "Tony Don", entries: 2 },
  { name: "Lloyd", entries: 2 },
  { name: "Ants", entries: 2 },
  { name: "Dale", entries: 1 },
  { name: "Hollins", entries: 2 },
  { name: "Steven", entries: 2 },
  { name: "Levi", entries: 2 },
  { name: "Levi's Auntie", entries: 2 },
  { name: "Scotty", entries: 2 },
  { name: "Phil", entries: 2 },
  { name: "Neil", entries: 4 },
  { name: "Walshy", entries: 2 },
  { name: "Kenty", entries: 2 },
  { name: "Ben J", entries: 2 },
  { name: "Bully", entries: 1 },
  { name: "Cian", entries: 2 },
  { name: "Ben Lund", entries: 1 },
  { name: "Ben Shirley", entries: 3 },
  { name: "Tommy", entries: 1 },
  { name: "Tony Rid", entries: 2 },
  { name: "Franz", entries: 1 },
  { name: "Social Team", entries: 1 },
];

const CURRENCIES: Array<string> = ["£", "$", "€", "NZ$"];
const PLAYBACK_SPEEDS: Array<number> = [0.5, 1, 2];
const STORAGE_PREFIX = "wc26-draw:";
const MAX_ENTRIES_PER_PLAYER = 8;

const GROUP_COLOURS: Record<GroupLetter, string> = {
  A: "#4cd08a", B: "#56b6c2", C: "#e8c468", D: "#e08a5b",
  E: "#c98ad0", F: "#8a9fe0", G: "#d05b7a", H: "#7ad0a0",
  I: "#d0b85b", J: "#8ad0c4", K: "#b0a0e0", L: "#e0a05b",
};

// --- Deterministic draw (reproducible from a seed) ---
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return function next(): number {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<Item>(input: ReadonlyArray<Item>, rand: () => number): Array<Item> {
  const result = [...input];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function totalEntriesOf(players: ReadonlyArray<PlayerEntry>): number {
  return players.reduce((sum, player) => sum + player.entries, 0);
}

// Each entry is one slot. We draw `min(totalEntries, 48)` teams; surplus
// nations stay in the hat (undrawn). Deterministic from the seed.
function buildSequence(players: Array<PlayerEntry>, seed: number): DrawSequence {
  const rand = mulberry32(seed);
  const deck = shuffle(TEAMS, rand);

  const slots: Array<number> = [];
  players.forEach((player, index) => {
    for (let i = 0; i < player.entries; i++) slots.push(index);
  });
  const dealSlots = shuffle(slots, rand);

  const teamsToDraw = Math.min(dealSlots.length, deck.length);
  const picks: Array<DrawPick> = [];
  for (let i = 0; i < teamsToDraw; i++) {
    picks.push({ team: deck[i], playerIndex: dealSlots[i] });
  }
  return { picks, undrawn: deck.slice(teamsToDraw) };
}

// --- localStorage persistence ---
function normalise(record: unknown): DrawRecord | null {
  if (typeof record !== "object" || record === null) return null;
  const value = record as Record<string, unknown>;
  const rawPlayers = Array.isArray(value.players) ? value.players : [];
  const players: Array<PlayerEntry> = rawPlayers.map((entry) =>
    typeof entry === "string"
      ? { name: entry, entries: 1 }
      : {
          name: String((entry as PlayerEntry).name ?? ""),
          entries: Math.max(1, Number((entry as PlayerEntry).entries ?? 1)),
        }
  );
  return {
    id: String(value.id ?? ""),
    seed: Number(value.seed ?? 0),
    players,
    fee: String(value.fee ?? ""),
    currency: String(value.currency ?? "£"),
    createdAt: Number(value.createdAt ?? Date.now()),
    label: value.label == null ? null : String(value.label),
  };
}

function listDraws(): Array<DrawRecord> {
  const records: Array<DrawRecord> = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(STORAGE_PREFIX)) continue;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = normalise(JSON.parse(raw));
      if (parsed) records.push(parsed);
    } catch {
      /* skip malformed entries */
    }
  }
  return records.sort((a, b) => b.createdAt - a.createdAt);
}

function persistDraw(record: DrawRecord): void {
  localStorage.setItem(STORAGE_PREFIX + record.id, JSON.stringify(record));
}

function removeDraw(id: string): void {
  localStorage.removeItem(STORAGE_PREFIX + id);
}

// --- Shareable links (the whole draw lives in the URL, no backend) ---
const SHARE_PREFIX = "#/d/";

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function encodeDraw(record: DrawRecord): string {
  const payload = {
    s: record.seed,
    p: record.players.map((player) => [player.name, player.entries]),
    f: record.fee,
    c: record.currency,
    l: record.label,
  };
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  return base64UrlEncode(bytes);
}

function decodeDraw(encoded: string): DrawRecord | null {
  try {
    const json = new TextDecoder().decode(base64UrlDecode(encoded));
    const payload = JSON.parse(json) as Record<string, unknown>;
    const rawPlayers = Array.isArray(payload.p) ? payload.p : [];
    const players: Array<PlayerEntry> = rawPlayers.map((entry) => {
      const [name, entries] = entry as [unknown, unknown];
      return {
        name: String(name ?? ""),
        entries: Math.max(1, Number(entries ?? 1)),
      };
    });
    if (players.length === 0) return null;
    return {
      id: "shared",
      seed: Number(payload.s ?? 0) >>> 0,
      players,
      fee: String(payload.f ?? ""),
      currency: String(payload.c ?? "£"),
      createdAt: Date.now(),
      label: payload.l == null ? null : String(payload.l),
    };
  } catch {
    return null;
  }
}

function shareLinkFor(record: DrawRecord): string {
  return `${window.location.origin}${window.location.pathname}${SHARE_PREFIX}${encodeDraw(record)}`;
}

function readSharedDraw(): DrawRecord | null {
  const hash = window.location.hash;
  if (!hash.startsWith(SHARE_PREFIX)) return null;
  return decodeDraw(hash.slice(SHARE_PREFIX.length));
}

export function SweepstakeDraw() {
  const [players, setPlayers] = useState<Array<PlayerEntry>>(() =>
    ROSTER.map((player) => ({ ...player }))
  );
  const [nameInput, setNameInput] = useState<string>("");
  const [fee, setFee] = useState<string>("");
  const [currency, setCurrency] = useState<string>("£");

  const [draw, setDraw] = useState<DrawRecord | null>(null);
  const [revealIndex, setRevealIndex] = useState<number>(0);
  const [playing, setPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);

  const [saved, setSaved] = useState<Array<DrawRecord>>([]);
  const [storageOk, setStorageOk] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [linkCopied, setLinkCopied] = useState<boolean>(false);
  const timer = useRef<number | null>(null);

  const refreshSaved = useCallback((): void => {
    try {
      setSaved(listDraws());
    } catch {
      setStorageOk(false);
    }
  }, []);

  useEffect(() => {
    refreshSaved();
  }, [refreshSaved]);

  // A shared link (#/d/...) opens straight into that draw and replays it.
  useEffect(() => {
    const shared = readSharedDraw();
    if (!shared) return;
    setDraw(shared);
    setPlayers(shared.players.map((player) => ({ ...player })));
    setFee(shared.fee || "");
    setCurrency(shared.currency || "£");
    setRevealIndex(0);
    setPlaying(true);
  }, []);

  const sequence: DrawSequence = useMemo(
    () => (draw ? buildSequence(draw.players, draw.seed) : { picks: [], undrawn: [] }),
    [draw]
  );
  const total = sequence.picks.length;
  const finished = draw !== null && revealIndex >= total;

  const buckets: Array<PlayerBucket> = useMemo(() => {
    if (!draw) return [];
    const out: Array<PlayerBucket> = draw.players.map((player) => ({
      player: player.name,
      entries: player.entries,
      teams: [],
    }));
    for (let i = 0; i < revealIndex && i < total; i++) {
      out[sequence.picks[i].playerIndex].teams.push(sequence.picks[i].team);
    }
    return out;
  }, [draw, sequence, revealIndex, total]);

  const currentPick: DrawPick | null =
    revealIndex > 0 ? sequence.picks[revealIndex - 1] : null;

  useEffect(() => {
    if (!playing) return;
    if (revealIndex >= total) {
      setPlaying(false);
      return;
    }
    timer.current = window.setTimeout(() => {
      setRevealIndex((index) => Math.min(index + 1, total));
    }, 620 / speed);
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, [playing, revealIndex, total, speed]);

  const totalEntries = totalEntriesOf(players);
  const teamsInPlay = Math.min(totalEntries, TEAMS.length);
  const heldBack = Math.max(0, TEAMS.length - totalEntries);
  const overSubscribed = totalEntries > TEAMS.length;

  const pot: number | null = useMemo(() => {
    const value = parseFloat(fee);
    if (!isFinite(value) || value <= 0 || totalEntries === 0) return null;
    return value * totalEntries;
  }, [fee, totalEntries]);

  function addPlayer(): void {
    const name = nameInput.trim();
    if (!name) return;
    if (players.some((player) => player.name.toLowerCase() === name.toLowerCase())) {
      setNameInput("");
      return;
    }
    setPlayers((prev) => [...prev, { name, entries: 1 }]);
    setNameInput("");
  }

  const removePlayer = (name: string): void =>
    setPlayers((prev) => prev.filter((player) => player.name !== name));

  function adjustEntries(name: string, delta: number): void {
    setPlayers((prev) =>
      prev.map((player) =>
        player.name === name
          ? {
              ...player,
              entries: Math.min(
                MAX_ENTRIES_PER_PLAYER,
                Math.max(1, player.entries + delta)
              ),
            }
          : player
      )
    );
  }

  function startDraw(): void {
    if (players.length === 0) return;
    const seed = (Math.random() * 0x100000000) >>> 0;
    setDraw({
      id: Date.now().toString(36),
      seed,
      players: players.map((player) => ({ ...player })),
      fee,
      currency,
      createdAt: Date.now(),
      label: null,
    });
    setRevealIndex(0);
    setPlaying(true);
    setCopied(false);
  }

  function exitDraw(): void {
    setPlaying(false);
    setDraw(null);
    setRevealIndex(0);
  }

  function saveRecording(): void {
    if (!draw || !storageOk) return;
    const label = window.prompt(
      "Name this draw",
      new Date(draw.createdAt).toLocaleString()
    );
    if (label === null) return;
    const record: DrawRecord = { ...draw, label: label.trim() || null };
    try {
      persistDraw(record);
      setDraw(record);
      refreshSaved();
    } catch {
      setStorageOk(false);
    }
  }

  function replaySaved(record: DrawRecord): void {
    setDraw(record);
    setPlayers(record.players.map((player) => ({ ...player })));
    setFee(record.fee || "");
    setCurrency(record.currency || "£");
    setRevealIndex(0);
    setPlaying(true);
  }

  function deleteSaved(id: string): void {
    try {
      removeDraw(id);
      refreshSaved();
    } catch {
      setStorageOk(false);
    }
  }

  function copyShareLink(): void {
    if (!draw) return;
    const link = shareLinkFor(draw);
    navigator.clipboard?.writeText(link).then(
      () => {
        setLinkCopied(true);
        window.setTimeout(() => setLinkCopied(false), 2000);
      },
      () => {}
    );
  }

  function copyResults(): void {
    if (!draw) return;
    const full = buildSequence(draw.players, draw.seed);
    const byPlayer = draw.players.map((player, index) => ({
      name: player.name,
      teams: full.picks
        .filter((pick) => pick.playerIndex === index)
        .map((pick) => pick.team)
        .sort((a, b) => a.rank - b.rank),
    }));
    const lines: Array<string> = [
      "World Cup 2026 Sweepstake — winner takes all",
      pot ? `Pot: ${draw.currency}${pot.toLocaleString()}` : "",
      `Seed: ${draw.seed} (reproducible)`,
      "",
      ...byPlayer.map(
        (entry) =>
          `${entry.name}: ${entry.teams
            .map((team) => `${team.name} (${team.group}, #${team.rank})`)
            .join(", ")}`
      ),
      full.undrawn.length
        ? `\nNot drawn: ${full.undrawn.map((team) => team.name).join(", ")}`
        : "",
    ].filter(Boolean);
    navigator.clipboard?.writeText(lines.join("\n")).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      },
      () => {}
    );
  }

  const controlStyle: CSSProperties = {
    background: PALETTE.fieldDeep,
    border: `1px solid ${PALETTE.faint}`,
    color: PALETTE.line,
  };
  const stepperStyle: CSSProperties = {
    background: PALETTE.fieldDeep,
    border: `1px solid ${PALETTE.faint}`,
    color: PALETTE.line,
  };

  return (
    <div
      className="min-h-screen w-full px-4 py-8 sm:px-8"
      style={{
        background: `radial-gradient(120% 90% at 50% -10%, ${PALETTE.field} 0%, ${PALETTE.fieldDeep} 70%)`,
        color: PALETTE.line,
        fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif",
      }}
    >
      <style>{`
        .disp { font-family: 'Oswald','Inter',sans-serif; letter-spacing: 0.01em; }
        @keyframes pop { from { opacity:0; transform: scale(0.8) translateY(8px);} to { opacity:1; transform:none;} }
        @keyframes slot { from { opacity:0; transform: translateX(-10px);} to { opacity:1; transform:none;} }
        .pop { animation: pop 0.4s cubic-bezier(0.2,0.8,0.2,1.1) both; }
        .slot { animation: slot 0.35s ease both; }
        @media (prefers-reduced-motion: reduce){ .pop,.slot{ animation: none; } }
        input::placeholder { color: ${PALETTE.muted}; }
      `}</style>

      <div className="mx-auto max-w-5xl">
        <header className="mb-7 border-b pb-6" style={{ borderColor: PALETTE.faint }}>
          <p className="disp text-xs uppercase tracking-[0.35em] mb-2" style={{ color: PALETTE.gold }}>
            The Draw · 48 Nations
          </p>
          <h1 className="disp text-4xl sm:text-6xl font-bold uppercase leading-none">
            World Cup 2026
            <br />
            <span style={{ color: PALETTE.gold }}>Sweepstake</span>
          </h1>
          <p className="mt-3 text-sm" style={{ color: PALETTE.muted }}>
            Pure random · winner takes all · one team per entry, recorded and replayable.
          </p>
        </header>

        {!draw && (
          <>
            <section className="rounded-2xl p-5 sm:p-6 mb-6" style={{ background: PALETTE.card, border: `1px solid ${PALETTE.faint}` }}>
              <h2 className="disp text-sm uppercase tracking-[0.2em] mb-3" style={{ color: PALETTE.gold }}>How the draw works</h2>
              <ul className="space-y-1.5 text-sm" style={{ color: PALETTE.muted }}>
                <li>It's like pulling names out of a hat. Every team goes in one hat; every player's name goes in another, once for each team they paid for.</li>
                <li>The computer shuffles both and matches them up — one team, one name — until they're all gone.</li>
                <li>A <span style={{ color: PALETTE.line }}>seed</span> number controls the shuffle. The same number always gives the same result, so it's shown as proof nobody fiddled it.</li>
                <li>Good teams aren't more likely to go to anyone. The badges (group &amp; ranking) are just info — they don't change anything.</li>
                <li>The play/pause controls are just a replay. The teams were decided the moment you pressed start.</li>
              </ul>
            </section>

            <section className="relative rounded-2xl p-5 sm:p-6 mb-6" style={{ background: PALETTE.card, border: `1px solid ${PALETTE.faint}` }}>
              <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
                <div>
                  <label className="disp block text-xs uppercase tracking-[0.2em] mb-2" style={{ color: PALETTE.muted }}>Players &amp; entries</label>
                  <div className="flex gap-2">
                    <input
                      value={nameInput}
                      onChange={(event) => setNameInput(event.target.value)}
                      onKeyDown={(event) => event.key === "Enter" && addPlayer()}
                      placeholder="Add a name, press Enter"
                      className="flex-1 rounded-lg px-3 py-2.5 text-sm outline-none"
                      style={controlStyle}
                    />
                    <button onClick={addPlayer} className="disp rounded-lg px-4 py-2.5 text-sm font-semibold uppercase tracking-wide" style={{ background: PALETTE.grass, color: PALETTE.fieldDeep }}>Add</button>
                  </div>

                  <div className="mt-3 space-y-2">
                    {players.length === 0 && (
                      <p className="text-sm" style={{ color: PALETTE.muted }}>No players yet. Everyone gets one team unless they've paid for more.</p>
                    )}
                    {players.map((player) => (
                      <div key={player.name} className="flex items-center gap-3 rounded-lg px-3 py-2" style={{ background: PALETTE.cardSoft, border: `1px solid ${PALETTE.faint}` }}>
                        <span className="flex-1 truncate text-sm font-medium">{player.name}</span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => adjustEntries(player.name, -1)} disabled={player.entries <= 1} aria-label={`Fewer teams for ${player.name}`} className="grid h-7 w-7 place-items-center rounded text-base leading-none" style={{ ...stepperStyle, opacity: player.entries <= 1 ? 0.4 : 1 }}>−</button>
                          <span className="disp w-6 text-center text-sm font-semibold" title="Teams paid for">{player.entries}</span>
                          <button onClick={() => adjustEntries(player.name, 1)} disabled={player.entries >= MAX_ENTRIES_PER_PLAYER} aria-label={`More teams for ${player.name}`} className="grid h-7 w-7 place-items-center rounded text-base leading-none" style={{ ...stepperStyle, opacity: player.entries >= MAX_ENTRIES_PER_PLAYER ? 0.4 : 1 }}>+</button>
                        </div>
                        <button onClick={() => removePlayer(player.name)} aria-label={`Remove ${player.name}`} className="grid h-6 w-6 place-items-center rounded-full text-xs" style={{ background: PALETTE.fieldDeep, color: PALETTE.muted }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="disp block text-xs uppercase tracking-[0.2em] mb-2" style={{ color: PALETTE.muted }}>Pot (optional)</label>
                  <div className="flex gap-2">
                    <select value={currency} onChange={(event) => setCurrency(event.target.value)} className="rounded-lg px-2 py-2.5 text-sm outline-none" style={controlStyle}>
                      {CURRENCIES.map((symbol) => <option key={symbol} value={symbol}>{symbol}</option>)}
                    </select>
                    <input value={fee} onChange={(event) => setFee(event.target.value)} inputMode="decimal" placeholder="Fee per entry" className="w-full rounded-lg px-3 py-2.5 text-sm outline-none" style={controlStyle} />
                  </div>
                  <div className="mt-3 rounded-lg px-3 py-2.5 text-sm" style={controlStyle}>
                    {pot ? (
                      <span>Pot: <span className="disp font-semibold" style={{ color: PALETTE.gold }}>{currency}{pot.toLocaleString()}</span> ({totalEntries} entries) to the winner.</span>
                    ) : (
                      <span style={{ color: PALETTE.muted }}>Set a per-entry fee to show the prize pot.</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: PALETTE.faint }}>
                <p className="text-sm" style={{ color: overSubscribed ? PALETTE.gold : PALETTE.muted }}>
                  {players.length === 0
                    ? "48 teams ready to draw."
                    : overSubscribed
                    ? `${totalEntries} entries but only 48 teams — ${totalEntries - TEAMS.length} entr${totalEntries - TEAMS.length === 1 ? "y" : "ies"} won't be filled.`
                    : `${players.length} player${players.length === 1 ? "" : "s"} · ${totalEntries} entr${totalEntries === 1 ? "y" : "ies"} → ${teamsInPlay} team${teamsInPlay === 1 ? "" : "s"} in play${heldBack ? `, ${heldBack} held back` : ""}.`}
                </p>
                <button onClick={startDraw} disabled={players.length === 0} className="disp rounded-lg px-6 py-2.5 text-sm font-bold uppercase tracking-wide" style={{ background: players.length === 0 ? PALETTE.faint : PALETTE.gold, color: players.length === 0 ? PALETTE.muted : PALETTE.fieldDeep, cursor: players.length === 0 ? "not-allowed" : "pointer" }}>Start the draw</button>
              </div>
            </section>

            <section className="rounded-2xl p-5 sm:p-6" style={{ background: PALETTE.card, border: `1px solid ${PALETTE.faint}` }}>
              <h2 className="disp text-sm uppercase tracking-[0.2em] mb-3" style={{ color: PALETTE.gold }}>Recorded draws</h2>
              {!storageOk ? (
                <p className="text-sm" style={{ color: PALETTE.muted }}>Storage unavailable in this browser — draws won't persist.</p>
              ) : saved.length === 0 ? (
                <p className="text-sm" style={{ color: PALETTE.muted }}>None saved yet. Run a draw, then hit “Save recording”.</p>
              ) : (
                <ul className="space-y-2">
                  {saved.map((record) => (
                    <li key={record.id} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm" style={{ background: PALETTE.fieldDeep }}>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{record.label || new Date(record.createdAt).toLocaleString()}</p>
                        <p className="truncate text-xs" style={{ color: PALETTE.muted }}>{record.players.length} players · {totalEntriesOf(record.players)} entries · seed {record.seed}</p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button onClick={() => replaySaved(record)} className="disp rounded px-3 py-1.5 text-xs font-semibold uppercase" style={{ background: PALETTE.grass, color: PALETTE.fieldDeep }}>Replay</button>
                        <button onClick={() => deleteSaved(record.id)} className="rounded px-2.5 py-1.5 text-xs" style={{ background: PALETTE.cardSoft, color: PALETTE.muted }}>Delete</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        {draw && (
          <section>
            <div className="rounded-2xl p-5 sm:p-6 mb-4" style={{ background: PALETTE.card, border: `1px solid ${PALETTE.faint}` }}>
              <div className="flex items-center justify-between mb-4">
                <span className="disp text-xs uppercase tracking-[0.25em]" style={{ color: PALETTE.muted }}>Pick {Math.min(revealIndex, total)} / {total}</span>
                <span className="text-xs" style={{ color: PALETTE.muted }}>seed {draw.seed}</span>
              </div>

              <div className="grid place-items-center py-4 text-center" style={{ minHeight: 150 }}>
                {currentPick ? (
                  <div key={revealIndex} className="pop">
                    <div className="text-6xl leading-none mb-2">{currentPick.team.flag}</div>
                    <div className="disp text-3xl font-bold uppercase">{currentPick.team.name}</div>
                    <div className="mt-1 text-sm" style={{ color: PALETTE.muted }}>Group {currentPick.team.group} · #{currentPick.team.rank}</div>
                    <div className="disp mt-3 text-lg" style={{ color: PALETTE.gold }}>→ {draw.players[currentPick.playerIndex].name}</div>
                  </div>
                ) : (
                  <p className="disp text-xl uppercase" style={{ color: PALETTE.muted }}>Ready — press play</p>
                )}
              </div>

              <input
                type="range"
                min={0}
                max={total}
                value={revealIndex}
                onChange={(event) => {
                  setPlaying(false);
                  setRevealIndex(Number(event.target.value));
                }}
                className="w-full"
                style={{ accentColor: PALETTE.gold }}
              />

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <button onClick={() => { setPlaying(false); setRevealIndex(0); }} className="rounded-lg px-3 py-2 text-sm" style={controlStyle}>⟲ Restart</button>
                <button onClick={() => { setPlaying(false); setRevealIndex((index) => Math.max(0, index - 1)); }} className="rounded-lg px-3 py-2 text-sm" style={controlStyle}>‹ Back</button>
                <button onClick={() => { if (finished) setRevealIndex(0); setPlaying((value) => !value); }} className="disp rounded-lg px-6 py-2 text-sm font-bold uppercase" style={{ background: PALETTE.gold, color: PALETTE.fieldDeep }}>{playing ? "Pause" : finished ? "Replay" : "Play"}</button>
                <button onClick={() => { setPlaying(false); setRevealIndex((index) => Math.min(total, index + 1)); }} className="rounded-lg px-3 py-2 text-sm" style={controlStyle}>Next ›</button>
                <button onClick={() => { setPlaying(false); setRevealIndex(total); }} className="rounded-lg px-3 py-2 text-sm" style={controlStyle}>Skip »</button>
                <div className="flex overflow-hidden rounded-lg" style={{ border: `1px solid ${PALETTE.faint}` }}>
                  {PLAYBACK_SPEEDS.map((value) => (
                    <button key={value} onClick={() => setSpeed(value)} className="px-3 py-2 text-sm" style={{ background: speed === value ? PALETTE.grass : PALETTE.fieldDeep, color: speed === value ? PALETTE.fieldDeep : PALETTE.muted }}>{value}×</button>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4" style={{ borderColor: PALETTE.faint }}>
                <button onClick={exitDraw} className="text-sm underline-offset-4 hover:underline" style={{ color: PALETTE.muted }}>← New draw</button>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={copyResults} className="text-sm underline-offset-4 hover:underline" style={{ color: PALETTE.muted }}>{copied ? "Copied ✓" : "Copy results"}</button>
                  <button onClick={copyShareLink} className="disp rounded-lg px-4 py-1.5 text-xs font-semibold uppercase" style={{ background: PALETTE.gold, color: PALETTE.fieldDeep }}>{linkCopied ? "Link copied ✓" : "Copy share link"}</button>
                  {storageOk && (
                    <button onClick={saveRecording} className="disp rounded-lg px-4 py-1.5 text-xs font-semibold uppercase" style={{ background: PALETTE.grass, color: PALETTE.fieldDeep }}>Save recording</button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {buckets.map((bucket) => {
                const isCurrent =
                  currentPick !== null &&
                  draw.players[currentPick.playerIndex].name === bucket.player;
                return (
                  <article key={bucket.player} className="rounded-2xl p-4" style={{ background: PALETTE.card, border: `1px solid ${isCurrent ? PALETTE.gold : PALETTE.faint}` }}>
                    <div className="mb-3 flex items-baseline justify-between">
                      <h3 className="disp text-xl font-semibold">{bucket.player}</h3>
                      <span className="text-xs" style={{ color: PALETTE.muted }}>{bucket.teams.length} / {bucket.entries}</span>
                    </div>
                    <ul className="space-y-1.5">
                      {bucket.teams.length === 0 && (
                        <li className="text-sm" style={{ color: PALETTE.muted }}>—</li>
                      )}
                      {bucket.teams.map((team) => (
                        <li key={team.name} className="slot flex items-center gap-2.5 rounded-lg px-2.5 py-2" style={{ background: PALETTE.fieldDeep }}>
                          <span className="text-xl leading-none">{team.flag}</span>
                          <span className="flex-1 text-sm font-medium leading-tight">{team.name}</span>
                          <span className="disp grid h-6 w-6 place-items-center rounded text-xs font-bold" style={{ background: "rgba(0,0,0,0.25)", color: GROUP_COLOURS[team.group] }} title={`Group ${team.group}`}>{team.group}</span>
                          <span className="disp w-9 text-right text-xs" style={{ color: PALETTE.muted }} title="FIFA world ranking">#{team.rank}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>

            {finished && sequence.undrawn.length > 0 && (
              <div className="mt-4 rounded-2xl p-4" style={{ background: PALETTE.card, border: `1px solid ${PALETTE.faint}` }}>
                <h3 className="disp text-xs uppercase tracking-[0.2em] mb-2" style={{ color: PALETTE.muted }}>Still in the hat ({sequence.undrawn.length})</h3>
                <div className="flex flex-wrap gap-1.5">
                  {sequence.undrawn.map((team) => (
                    <span key={team.name} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs" style={{ background: PALETTE.fieldDeep, color: PALETTE.muted }}>
                      <span>{team.flag}</span>
                      {team.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        <footer className="mt-10 border-t pt-6 text-center text-xs" style={{ borderColor: PALETTE.faint, color: PALETTE.muted }}>
          <a
            href="https://github.com/1stevengrant/wc26-sweepstake"
            target="_blank"
            rel="noreferrer"
            className="underline-offset-4 hover:underline"
            style={{ color: PALETTE.muted }}
          >
            Source on GitHub
          </a>
        </footer>
      </div>
    </div>
  );
}
