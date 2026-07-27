"use client";

import type { Character, Mood, SceneState, TimeOfDay } from "@/lib/types";

/**
 * Scene renderer v2 — warm flat-illustration style.
 *
 * Renderer-agnostic contract: everything here is driven by SceneState (plus
 * day/time and the scenario clock). Future graphics options implement the
 * same inputs; this component remains available as a settings choice.
 *
 * Representation rule: signing is never depicted. Signed communication is
 * conveyed through framing, presence, and expression; speech bubbles carry
 * spoken/interpreted/written content only.
 */

interface Props {
  scene: SceneState;
  characters: Character[];
  timeOfDay?: TimeOfDay;
  /** Minutes on the scenario clock, rendered on the wall clock if enabled. */
  scenarioMinutes?: number;
}

/* ---------------- palettes ---------------- */

const PALETTES: Record<
  TimeOfDay,
  { wall: string; floor: string; floorEdge: string; sky: string; frame: string; accent: string }
> = {
  morning: { wall: "#F7EBDC", floor: "#E9CCAD", floorEdge: "#DBB894", sky: "#D8E8F0", frame: "#C9B295", accent: "#F5D98A" },
  afternoon: { wall: "#F6E3D0", floor: "#E7C6A6", floorEdge: "#D8B48E", sky: "#BEDDE4", frame: "#C9B295", accent: "#EBF4F6" },
  evening: { wall: "#F2D9BC", floor: "#DDB48F", floorEdge: "#CBA076", sky: "#F0B97E", frame: "#BFA383", accent: "#E8865E" },
  night: { wall: "#8B8492", floor: "#6E6459", floorEdge: "#5E564D", sky: "#2E3A55", frame: "#5E5866", accent: "#E8E4D8" },
};

/* ---------------- faces ---------------- */

function facePaths(hx: number, hy: number, mood: Mood) {
  const b = (dl: string) => dl;
  switch (mood) {
    case "neutral":
      return {
        browL: b(`M${hx - 13} ${hy - 9} Q${hx - 8} ${hy - 10} ${hx - 3} ${hy - 9}`),
        browR: b(`M${hx + 4} ${hy - 9} Q${hx + 9} ${hy - 10} ${hx + 14} ${hy - 9}`),
        mouth: b(`M${hx - 6} ${hy + 10} Q${hx} ${hy + 11} ${hx + 6} ${hy + 10}`),
      };
    case "uncertain":
      return {
        browL: b(`M${hx - 13} ${hy - 8} Q${hx - 8} ${hy - 11} ${hx - 3} ${hy - 8}`),
        browR: b(`M${hx + 4} ${hy - 8} Q${hx + 9} ${hy - 11} ${hx + 14} ${hy - 8}`),
        mouth: b(`M${hx - 6} ${hy + 11} Q${hx} ${hy + 8} ${hx + 6} ${hy + 11}`),
      };
    case "frustrated":
      return {
        browL: b(`M${hx - 13} ${hy - 11} Q${hx - 8} ${hy - 7} ${hx - 3} ${hy - 6}`),
        browR: b(`M${hx + 4} ${hy - 6} Q${hx + 9} ${hy - 7} ${hx + 14} ${hy - 11}`),
        mouth: b(`M${hx - 5} ${hy + 11} L${hx + 5} ${hy + 11}`),
      };
    case "engaged":
      return {
        browL: b(`M${hx - 13} ${hy - 10} Q${hx - 8} ${hy - 12} ${hx - 3} ${hy - 10}`),
        browR: b(`M${hx + 4} ${hy - 10} Q${hx + 9} ${hy - 12} ${hx + 14} ${hy - 10}`),
        mouth: b(`M${hx - 7} ${hy + 9} Q${hx} ${hy + 15} ${hx + 7} ${hy + 9}`),
      };
    case "relieved":
      return {
        browL: b(`M${hx - 13} ${hy - 9} Q${hx - 8} ${hy - 11} ${hx - 3} ${hy - 9}`),
        browR: b(`M${hx + 4} ${hy - 9} Q${hx + 9} ${hy - 11} ${hx + 14} ${hy - 9}`),
        mouth: b(`M${hx - 8} ${hy + 8} Q${hx} ${hy + 17} ${hx + 8} ${hy + 8}`),
      };
    case "fearful":
      return {
        browL: b(`M${hx - 13} ${hy - 12} Q${hx - 8} ${hy - 14} ${hx - 3} ${hy - 11}`),
        browR: b(`M${hx + 4} ${hy - 11} Q${hx + 9} ${hy - 14} ${hx + 14} ${hy - 12}`),
        mouth: b(`M${hx - 4} ${hy + 12} Q${hx} ${hy + 9} ${hx + 4} ${hy + 12} Q${hx} ${hy + 14} ${hx - 4} ${hy + 12}`),
      };
    case "agitated":
      return {
        browL: b(`M${hx - 14} ${hy - 12} Q${hx - 8} ${hy - 6} ${hx - 3} ${hy - 5}`),
        browR: b(`M${hx + 4} ${hy - 5} Q${hx + 9} ${hy - 6} ${hx + 14} ${hy - 12}`),
        mouth: b(`M${hx - 6} ${hy + 12} L${hx - 2} ${hy + 10} L${hx + 2} ${hy + 12} L${hx + 6} ${hy + 10}`),
      };
    case "exhausted":
      return {
        browL: b(`M${hx - 13} ${hy - 7} Q${hx - 8} ${hy - 6} ${hx - 3} ${hy - 7}`),
        browR: b(`M${hx + 4} ${hy - 7} Q${hx + 9} ${hy - 6} ${hx + 14} ${hy - 7}`),
        mouth: b(`M${hx - 5} ${hy + 12} Q${hx} ${hy + 10} ${hx + 5} ${hy + 12}`),
      };
  }
}

