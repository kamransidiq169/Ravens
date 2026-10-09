import {
  Color,
  CylinderGeometry,
  DoubleSide,
  Group,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  LatheGeometry,
  Mesh,
  type Object3D,
  MeshBasicMaterial,
  SphereGeometry,
  ShaderMaterial,
  Vector2,
  type BufferGeometry,
  type Material,
} from "three";

/** Dimensions in scene units; the whole animal is roughly 2.6 wide and 4.5 tall with its tentacles. */
const BELL_RADIUS = 1.25;
const BELL_HEIGHT = 1.05;
const RIM_RADIUS = 1.2;

/** The animal dissolves toward the bottom edge of its view instead of being cut off by it. */
const EDGE_FADE = "smoothstep(-1.0, -0.62, vScreenY)";

/** Shared vertex maths: one bell "heartbeat" that both the bell and the tentacle roots follow. */
const PULSE = /* glsl */ `
  uniform float uTime;
  float beat() { return sin(uTime * 1.5); }
`;

const BELL_VERTEX = /* glsl */ `
  ${PULSE}
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vHeight;
  varying float vAngle;
  varying vec3 vLocal;
  varying float vScreenY;

  void main() {
    vec3 p = position;
    float ph = beat();
    float angle = atan(p.z, p.x);
    float rim = smoothstep(0.15, -0.55, p.y);

    p.xz *= 1.0 - 0.07 * ph * (0.35 + 0.65 * rim);
    p.y *= 1.0 + 0.05 * ph;
    p.xz *= 1.0 + 0.03 * rim * sin(angle * 6.0 - uTime * 1.8);
    p.y += rim * 0.07 * sin(angle * 9.0 + uTime * 2.2);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    vHeight = clamp((p.y + 0.4) / ${(BELL_HEIGHT + 0.4).toFixed(2)}, 0.0, 1.0);
    vAngle = angle;
    vLocal = p;
    gl_Position = projectionMatrix * mv;
    vScreenY = gl_Position.y / gl_Position.w;
  }
`;

const BELL_FRAGMENT = /* glsl */ `
  uniform float uFade;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vHeight;
  varying float vAngle;
  varying vec3 vLocal;
  varying float vScreenY;

  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vView);
    float facing = clamp(dot(n, v), 0.0, 1.0);
    float fres = pow(1.0 - facing, 2.2);

    vec3 deep = vec3(0.19, 0.06, 0.74);
    vec3 mid = vec3(0.43, 0.19, 1.0);
    vec3 light = vec3(0.84, 0.76, 1.0);

    vec3 col = mix(deep, mid, smoothstep(0.0, 0.8, vHeight));
    col = mix(col, light, fres * 0.85);

    // Soft radial ribs and a luminous core, like light travelling through the bell's mesoglea.
    float ribs = 0.5 + 0.5 * sin(vAngle * 28.0);
    col *= 0.9 + 0.14 * ribs * (1.0 - vHeight * 0.4);
    float core = smoothstep(0.95, 0.0, length(vLocal.xz) / ${RIM_RADIUS.toFixed(2)}) * smoothstep(0.1, 0.9, vHeight);
    col += vec3(0.38, 0.28, 0.62) * core * 0.35;

    vec3 l = normalize(vec3(-0.45, 0.85, 0.55));
    float spec = pow(max(dot(n, normalize(l + v)), 0.0), 70.0);
    col += vec3(1.0) * spec * 0.75;

    float alpha = (0.8 + 0.2 * fres) * uFade * ${EDGE_FADE};
    gl_FragColor = vec4(col, alpha);
  }
`;

const TENTACLE_VERTEX = /* glsl */ `
  ${PULSE}
  attribute float aAngle;
  attribute float aLength;
  attribute float aPhase;
  attribute float aWidth;
  attribute float aKind;
  varying float vAlong;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vScreenY;

  void main() {
    float along = -position.y;
    float ph = beat();

    float rootR = ${RIM_RADIUS.toFixed(2)} * (1.0 - 0.07 * ph);
    vec3 root = vec3(cos(aAngle) * rootR, -0.12, sin(aAngle) * rootR);
    float len = aLength * (1.0 - 0.06 * ph);

    vec3 p = root + vec3(0.0, -along * len, 0.0);
    vec2 radial = vec2(cos(aAngle), sin(aAngle));
    vec2 tangent = vec2(-radial.y, radial.x);

    // The fringe gathers inward under the bell, then drifts on two slow travelling waves.
    p.xz -= radial * rootR * 0.38 * smoothstep(0.0, 0.55, along);
    float w1 = sin(along * 7.0 - uTime * 1.7 + aPhase);
    float w2 = sin(along * 3.2 - uTime * 1.1 + aPhase * 1.7);
    float sway = pow(along, 1.15) * (0.55 + 0.45 * aKind) * (len / 3.0);
    p.xz += (tangent * w1 * 0.13 + radial * w2 * 0.16) * sway * 2.0;

    float r = aWidth * (1.0 - 0.6 * along);
    r *= 1.0 + aKind * 0.7 * sin(along * 38.0 + aPhase);
    p += vec3(position.x * r, 0.0, position.z * r);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    vAlong = along;
    gl_Position = projectionMatrix * mv;
    vScreenY = gl_Position.y / gl_Position.w;
  }
`;

