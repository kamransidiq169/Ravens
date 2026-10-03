import dynamic from "next/dynamic";

// One shared lazy chunk (gsap + ScrollTrigger + @gsap/react). `ssr: false` keeps it out of the server render and initial JS.
export const FadeUpDriver = dynamic(() => import("./drivers").then((m) => m.FadeUpDriver), { ssr: false });
export const WordRevealDriver = dynamic(() => import("./drivers").then((m) => m.WordRevealDriver), { ssr: false });
export const ParallaxDriver = dynamic(() => import("./drivers").then((m) => m.ParallaxDriver), { ssr: false });
export const MagneticDriver = dynamic(() => import("./drivers").then((m) => m.MagneticDriver), { ssr: false });
export const PageTransitionDriver = dynamic(() => import("./drivers").then((m) => m.PageTransitionDriver), {
  ssr: false,
});
export const ScrollProgressDriver = dynamic(() => import("./drivers").then((m) => m.ScrollProgressDriver), {
  ssr: false,
});
export const CursorDriver = dynamic(() => import("./drivers").then((m) => m.CursorDriver), { ssr: false });
