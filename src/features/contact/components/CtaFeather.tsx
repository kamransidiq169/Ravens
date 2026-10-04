const HEIGHT = 380;
const AXIS = 60;
const STEPS = 34;

const round = (n: number) => Math.round(n * 10) / 10;

/** Barbs sweep from the quill toward the tip; their reach follows the vane's outline. */
const barbs = Array.from({ length: STEPS }, (_, i) => {
  const y = 26 + (i / (STEPS - 1)) * (HEIGHT - 60);
  const reach = 46 * Math.sin(Math.PI * Math.pow(1 - y / HEIGHT, 0.75));
  const lift = reach * 0.9;
  return { y: round(y), left: round(AXIS - reach), right: round(AXIS + reach), top: round(y - lift) };
});

/** A single fine-line feather: the raven shows up here as a signature, not an illustration. */
export function CtaFeather({ className }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 120 ${HEIGHT + 40}`}
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth={0.7}
      strokeLinecap="round"
      className={className}
    >
      <path d={`M${AXIS} ${HEIGHT + 36}C${AXIS - 2} 250 ${AXIS + 2} 120 ${AXIS} 6`} strokeWidth={1.1} />
      {barbs.map((b) => (
        <path key={b.y} d={`M${AXIS} ${b.y}L${b.left} ${b.top}M${AXIS} ${b.y}L${b.right} ${b.top}`} />
      ))}
    </svg>
  );
}
