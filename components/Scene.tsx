"use client";

import type { SceneState } from "@/lib/types";

/**
 * Warm flat-illustration exam-room scene, driven entirely by SceneState.
 *
 * Representation rule: we never depict signing with illustration —
 * handshapes are a language, and faking them would misrepresent it.
 * Signed communication is conveyed through framing, presence, and
 * expression; real ASL belongs in video media slots.
 */

type Mood = SceneState["patientMood"];

/** Brow + mouth path data per patient mood (face centered at 238,210). */
const MAYA_FACE: Record<Mood, { browL: string; browR: string; mouth: string }> = {
  neutral: {
    browL: "M225 201 Q230 200 235 201",
    browR: "M242 201 Q247 200 252 201",
    mouth: "M232 220 Q238 221 244 220",
  },
  uncertain: {
    browL: "M225 202 Q230 199 235 202",
    browR: "M242 202 Q247 199 252 202",
    mouth: "M232 221 Q238 218 244 221",
  },
  frustrated: {
    browL: "M225 199 Q230 203 235 204",
    browR: "M242 204 Q247 203 252 199",
    mouth: "M233 221 L243 221",
  },
  engaged: {
    browL: "M225 200 Q230 198 235 200",
    browR: "M242 200 Q247 198 252 200",
    mouth: "M231 219 Q238 225 245 219",
  },
  relieved: {
    browL: "M225 201 Q230 199 235 201",
    browR: "M242 201 Q247 199 252 201",
    mouth: "M230 218 Q238 227 246 218",
  },
};

/** Clinician pupil offset by focus target (screen is to the right, notes below). */
const CLINICIAN_GAZE: Record<NonNullable<SceneState["clinicianFocus"]>, { dx: number; dy: number }> = {
  patient: { dx: -2, dy: 0 },
  interpreter: { dx: 2.5, dy: 0 },
  notes: { dx: 0, dy: 2 },
};