function Face({ hx, hy, mood, skin }: { hx: number; hy: number; mood: Mood; skin: string }) {
  const f = facePaths(hx, hy, mood);
  return (
    <g className="transition-all duration-500">
      <circle cx={hx - 8} cy={hy} r="2.3" fill="#3A2B26" />
      <circle cx={hx + 9} cy={hy} r="2.3" fill="#3A2B26" />
      <path d={f.browL} stroke="#3A2B26" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d={f.browR} stroke="#3A2B26" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d={f.mouth} stroke={darken(skin)} strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </g>
  );
}

const darken = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.round(v * 0.55));
  return `#${((f(n >> 16) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).padStart(6, "0")}`;
};

/* ---------------- figures ---------------- */

interface FigureStyle {
  skin: string;
  hair: string;
  torso: string;
  legs: string;
  accessory?: "stethoscope" | "badge" | "cap" | "coat" | "gown";
}

const ARCHETYPE_STYLES: Record<string, FigureStyle> = {
  "adult-f": { skin: "#E3A582", hair: "#5A4632", torso: "#B0716B", legs: "#6E6459" },
  "adult-m": { skin: "#C98B5E", hair: "#33262A", torso: "#5E7A8A", legs: "#4E4A44" },
  elder: { skin: "#E8C49E", hair: "#C9C4BC", torso: "#8A7B9A", legs: "#5E5A54" },
  nurse: { skin: "#D9A57E", hair: "#3A2B22", torso: "#4FA39C", legs: "#3E7A74", accessory: "badge" },
  security: { skin: "#B87C5E", hair: "#2A2226", torso: "#3E4A5E", legs: "#2E3644", accessory: "cap" },
  supervisor: { skin: "#E0B48E", hair: "#8A8078", torso: "#F2EEE7", legs: "#4E4A44", accessory: "stethoscope" },
  clinician: { skin: "#D99C6E", hair: "#3A2B22", torso: "#F2EEE7", legs: "#7C7169", accessory: "stethoscope" },
};

