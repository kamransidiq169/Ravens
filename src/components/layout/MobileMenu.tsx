"use client";

import { useRef } from "react";

import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

import { cn } from "@/lib/cn";

import { siteConfig } from "@/config/site";

import { RavensLogo } from "../brand/RavensLogo";
import { useSmoothScroll } from "../providers/SmoothScrollProvider";
import { Link } from "../ui/Link";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  id: string;
}

/** Full-screen navigation overlay: focus-trapped, Esc-dismissible, locks page scroll while open. */
export function MobileMenu({ open, onClose, id }: MobileMenuProps) {
  const panel = useRef<HTMLDivElement>(null);
  const lenis = useSmoothScroll();

  // Scroll lock (native + Lenis).
  useIsomorphicLayoutEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis?.stop();
    return () => {
      document.body.style.overflow = previous;
      lenis?.start();
    };
  }, [open, lenis]);

  // Focus management: move focus in, trap Tab, close on Esc, restore focus on close.
  useIsomorphicLayoutEffect(() => {
    if (!open || !panel.current) return;
    const container = panel.current;
    const opener = document.activeElement as HTMLElement | null;
    const focusables = () => Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
    focusables()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !container.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !container.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      opener?.focus();
    };
  }, [open, onClose]);

  return (
    <div
      id={id}
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      inert={!open}
      className={cn(
        "fixed inset-0 z-(--z-menu) flex flex-col bg-bg-top px-gutter pt-8 pb-12 transition-[opacity,visibility] duration-500 ease-out-expo",
        open ? "visible opacity-100" : "invisible opacity-0",
      )}
    >
      <div className="flex items-center justify-between">
        <Link href="/" onClick={onClose} aria-label={`${siteConfig.name} — home`}>
          <RavensLogo className="h-5 w-auto text-ink" title="" aria-hidden="true" role="presentation" />
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-4 py-3 font-display text-xs font-medium tracking-label text-ink uppercase"
        >
          Close
          <span aria-hidden="true" className="h-px w-10 bg-ink" />
        </button>
      </div>

      <nav aria-label="Primary" className="my-auto">
        <ul className="flex flex-col gap-2">
          {siteConfig.nav.map((item, index) => (
            <li key={item.href} className="overflow-hidden">
              <Link
                href={item.href}
                onClick={onClose}
                className={cn(
                  "block py-2 text-display-md leading-tight font-extralight tracking-display text-ink transition-[transform,opacity] duration-700 ease-out-expo hover:text-ink-soft",
                  open ? "translate-y-0 opacity-100" : "translate-y-full opacity-0",
                )}
                style={{ transitionDelay: open ? `${index * 60 + 120}ms` : "0ms" }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-6 text-sm text-ink-soft">
        <Link href={`mailto:${siteConfig.email}`} variant="inline">
          {siteConfig.email}
        </Link>
        <ul className="flex gap-6">
          {siteConfig.socials.map((social) => (
            <li key={social.href}>
              <Link href={social.href} className="hover:text-ink">
                {social.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