export default function Scene({ scene }: { scene: SceneState }) {
  const face = MAYA_FACE[scene.patientMood];
  const gaze = CLINICIAN_GAZE[scene.clinicianFocus ?? "patient"];
  const has = (r: SceneState["present"][number]) => scene.present.includes(r);

  return (
    <svg
      viewBox="0 0 680 400"
      role="img"
      aria-label={`Exam room scene. Present: ${scene.present.join(", ")}. The patient appears ${scene.patientMood}.`}
      className="w-full h-auto block"
    >
      {/* Room */}
      <rect x="0" y="0" width="680" height="300" fill="#F6E3D0" />
      <rect x="0" y="300" width="680" height="100" fill="#E7C6A6" />
      <rect x="0" y="296" width="680" height="6" fill="#D8B48E" />

      {/* Window */}
      <rect x="52" y="56" width="150" height="122" rx="6" fill="#C9B295" />
      <rect x="60" y="64" width="134" height="106" rx="3" fill="#BEDDE4" />
      <rect x="124" y="64" width="6" height="106" fill="#C9B295" />
      <rect x="60" y="110" width="134" height="6" fill="#C9B295" />
      <circle cx="86" cy="94" r="12" fill="#EBF4F6" />
      <circle cx="104" cy="98" r="14" fill="#EBF4F6" />

      {/* Plant */}
      <rect x="606" y="252" width="42" height="44" rx="5" fill="#C98B5A" />
      <circle cx="617" cy="246" r="15" fill="#7FA96F" />
      <circle cx="638" cy="248" r="14" fill="#8FB97E" />
      <circle cx="627" cy="232" r="14" fill="#9AC489" />

      {/* Counter */}
      <rect x="440" y="216" width="200" height="14" rx="5" fill="#EEE7DB" />
      <rect x="454" y="230" width="8" height="64" fill="#CBB79C" />
      <rect x="618" y="230" width="8" height="64" fill="#CBB79C" />

      {/* ——— Maya (patient), seated ——— */}
      {has("patient") && (
        <g>
          <rect x="206" y="288" width="62" height="10" rx="3" fill="#B87C4E" />
          <rect x="212" y="298" width="8" height="30" fill="#A96F44" />
          <rect x="254" y="298" width="8" height="30" fill="#A96F44" />
          <rect x="214" y="234" width="48" height="62" rx="20" fill="#4FA39C" />
          <rect x="220" y="266" width="36" height="30" fill="#4FA39C" />
          <rect x="228" y="226" width="20" height="16" rx="6" fill="#E8B489" />
          <circle cx="238" cy="210" r="23" fill="#E8B489" />
          <path
            d="M215 208 Q214 180 238 178 Q262 180 261 208 L261 200 Q261 186 238 186 Q215 186 215 200 Z"
            fill="#33262A"
          />
          <path d="M215 205 Q212 224 220 236 L224 214 Z" fill="#33262A" />
          <path d="M261 205 Q264 224 256 236 L252 214 Z" fill="#33262A" />
          <circle cx="230" cy="210" r="2.4" fill="#3A2B26" />
          <circle cx="247" cy="210" r="2.4" fill="#3A2B26" />
          <g className="transition-all duration-500">
            <path d={face.browL} stroke="#3A2B26" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            <path d={face.browR} stroke="#3A2B26" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            <path d={face.mouth} stroke="#8A5A44" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          </g>
        </g>
      )}

      {/* ——— Clinician, standing ——— */}
      {has("clinician") && (
        <g>
          <rect x="356" y="298" width="12" height="30" fill="#7C7169" />
          <rect x="374" y="298" width="12" height="30" fill="#7C7169" />
          <rect x="344" y="230" width="54" height="72" rx="16" fill="#F2EEE7" />
          <path d="M371 232 L360 262 L371 258 L382 262 Z" fill="#E4DDD1" />
          <path d="M362 236 Q371 250 380 236" stroke="#E88C6E" strokeWidth="2.4" fill="none" />
          <circle cx="371" cy="252" r="3" fill="#E88C6E" />
          {scene.clinicianFocus === "notes" && (
            <g>
              <rect x="392" y="248" width="26" height="34" rx="3" fill="#F7F2E9" stroke="#C9B295" strokeWidth="1.5" />
              <line x1="397" y1="256" x2="413" y2="256" stroke="#C9B295" strokeWidth="1.5" />
              <line x1="397" y1="263" x2="413" y2="263" stroke="#C9B295" strokeWidth="1.5" />
              <line x1="397" y1="270" x2="409" y2="270" stroke="#C9B295" strokeWidth="1.5" />
            </g>
          )}
          <rect x="365" y="222" width="12" height="14" rx="5" fill="#D99C6E" />
          <circle cx="371" cy="208" r="22" fill="#D99C6E" />
          <path
            d="M350 208 Q349 184 371 183 Q393 184 392 208 L392 198 Q392 188 371 188 Q350 188 350 198 Z"
            fill="#3A2B22"
          />
          <circle
            cx={364 + gaze.dx}
            cy={208 + gaze.dy}
            r="2.3"
            fill="#3A2B26"
            className="transition-all duration-500"
          />
          <circle
            cx={379 + gaze.dx}
            cy={208 + gaze.dy}
            r="2.3"
            fill="#3A2B26"
            className="transition-all duration-500"
          />
          <path d="M366 218 Q371 221 377 218" stroke="#7A4C34" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </g>
      )}

      {/* ——— Interpreter (VRI cart, slides in) ——— */}
      <g
        className="transition-all duration-700 ease-out"
        style={{
          transform: has("interpreter") ? "translateX(0)" : "translateX(190px)",
          opacity: has("interpreter") ? 1 : 0,
        }}
      >
        <rect x="497" y="300" width="60" height="8" rx="4" fill="#8A7B6B" />
        <rect x="523" y="250" width="8" height="52" fill="#8A7B6B" />
        <rect x="478" y="176" width="98" height="76" rx="6" fill="#4A4038" />
        <rect x="484" y="182" width="86" height="64" rx="3" fill="#EAF1F4" />
        {/* Interpreter on screen — presence and warmth, never faked signing */}
        <circle cx="527" cy="208" r="13" fill="#C9885E" />
        <path
          d="M515 207 Q514 193 527 192 Q540 193 539 207 L539 201 Q539 195 527 195 Q515 195 515 201 Z"
          fill="#4A3524"
        />
        <circle cx="523" cy="208" r="1.6" fill="#3A2B26" />
        <circle cx="532" cy="208" r="1.6" fill="#3A2B26" />
        <path d="M523 214 Q527 217 531 214" stroke="#7A4C34" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        <rect x="512" y="222" width="30" height="24" rx="9" fill="#E0A94E" />
        <circle cx="490" cy="188" r="2.5" fill="#7FA96F" />
      </g>

      {/* ——— Family member / companion ——— */}
      {has("family-member") && (
        <g>
          <rect x="120" y="298" width="11" height="30" fill="#6E6459" />
          <rect x="137" y="298" width="11" height="30" fill="#6E6459" />
          <rect x="109" y="234" width="50" height="68" rx="15" fill="#B0716B" />
          <rect x="128" y="226" width="12" height="14" rx="5" fill="#E3A582" />
          <circle cx="134" cy="212" r="21" fill="#E3A582" />
          <path
            d="M114 212 Q113 189 134 188 Q155 189 154 212 L154 202 Q154 192 134 192 Q114 192 114 202 Z"
            fill="#5A4632"
          />
          <circle cx="127" cy="212" r="2.2" fill="#3A2B26" />
          <circle cx="141" cy="212" r="2.2" fill="#3A2B26" />
          <path d="M128 222 Q134 224 140 222" stroke="#8A5A44" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}
