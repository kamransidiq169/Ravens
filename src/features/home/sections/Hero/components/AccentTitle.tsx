/** A title whose last word carries the Ravens purple accent (hero.css `journey__accent`). */
export function AccentTitle({ text }: { text: string }) {
  const at = text.lastIndexOf(" ");
  if (at < 0) return <span className="journey__accent">{text}</span>;
  return (
    <>
      {text.slice(0, at + 1)}
      <span className="journey__accent">{text.slice(at + 1)}</span>
    </>
  );
}