const TENTACLE_FRAGMENT = /* glsl */ `
  uniform float uFade;
  varying float vAlong;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vScreenY;

  void main() {
    float fres = pow(1.0 - clamp(dot(normalize(vNormal), normalize(vView)), 0.0, 1.0), 1.6);
    vec3 col = mix(vec3(0.42, 0.17, 0.95), vec3(0.88, 0.8, 1.0), pow(vAlong, 0.75));
    col = mix(col, vec3(0.95, 0.91, 1.0), fres * 0.4);
    float alpha = (0.95 - 0.82 * vAlong) * uFade * ${EDGE_FADE};
    gl_FragColor = vec4(col, alpha);
  }
`;

/** Small seeded PRNG so the animal is identical on every load (and in tests). */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Jellyfish {
  /** Add to the scene graph; origin is the animal's visual centre. */
  meshes: Object3D[];
  /** Inner organ ring pulses with the bell. */
  core: Group;
  /** Advances the animation clock and returns it (seconds). */
  tick: (delta: number) => number;
  /** Fades the animal in (0 → 1 over about 0.8s). */
  fadeIn: (delta: number) => void;
  dispose: () => void;
}

export function createJellyfish(tentacleCount: number, armCount: number): Jellyfish {
  const uniforms = { uTime: { value: 0 }, uFade: { value: 0 } };
  const geometries: BufferGeometry[] = [];
  const materials: Material[] = [];

  // Bell: a lathe of a bell profile, hemispherical crown with a flared, slightly tucked skirt.
  const profile: Vector2[] = [];
  const crownSteps = 28;
  for (let i = 0; i <= crownSteps; i += 1) {
    const theta = (i / crownSteps) * (Math.PI / 2);
    const flare = 1 + 0.07 * Math.sin(theta) ** 6;
    profile.push(new Vector2(BELL_RADIUS * Math.sin(theta) * flare, BELL_HEIGHT * Math.cos(theta)));
  }
  profile.push(
    new Vector2(BELL_RADIUS * 1.04, -0.06),
    new Vector2(BELL_RADIUS * 0.98, -0.2),
    new Vector2(BELL_RADIUS * 0.9, -0.28),
  );
  profile.reverse();
  const bellGeometry = new LatheGeometry(profile, 112);
  const bellMaterial = new ShaderMaterial({
    uniforms,
    vertexShader: BELL_VERTEX,
    fragmentShader: BELL_FRAGMENT,
    transparent: true,
    depthWrite: false,
  });
  const bell = new Mesh(bellGeometry, bellMaterial);
  bell.renderOrder = 3;
  geometries.push(bellGeometry);
  materials.push(bellMaterial);

  // Core: four soft lobes inside the bell.
  const lobe = new SphereGeometry(0.3, 24, 16);
  const coreMaterial = new MeshBasicMaterial({
    color: new Color("#eadfff"),
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  const core = new Group();
  for (let i = 0; i < 4; i += 1) {
    const part = new Mesh(lobe, coreMaterial);
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    part.position.set(Math.cos(a) * 0.42, 0.28, Math.sin(a) * 0.42);
    part.scale.set(1, 0.55, 1.35);
    part.rotation.y = -a;
    part.renderOrder = 2;
    core.add(part);
  }
  geometries.push(lobe);
  materials.push(coreMaterial);

  // Tentacles and oral arms: one instanced tube, all motion in the vertex shader.
  const count = tentacleCount + armCount;
  const tube = new CylinderGeometry(1, 1, 1, 6, 56, true);
  tube.translate(0, -0.5, 0);
  const instanced = new InstancedBufferGeometry().copy(tube as unknown as InstancedBufferGeometry);
  instanced.instanceCount = count;
  tube.dispose();

  const angle = new Float32Array(count);
  const length = new Float32Array(count);
  const phase = new Float32Array(count);
  const width = new Float32Array(count);
  const kind = new Float32Array(count);
  const rand = mulberry32(7);
  for (let i = 0; i < count; i += 1) {
    const arm = i >= tentacleCount;
    if (arm) {
      const k = i - tentacleCount;
      angle[i] = (k / armCount) * Math.PI * 2 + 0.3;
      length[i] = 2.7 + rand() * 0.9;
      width[i] = 0.05;
    } else {
      angle[i] = (i / tentacleCount) * Math.PI * 2 + (rand() - 0.5) * 0.08;
      length[i] = 2.3 + rand() * 1.9;
      width[i] = 0.0065 + rand() * 0.004;
    }
    phase[i] = rand() * Math.PI * 2;
    kind[i] = arm ? 1 : 0;
  }
  instanced.setAttribute("aAngle", new InstancedBufferAttribute(angle, 1));
  instanced.setAttribute("aLength", new InstancedBufferAttribute(length, 1));
  instanced.setAttribute("aPhase", new InstancedBufferAttribute(phase, 1));
  instanced.setAttribute("aWidth", new InstancedBufferAttribute(width, 1));
  instanced.setAttribute("aKind", new InstancedBufferAttribute(kind, 1));

  const tentacleMaterial = new ShaderMaterial({
    uniforms,
    vertexShader: TENTACLE_VERTEX,
    fragmentShader: TENTACLE_FRAGMENT,
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
  });
  const tentacles = new Mesh(instanced, tentacleMaterial);
  tentacles.frustumCulled = false;
  tentacles.renderOrder = 1;
  geometries.push(instanced);
  materials.push(tentacleMaterial);

  return {
    meshes: [tentacles, core, bell],
    core,
    tick: (delta) => {
      uniforms.uTime.value += delta;
      return uniforms.uTime.value;
    },
    fadeIn: (delta) => {
      uniforms.uFade.value = Math.min(1, uniforms.uFade.value + delta * 1.3);
    },
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
    },
  };
}
