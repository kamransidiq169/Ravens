/**
 * CSS-only version of the ENTERPRISE composition (three rounded tiles over a pedestal, two block clusters): the
 * no-WebGL stand-in inside the stage and the still arrangement under reduced motion / without scripts
 * (see `.journey__static-art`). Static: no animation.
 */
/** Bottom to top, matching the scene (cyan at the bottom, blue on top). */
const TILES = ["cyan", "orange", "blue"] as const;

const LEFT = [
  "left:6%;top:30%;width:44%;height:22%",
  "left:34%;top:58%;width:34%;height:18%",
  "left:0;top:72%;width:22%;height:14%",
];
const RIGHT = [
  "left:10%;top:56%;width:50%;height:16%",
  "left:56%;top:8%;width:18%;height:48%",
  "left:0;top:12%;width:30%;height:12%",
];

const toStyle = (css: string) =>
  Object.fromEntries(
    css.split(";").map((part) => {
      const [key = "", value = ""] = part.split(":");
      return [key.trim(), value.trim()];
    }),
  );

export function StackArt() {
  return (
    <div className="stack-art" aria-hidden="true">
      <div className="orb-art__cluster orb-art__cluster--left">
        {LEFT.map((css) => (
          <i key={css} style={toStyle(css)} />
        ))}
      </div>
      <div className="orb-art__cluster orb-art__cluster--right">
        {RIGHT.map((css) => (
          <i key={css} style={toStyle(css)} />
        ))}
      </div>
      <div className="stack-art__shadow" />
      <div className="stack-art__pedestal-edge" />
      <div className="stack-art__pedestal" />
      {TILES.map((tone, i) => (
        <div key={tone} className={`stack-art__slot stack-art__slot--${i}`}>
          <div className={`stack-art__edge stack-art__edge--${tone}`} />
          <div className={`stack-art__tile stack-art__tile--${tone}`} />
        </div>
      ))}
    </div>
  );
}
