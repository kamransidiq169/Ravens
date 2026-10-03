import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PageTransition } from "@/components/motion/PageTransition";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { Providers } from "@/components/providers/Providers";
import { Cursor } from "@/components/ui/Cursor";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <Providers>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-(--z-cursor) focus:rounded-pill focus:bg-button focus:px-6 focus:py-3 focus:text-bg-top"
      >
        Skip to content
      </a>
      <ScrollProgress />
      <Cursor />
      <Header />
      <main id="main">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </Providers>
  );
}