/** Generic standing figure, drawn centered on x=0 with feet at y=328. */
function StandingFigure({
  style,
  mood,
  gazeDx,
  gazeDy,
}: {
  style: FigureStyle;
  mood: Mood;
  gazeDx: number;
  gazeDy: number;
}) {
  const hy = 208;
  return (
    <g>
      <rect x="-15" y="298" width="12" height="30" fill={style.legs} />
      <rect x="3" y="298" width="12" height="30" fill={style.legs} />
      <rect x="-27" y="230" width="54" height="72" rx="16" fill={style.torso} />
      {style.accessory === "stethoscope" && (
        <>
          <path d="M0 232 L-11 262 L0 258 L11 262 Z" fill="#E4DDD1" />
          <path d="M-9 236 Q0 250 9 236" stroke="#E88C6E" strokeWidth="2.4" fill="none" />
          <circle cx="0" cy="252" r="3" fill="#E88C6E" />
        </>
      )}
      {style.accessory === "badge" && (
        <rect x="8" y="240" width="12" height="15" rx="2" fill="#F7F2E9" stroke="#3E7A74" strokeWidth="1" />
      )}
      <rect x="-6" y="222" width="12" height="14" rx="5" fill={style.skin} />
      <circle cx="0" cy={hy} r="22" fill={style.skin} />
      <path
        d={`M-21 ${hy} Q-22 ${hy - 25} 0 ${hy - 26} Q22 ${hy - 25} 21 ${hy} L21 ${hy - 10} Q21 ${hy - 20} 0 ${hy - 20} Q-21 ${hy - 20} -21 ${hy - 10} Z`}
        fill={style.hair}
      />
      {style.accessory === "cap" && (
        <>
          <path d={`M-22 ${hy - 14} Q0 ${hy - 34} 22 ${hy - 14} L22 ${hy - 10} L-22 ${hy - 10} Z`} fill="#2E3644" />
          <rect x="-24" y={hy - 12} width="30" height="4" rx="2" fill="#232B36" />
        </>
      )}
      <g style={{ transform: `translate(${gazeDx}px, ${gazeDy}px)` }} className="transition-transform duration-500">
        <Face hx={0} hy={hy} mood={mood} skin={style.skin} />
      </g>
    </g>
  );
}

/** Maya's seated figure (original art), centered on x=0. */
function MayaSeated({ mood }: { mood: Mood }) {
  return (
    <g>
      <rect x="-32" y="288" width="62" height="10" rx="3" fill="#B87C4E" />
      <rect x="-26" y="298" width="8" height="30" fill="#A96F44" />
      <rect x="16" y="298" width="8" height="30" fill="#A96F44" />
      <rect x="-24" y="234" width="48" height="62" rx="20" fill="#4FA39C" />
      <rect x="-18" y="266" width="36" height="30" fill="#4FA39C" />
      <rect x="-10" y="226" width="20" height="16" rx="6" fill="#E8B489" />
      <circle cx="0" cy="210" r="23" fill="#E8B489" />
      <path
        d="M-23 208 Q-24 180 0 178 Q24 180 23 208 L23 200 Q23 186 0 186 Q-23 186 -23 200 Z"
        fill="#33262A"
      />
      <path d="M-23 205 Q-26 224 -18 236 L-14 214 Z" fill="#33262A" />
      <path d="M23 205 Q26 224 18 236 L14 214 Z" fill="#33262A" />
      <Face hx={0} hy={210} mood={mood} skin="#E8B489" />
    </g>
  );
}

/** VRI interpreter cart, centered on x=0. */
function VriCart({ mood }: { mood: Mood }) {
  return (
    <g>
      <rect x="-30" y="300" width="60" height="8" rx="4" fill="#8A7B6B" />
      <rect x="-4" y="250" width="8" height="52" fill="#8A7B6B" />
      <rect x="-49" y="176" width="98" height="76" rx="6" fill="#4A4038" />
      <rect x="-43" y="182" width="86" height="64" rx="3" fill="#EAF1F4" />
      <circle cx="0" cy="208" r="13" fill="#C9885E" />
      <path
        d="M-12 207 Q-13 193 0 192 Q13 193 12 207 L12 201 Q12 195 0 195 Q-12 195 -12 201 Z"
        fill="#4A3524"
      />
      <circle cx="-4" cy="208" r="1.6" fill="#3A2B26" />
      <circle cx="5" cy="208" r="1.6" fill="#3A2B26" />
      <path
        d={mood === "engaged" ? "M-4 214 Q0 218 4 214" : "M-4 214 Q0 217 4 214"}
        stroke="#7A4C34"
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
      />
      <rect x="-15" y="222" width="30" height="24" rx="9" fill="#E0A94E" />
      <circle cx="-37" cy="188" r="2.5" fill="#7FA96F" />
    </g>
  );
}

