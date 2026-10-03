// Raw GLSL imports for the hero scene (wired to a loader by the hero build).
declare module "*.glsl" {
  const source: string;
  export default source;
}
