/**
 * Editorial opening, set low in the frame so the raven owns the top: eyebrow and statement on the left, one short
 * paragraph on the right, and the scroll marker bottom-left. Server-rendered; the scroll film
 * (hooks/useProcessScroll.ts) then carries it upward and pushes the camera into the heading.
 */
export function ProcessIntro({ headingId }: { headingId: string }) {
  return (
    <div className="proc__intro">
      <p className="proc__eyebrow" data-p="intro-copy">
        How we work
      </p>

      <h2 id={headingId} className="proc__statement" data-p="intro-title">
        <span className="proc__statement-line" data-p="intro-line">
          We turn
        </span>
        <span className="proc__statement-line" data-p="intro-line">
          ideas into
        </span>
        <span className="proc__statement-line proc__statement-line--accent" data-p="intro-line">
          experiences.
        </span>
      </h2>

      <p className="proc__lede" data-p="intro-copy">
        We move from discovery to clarity, from strategy to craft, and from craft to a digital experience built to
        perform.
      </p>

      <span className="proc__scroll" data-p="intro-copy" aria-hidden="true">
        <span className="proc__scroll-dot" />
        <span className="proc__scroll-line" />
        Scroll
      </span>
    </div>
  );
}