/**
 * Patient in a semi-reclined hospital bed, centered on x=0. The raised
 * backrest lets the face read naturally while clearly "in bed."
 */
function GurneyPatient({ mood, skin = "#E8C49E", hair = "#C9C4BC" }: { mood: Mood; skin?: string; hair?: string }) {
  return (
    <g>
      {/* legs + wheels */}
      <rect x="-52" y="271" width="7" height="52" fill="#8A857C" />
      <rect x="45" y="271" width="7" height="52" fill="#8A857C" />
      <circle cx="-48" cy="325" r="5" fill="#6E6A62" />
      <circle cx="48" cy="325" r="5" fill="#6E6A62" />
      {/* frame + mattress */}
      <rect x="-62" y="262" width="124" height="10" rx="3" fill="#B8B2A8" />
      <rect x="-62" y="248" width="124" height="15" rx="7" fill="#F2EEE7" />
      {/* angled backrest + pillow BEHIND the patient */}
      <g transform="rotate(-22 -34 252)">
        <rect x="-50" y="192" width="22" height="62" rx="8" fill="#F2EEE7" />
        <rect x="-52" y="194" width="20" height="26" rx="9" fill="#FDFBF7" stroke="#E4DDD1" strokeWidth="1" />
      </g>
      {/* patient sitting up: upright torso and head, fully frontal */}
      <rect x="-46" y="212" width="26" height="40" rx="10" fill="#D8E4E8" />
      <rect x="-38" y="204" width="10" height="12" rx="4" fill={skin} />
      <circle cx="-33" cy="194" r="13" fill={skin} />
      {/* hair: top arc plus side panels framing the face to the jaw */}
      <path
        d="M-46 194 Q-47 180 -33 179 Q-19 180 -20 194 L-20 187 Q-20 183 -33 183 Q-46 183 -46 187 Z"
        fill={hair}
      />
      <path d="M-46 191 Q-48 202 -44 209 L-42 196 Z" fill={hair} />
      <path d="M-20 191 Q-18 202 -22 209 L-24 196 Z" fill={hair} />
      <g transform="scale(0.85) translate(-5.8 28.7)">
        <Face hx={-33} hy={196} mood={mood} skin={skin} />
      </g>
      {/* blanket over the lap, with knee mound and foot bump */}
      <ellipse cx="18" cy="238" rx="15" ry="7" fill="#BFD3DC" />
      <rect x="-30" y="236" width="90" height="17" rx="8" fill="#BFD3DC" />
      <ellipse cx="52" cy="240" rx="8" ry="5" fill="#BFD3DC" />
      <line x1="-26" y1="248" x2="56" y2="248" stroke="#A8BEC8" strokeWidth="1.5" />
      {/* arm resting on the blanket, outlined so it reads against the covers */}
      <rect
        x="-42"
        y="230"
        width="34"
        height="10"
        rx="5"
        fill="#D8E4E8"
        stroke="#9AB2BE"
        strokeWidth="1.5"
      />
      <circle cx="-4" cy="235" r="5" fill={skin} stroke="#C79B72" strokeWidth="1" />
    </g>
  );
}

/* ---------------- bubbles ---------------- */

function wrapText(text: string, max = 26): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max) {
      if (cur) lines.push(cur.trim());
      cur = w;
    } else cur = cur + " " + w;
  }
  if (cur.trim()) lines.push(cur.trim());
  return lines;
}

