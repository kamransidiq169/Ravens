import {
  CanvasTexture,
  RepeatWrapping,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Shape,
  SphereGeometry,
  SRGBColorSpace,
  Vector3,
  type BufferGeometry,
} from "three";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * A unit sphere with a basketball's channel pattern moulded into the surface (real geometry, not a texture):
 *
 *   - one seam around the equator,
 *   - a second seam crossing it, pole to pole,
 *   - two curved channels either side of that one (arcs of great circles, so they follow the sphere's curvature and
 *     bow toward the rim as the ball turns).
 *
 * Each channel is a soft, shallow recess with a faint raised lip just outside it (a bevel the light can catch), and its
 * vertices are tinted a deeper gold, which reads as ambient occlusion on a metal. Normals are recomputed from the
 * displaced surface, so highlights bend into the channels and everything stays locked to the ball as it rotates.
 * Needs enough segments that a channel spans a few of them (the scene picks the tessellation by device tier).
 */
export function createBasketball(widthSegments: number, heightSegments: number): BufferGeometry {
  const base = new SphereGeometry(1, widthSegments, heightSegments);
  // Weld the UV seam so the recomputed normals are continuous all the way round.
  base.deleteAttribute("uv");
  base.deleteAttribute("normal");
  const geometry = mergeVertices(base, 1e-5);
  base.dispose();

  // Plane normals of the four channels. A great circle is where the sphere meets a plane through the centre; the
  // distance to it is |n · plane|.
  const side = Math.SQRT1_2;
  const planes = [
    new Vector3(0, 1, 0), // equator
    new Vector3(1, 0, 0), // the crossing seam, pole to pole
    new Vector3(side, 0, -side), // curved channel, one side
    new Vector3(side, 0, side), // curved channel, the other side
  ];
  const HALF_WIDTH = 0.05; // channel half-width (about 3°)
  const DEPTH = 0.026; // recess depth, in sphere radii
  const LIP = 0.0045; // raised bevel just outside the channel

  const position = geometry.getAttribute("position");
  const color = new Float32BufferAttribute(new Float32Array(position.count * 3), 3);
  const n = new Vector3();

  for (let i = 0; i < position.count; i += 1) {
    n.fromBufferAttribute(position, i).normalize();
    let bowl = 0;
    let lip = 0;
    for (const plane of planes) {
      const d = Math.abs(n.dot(plane));
      bowl = Math.max(bowl, 1 - smoothstep(0, HALF_WIDTH, d));
      lip += Math.exp(-(((d - 1.35 * HALF_WIDTH) / (0.4 * HALF_WIDTH)) ** 2));
    }
    lip = Math.min(lip, 1);
    const soft = bowl * bowl * (3 - 2 * bowl);
    const radius = 1 - DEPTH * soft + LIP * lip * (1 - soft);
    position.setXYZ(i, n.x * radius, n.y * radius, n.z * radius);

    // Deeper gold in the channel (occlusion), a touch lighter on the lip.
    const tone = 1 - 0.5 * Math.pow(soft, 0.8) + 0.07 * lip * (1 - soft);
    color.setXYZ(i, tone, tone, tone);
  }
  geometry.setAttribute("color", color);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * One slab of the stepped platform: a rectangle with a small corner radius and a thin bevel, standing flat. Group 0 is
 * the top and bottom faces, group 1 the sides and bevels (given a faintly golden metal in the scene).
 */
export function createSlabGeometry(width: number, depth: number, thickness: number): BufferGeometry {
  const bevel = 0.022;
  const corner = 0.06;
  const hw = width / 2 - bevel;
  const hd = depth / 2 - bevel;
  const shape = new Shape();
  shape.moveTo(-hw + corner, -hd);
  shape.lineTo(hw - corner, -hd);
  shape.absarc(hw - corner, -hd + corner, corner, -Math.PI / 2, 0, false);
  shape.lineTo(hw, hd - corner);
  shape.absarc(hw - corner, hd - corner, corner, 0, Math.PI / 2, false);
  shape.lineTo(-hw + corner, hd);
  shape.absarc(-hw + corner, hd - corner, corner, Math.PI / 2, Math.PI, false);
  shape.lineTo(-hw, -hd + corner);
  shape.absarc(-hw + corner, -hd + corner, corner, Math.PI, Math.PI * 1.5, false);

  const extrusion = thickness - 2 * bevel;
  const geometry = new ExtrudeGeometry(shape, {
    depth: extrusion,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 8,
  });
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, -extrusion / 2, 0);
  return geometry;
}

/** A soft radial falloff used for contact and ground shadows (alpha only, tinted by the material). */
export function createSoftShadowTexture(): CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.45, "rgba(255,255,255,0.55)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/**
 * A faint, tileable roughness variation (green channel, 0.82 → 1.0): enough that highlights break up very slightly
 * across a surface instead of reading as a perfect CG plane. Blobs are wrapped so the texture tiles seamlessly.
 */
export function createRoughnessTexture(): CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "rgb(236,236,236)";
    ctx.fillRect(0, 0, size, size);
    // Deterministic pseudo-random blobs.
    let seed = 1337;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    for (let i = 0; i < 70; i += 1) {
      const x = rand() * size;
      const y = rand() * size;
      const r = 24 + rand() * 46;
      const tone = Math.round(210 + rand() * 45);
      for (const dx of [-size, 0, size]) {
        for (const dy of [-size, 0, size]) {
          const g = ctx.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r);
          g.addColorStop(0, `rgba(${tone},${tone},${tone},0.55)`);
          g.addColorStop(1, `rgba(${tone},${tone},${tone},0)`);
          ctx.fillStyle = g;
          ctx.fillRect(x + dx - r, y + dy - r, r * 2, r * 2);
        }
      }
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(0.5, 0.5);
  return texture;
}
