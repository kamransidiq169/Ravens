/** Eyebrow + headline on the left, supporting copy on the right. Placeholder copy from the art-direction reference. */
export function SelectedWorkHeader({ id }: { id: string }) {
  return (
    <header className="sw__header">
      <div>
        <p className="sw__eyebrow">Where To Go Next</p>
        <h2 id={id} className="sw__title">
          FEATURED HOTELS
        </h2>
      </div>
      <p className="sw__lede">
        Step into a world of inspired destinations, visionary design and legendary service, where every stay transforms
        the journey that follows.
      </p>
    </header>
  );
}