function Bubble({ x, y, text }: { x: number; y: number; text: string }) {
  const lines = wrapText(text);
  const w = Math.min(230, Math.max(...lines.map((l) => l.length)) * 7.2 + 24);
  const h = lines.length * 16 + 18;
  const bx = Math.max(12, Math.min(668 - w, x - w / 2));
  return (
    <g>
      <rect x={bx} y={y - h} width={w} height={h} rx="10" fill="#FFFFFF" stroke="#D8C4AC" strokeWidth="1" />
      <path d={`M${x - 7} ${y} L${x + 7} ${y} L${x} ${y + 10} Z`} fill="#FFFFFF" stroke="#D8C4AC" strokeWidth="1" />
      <rect x={x - 7} y={y - 1.5} width={14} height={3} fill="#FFFFFF" />
      {lines.map((l, i) => (
        <text key={i} x={bx + 12} y={y - h + 22 + i * 16} fontSize="12.5" fill="#3A2B26" fontFamily="inherit">
          {l}
        </text>
      ))}
    </g>
  );
}

/* ---------------- scene ---------------- */

export default function Scene({ scene, characters, timeOfDay = "afternoon", scenarioMinutes }: Props) {
  const pal = PALETTES[timeOfDay];
  const isNight = timeOfDay === "night";
  const charById = new Map(characters.map((c) => [c.id, c]));

  const present = scene.present.filter((id) => charById.has(id));
  const slots = slotPositions(present.length);
  const posOf = (id: string) => slots[present.indexOf(id)] ?? 340;

  const mood = (id: string): Mood => scene.moods?.[id] ?? "neutral";

  const clockAngleMin = ((scenarioMinutes ?? 0) % 60) * 6;
  const clockAngleHr = (((scenarioMinutes ?? 0) / 60) % 12) * 30;

  return (
    <svg
      viewBox="0 0 680 400"
      role="img"
      aria-label={`Scene: present — ${present
        .map((id) => `${charById.get(id)!.name} (${mood(id)})`)
        .join(", ")}. Time: ${timeOfDay}.`}
      className="w-full h-auto block"
    >
      <rect x="0" y="0" width="680" height="300" fill={pal.wall} className="transition-all duration-700" />
      <rect x="0" y="300" width="680" height="100" fill={pal.floor} className="transition-all duration-700" />
      <rect x="0" y="296" width="680" height="6" fill={pal.floorEdge} className="transition-all duration-700" />

      {/* Window */}
      <rect x="52" y="56" width="150" height="122" rx="6" fill={pal.frame} />
      <rect x="60" y="64" width="134" height="106" rx="3" fill={pal.sky} className="transition-all duration-700" />
      {isNight ? (
        <>
          <circle cx="100" cy="94" r="11" fill={pal.accent} />
          <circle cx="132" cy="112" r="1.5" fill={pal.accent} />
          <circle cx="150" cy="88" r="1.5" fill={pal.accent} />
          <circle cx="80" cy="128" r="1.5" fill={pal.accent} />
        </>
      ) : timeOfDay === "evening" ? (
        <circle cx="90" cy="150" r="11" fill={pal.accent} />
      ) : timeOfDay === "morning" ? (
        <circle cx="86" cy="140" r="11" fill={pal.accent} />
      ) : (
        <>
          <circle cx="86" cy="94" r="12" fill={pal.accent} />
          <circle cx="104" cy="98" r="14" fill={pal.accent} />
        </>
      )}
      <rect x="124" y="64" width="6" height="106" fill={pal.frame} />
      <rect x="60" y="110" width="134" height="6" fill={pal.frame} />

      {/* Wall clock (scenario time) */}
      {scene.wallClock && (
        <g>
          <circle cx="600" cy="96" r="24" fill="#F7F2E9" stroke={pal.frame} strokeWidth="3" />
          <line
            x1="600"
            y1="96"
            x2={600 + 10 * Math.sin((clockAngleHr * Math.PI) / 180)}
            y2={96 - 10 * Math.cos((clockAngleHr * Math.PI) / 180)}
            stroke="#3A2B26"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line
            x1="600"
            y1="96"
            x2={600 + 16 * Math.sin((clockAngleMin * Math.PI) / 180)}
            y2={96 - 16 * Math.cos((clockAngleMin * Math.PI) / 180)}
            stroke="#A34A2E"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="600" cy="96" r="2" fill="#3A2B26" />
        </g>
      )}

      {/* ED props */}
      {scene.setting === "ed" && (
        <g>
          <rect x="638" y="60" width="6" height="240" fill={pal.frame} />
          <rect x="560" y="60" width="84" height="6" rx="3" fill={pal.frame} />
          <path d="M566 66 L566 210 Q587 222 608 210 L608 66 Z" fill="#BEDDE4" opacity="0.85" />
        </g>
      )}

      {/* Night interior lamp — floor lamp, standing clear at the far left */}
      {isNight && (
        <g>
          <circle cx="30" cy="242" r="18" fill="#F5D98A" opacity="0.35" />
          <rect x="27" y="248" width="6" height="50" fill="#4A4038" />
          <rect x="18" y="296" width="24" height="5" rx="2" fill="#4A4038" />
          <path d="M18 248 L42 248 L37 234 L23 234 Z" fill="#E8C86E" />
        </g>
      )}

      {/* Plant (clinic only) */}
      {scene.setting !== "ed" && (
        <g>
          <rect x="606" y="252" width="42" height="44" rx="5" fill="#C98B5A" />
          <circle cx="617" cy="246" r="15" fill="#7FA96F" />
          <circle cx="638" cy="248" r="14" fill="#8FB97E" />
          <circle cx="627" cy="232" r="14" fill="#9AC489" />
        </g>
      )}

      {/* Characters */}
      {present.map((id) => {
        const ch = charById.get(id)!;
        const x = posOf(id);
        const m = mood(id);
        const isFocusTargetful = ch.role === "clinician" && scene.focus;
        let gazeDx = 0;
        const gazeDy = isFocusTargetful && scene.focus === "notes" ? 2 : 0;
        if (isFocusTargetful && scene.focus !== "notes") {
          const tx = posOf(scene.focus!);
          gazeDx = tx > x ? 2.5 : -2.5;
        }
        return (
          <g key={id} style={{ transform: `translateX(${x}px)` }} className="transition-transform duration-700">
            {ch.archetype === "maya" ? (
              <MayaSeated mood={m} />
            ) : ch.archetype === "vri-interpreter" ? (
              <VriCart mood={m} />
            ) : ch.archetype === "gurney-patient" ? (
              <GurneyPatient mood={m} />
            ) : (
              <StandingFigure
                style={ARCHETYPE_STYLES[ch.archetype] ?? ARCHETYPE_STYLES["adult-m"]}
                mood={m}
                gazeDx={gazeDx}
                gazeDy={gazeDy}
              />
            )}
            {ch.role === "clinician" && scene.focus === "notes" && (
              <g>
                <rect x="21" y="248" width="26" height="34" rx="3" fill="#F7F2E9" stroke={pal.frame} strokeWidth="1.5" />
                <line x1="26" y1="256" x2="42" y2="256" stroke={pal.frame} strokeWidth="1.5" />
                <line x1="26" y1="263" x2="42" y2="263" stroke={pal.frame} strokeWidth="1.5" />
                <line x1="26" y1="270" x2="38" y2="270" stroke={pal.frame} strokeWidth="1.5" />
              </g>
            )}
          </g>
        );
      })}

      {/* Speech bubbles */}
      {scene.bubbles?.map((b, i) => (
        <Bubble key={i} x={posOf(b.characterId)} y={150 - i * 8} text={b.text} />
      ))}
    </svg>
  );
}

function slotPositions(n: number): number[] {
  if (n <= 1) return [340];
  if (n === 2) return [240, 440];
  if (n === 3) return [170, 360, 540];
  if (n === 4) return [120, 280, 440, 580];
  const gap = 560 / (n - 1);
  return Array.from({ length: n }, (_, i) => 80 + i * gap);
}
