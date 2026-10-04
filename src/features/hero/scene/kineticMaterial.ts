import { Color, ShaderMaterial } from "three";

import type { KineticState } from "../lib/kinetic";

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = position.xy + 0.5;
    // Fill the whole view exactly, whatever the camera does.
    gl_Position = vec4(position.xy * 2.0, 0.0, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec2 uRes;
  uniform float uZoom;
  uniform float uMorph;
  uniform float uRot;
  uniform float uPhase;
  uniform float uFade;
  uniform int uFirst;
  uniform float uBottom;
  uniform vec3 uNavy;
  uniform vec3 uNavyDeep;
  uniform vec3 uRoyal;
  uniform vec3 uLavender;
  uniform vec3 uPale;
  varying vec2 vUv;

  const float TAU = 6.28318530718;
  const float B0 = 0.052;   // half-size of the smallest nested form at rest (stage heights)
  const float G = 1.5;      // each form is this much larger than the one inside it
  const int LAST = 5;       // outermost form (at rest it is partly cropped by the frame)

  mat2 rot(float a) { float c = cos(a); float s = sin(a); return mat2(c, -s, s, c); }

  // Rounded box signed distance; with radius == half-size it is a circle.
  float sdRoundBox(vec2 p, float b, float r) {
    vec2 q = abs(p) - vec2(b - r);
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    // Stage coordinates in heights: (0,0) is the centre, y up.
    vec2 p = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
    float px = 1.0 / uRes.y;

    // A hint of perspective: the structure leans very slightly, on a loop-periodic rhythm.
    vec2 tilt = 0.06 * vec2(sin(uPhase * TAU), cos(uPhase * TAU + 0.7));
    vec2 pk = p / (1.0 + dot(p, tilt));

    vec3 col = vec3(0.0);
    float alpha = 0.0;

    // Dark navy belongs to the structure: everything inside its outermost form.
    float bo = B0 * pow(G, float(LAST)) * uZoom;
    float ao = 0.7853982 + uRot + 0.06 * float(LAST) * sin(2.0 * uRot);
    float dOuter = sdRoundBox(rot(ao) * pk, bo, bo * mix(0.16, 1.0, uMorph));
    float inside = 1.0 - smoothstep(-px, px, dOuter);
    float rad = clamp(length(p) / max(bo, 1e-4), 0.0, 1.0);
    col = mix(uNavyDeep, uNavy, smoothstep(0.0, 1.0, rad));
    alpha = inside * 0.9;

    // The nested outlines: constant proportion of their own size, so zooming reads as a true camera move.
    for (int k = 0; k < 13; k += 1) {
      int i = k - 7;
      if (i < uFirst || i > LAST) continue;
      float fi = float(i);
      float b = B0 * pow(G, fi) * uZoom;
      float bPx = b / px;
      if (bPx < 1.5) continue;
      float a = 0.7853982 + uRot + 0.06 * fi * sin(2.0 * uRot);
      vec2 off = tilt * fi * 0.012;
      float d = sdRoundBox(rot(a) * (pk - off), b, b * mix(0.16, 1.0, uMorph));
      float w = 0.1 * b;
      float s = 1.0 - smoothstep(w - px, w + px, abs(d));
      if (s <= 0.0) continue;

      // Gradient travelling around each form and through the nesting, on two different loop-periodic clocks.
      float ang = atan(pk.y - off.y, pk.x - off.x);
      float t1 = 0.5 + 0.5 * sin(ang + fi * 0.55 + uPhase * TAU);
      float t2 = 0.5 + 0.5 * sin(2.0 * ang - fi * 0.3 - uPhase * TAU * 2.0);
      vec3 c = mix(uRoyal, uLavender, smoothstep(0.0, 1.0, t1));
      c = mix(c, uPale, 0.55 * t2 * t2);
      // Inner edge of each band brighter, outer edge deeper: the bands read as rounded, not flat.
      float edge = clamp(d / max(w, 1e-5), -1.0, 1.0);
      c *= 0.82 + 0.22 * (0.5 - 0.5 * edge);
      // Forms near the frame edge recede a little; tiny forms fade out before they alias.
      float depth = 1.0 - 0.35 * smoothstep(0.45, 1.1, length(p));
      float sub = smoothstep(1.5, 4.0, bPx);
      col = mix(col, c, s * depth * sub);
      alpha = max(alpha, s * depth * sub);
    }

    // Keep the typography readable: the structure eases off behind the title and the header / project details.
    float title = length((vUv - vec2(0.5, 0.5)) / vec2(0.5, 0.075));
    float mask = mix(0.12, 1.0, smoothstep(0.7, 2.4, title));
    mask *= mix(0.3, 1.0, smoothstep(uBottom - 0.18, uBottom, vUv.y));
    mask *= mix(0.4, 1.0, smoothstep(0.97, 0.88, vUv.y));
    alpha *= mask;

    // The central form: a small sphere that anchors the whole sequence (and is the point it collapses into).
    float cr = max(0.0045, 0.02 * pow(uZoom, 0.35));
    float dc = length(p) - cr;
    float core = 1.0 - smoothstep(-px, px, dc);
    vec2 hl = (p / cr) - vec2(-0.32, 0.36);
    vec3 sphere = mix(uRoyal, uLavender, smoothstep(0.0, 1.0, 0.5 + 0.5 * (p.y / cr)));
    sphere = mix(sphere, uPale, 0.9 * (1.0 - smoothstep(0.0, 0.9, length(hl))));
    col = mix(col, sphere, core);
    alpha = max(alpha, core);

    gl_FragColor = vec4(col, alpha * uFade);
    #include <colorspace_fragment>
  }
`;

export interface KineticMaterial {
  material: ShaderMaterial;
  /** Writes one frame of state: the loop pose, the view size in pixels and the entrance fade. */
  set: (state: KineticState, width: number, height: number, fade: number, compact: boolean) => void;
  dispose: () => void;
}

/** `firstForm` is the innermost nested form to draw (−7 on desktop; fewer forms on weaker devices). */
export function createKineticMaterial(firstForm: number): KineticMaterial {
  const material = new ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uRes: { value: [1, 1] },
      uZoom: { value: 1 },
      uMorph: { value: 0 },
      uRot: { value: 0 },
      uPhase: { value: 0 },
      uFade: { value: 0 },
      uFirst: { value: firstForm },
      uBottom: { value: 0.3 },
      uNavy: { value: new Color("#0a1244") },
      uNavyDeep: { value: new Color("#04071f") },
      uRoyal: { value: new Color("#2a45e0") },
      uLavender: { value: new Color("#b9b0ff") },
      uPale: { value: new Color("#e6e0ff") },
    },
  });
  return {
    material,
    set: (state, width, height, fade, compact) => {
      const u = material.uniforms;
      u.uRes!.value = [width, height];
      u.uZoom!.value = state.zoom;
      u.uMorph!.value = state.morph;
      u.uRot!.value = state.rotation;
      u.uPhase!.value = state.phase;
      u.uFade!.value = fade;
      // The project details stack taller on phones, so the structure eases off higher up there.
      u.uBottom!.value = compact ? 0.5 : 0.3;
    },
    dispose: () => material.dispose(),
  };
}
