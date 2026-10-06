/** Eyebrow + headline on the left, supporting copy on the right. */
export function SelectedWorkHeader({ id }: { id: string }) {
  return (
    <header className="sw__header">
      <div>
        <p className="sw__eyebrow">Selected work</p>
        <h2 id={id} className="sw__title">
          Recent websites
        </h2>
      </div>
      <p className="sw__lede">
        Five digital presences across commerce, architecture, hospitality, automotive and interiors, each composed with
        the same restraint.
      </p>
    </header>
  );
}
