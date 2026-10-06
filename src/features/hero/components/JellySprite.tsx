import { OrbArt } from "./OrbArt";
import { StackArt } from "./StackArt";

/**
 * Static jellyfish drawn in SVG: the server-rendered first paint, and the stand-in when WebGL, motion or data are not
 * available. Same palette and pose as the 3D scene so the handover is a soft crossfade. `data-j="sprite"` is moved by
 * the scroll timeline with the same curve the 3D scene uses.
 */
const TENTACLES = [
  "M120 214 C 108 260 134 300 118 352 C 106 392 126 420 116 470",
  "M142 220 C 150 270 126 310 144 366 C 156 404 138 440 150 490",
  "M166 224 C 160 276 182 316 168 372 C 158 414 176 446 168 506",
  "M190 226 C 196 280 176 322 192 380 C 202 420 186 452 194 520",
  "M214 226 C 208 282 230 324 214 382 C 204 424 222 456 212 522",
  "M238 224 C 246 276 224 318 240 372 C 250 414 232 446 242 506",
  "M262 220 C 254 268 278 308 260 366 C 250 404 270 440 258 490",
  "M284 214 C 294 260 270 300 286 352 C 298 392 278 420 288 470",
];

export function JellySprite() {
  return (
    <div className="journey__sprite" data-j="sprite">
      <svg className="journey__sprite-art" viewBox="0 0 400 560" fill="none" focusable="false">
        <defs>
          <radialGradient id="jelly-bell" cx="50%" cy="28%" r="70%">
            <stop offset="0" stopColor="#c9b6ff" />
            <stop offset="0.38" stopColor="#7c4dff" />
            <stop offset="0.8" stopColor="#4a1fd6" />
            <stop offset="1" stopColor="#3512a8" />
          </radialGradient>
          <radialGradient id="jelly-core" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#f2e9ff" stopOpacity="0.9" />
            <stop offset="1" stopColor="#b894ff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="jelly-arm" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6a35f2" />
            <stop offset="1" stopColor="#d9cbff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g stroke="url(#jelly-arm)" strokeLinecap="round" strokeWidth="2.2">
          {TENTACLES.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <g stroke="url(#jelly-arm)" strokeLinecap="round" strokeWidth="9" opacity="0.8">
          <path d="M168 220 C 150 282 192 330 170 396 C 160 430 176 456 166 486" />
          <path d="M232 220 C 250 282 208 330 230 396 C 240 430 224 456 234 486" />
        </g>
        <path
          d="M60 214 C 60 108 120 40 200 40 C 280 40 340 108 340 214 C 320 232 296 222 276 232 C 252 244 228 228 200 238 C 172 228 148 244 124 232 C 104 222 80 232 60 214 Z"
          fill="url(#jelly-bell)"
        />
        <ellipse cx="200" cy="150" rx="74" ry="52" fill="url(#jelly-core)" />
        <path
          d="M104 96 C 130 58 176 46 214 50"
          stroke="#efe6ff"
          strokeOpacity="0.7"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/**
 * CSS-only stand-in for the gold sphere chapter (first paint, no WebGL, save-data). The 3D scene replaces it, so it is
 * hidden once `data-gl="ready"`; it enters with the same `scene` progress.
 */
export function OrbSprite() {
  return (
    <div className="journey__orb" data-j="orb">
      <OrbArt />
    </div>
  );
}

/** CSS-only stand-in for the stacked-tiles chapter; same role and lifecycle as `OrbSprite`. */
export function StackSprite() {
  return (
    <div className="journey__stack" data-j="stack">
      <StackArt />
    </div>
  );
}
