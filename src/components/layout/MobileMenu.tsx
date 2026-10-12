"use client";

import { useRef, type CSSProperties } from "react";

import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

import { cn } from "@/lib/cn";

import { publicSite } from "@/config/navigation";

import { useSmoothScroll } from "../providers/SmoothScrollProvider";
import { Link } from "../ui/Link";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  id: string;
  /** Viewport point (`"x y"`) the circular reveal grows from: the header's toggle. */
  origin?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Full-screen navigation overlay: a circular reveal from the toggle, numbered links that arrive with a staggered blur
 * and slide, hover shifts the link and dims the rest. Focus-trapped, Esc-dismissible, locks page scroll while open.
 * The header bar (and its close button) stays above it.
 */
export function MobileMenu({ open, onClose, id, origin }: MobileMenuProps) {
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

  // Focus management: move focus in, trap Tab (including the header's close button), close on Esc, restore on close.
  useIsomorphicLayoutEffect(() => {
    if (!open || !panel.current) return;
    const container = panel.current;
    const opener = document.activeElement as HTMLElement | null;
    const toggle = document.querySelector<HTMLElement>(`[aria-controls="${id}"]`);
    const focusables = () => [
      ...(toggle ? [toggle] : []),
      ...Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)),
    ];
    container.focus({ preventScroll: true });

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
      const inside = container.contains(active) || active === toggle;
      if (event.shiftKey && (active === first || !inside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !inside || active === container)) {
        event.preventDefault();
        (active === container ? (container.querySelector<HTMLElement>(FOCUSABLE) ?? first) : first).focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      opener?.focus({ preventScroll: true });
    };
  }, [open, onClose, id]);

  return (
    <div
      id={id}
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      tabIndex={-1}
      inert={!open}
      className={cn("menu", open && "menu--open")}
      style={{ "--menu-origin": origin ?? "calc(100% - 4.6vw - 14px) clamp(2rem, 6.5svh, 4rem)" } as CSSProperties}
    >
      <div className="menu__inner">
        <nav aria-label="Primary" className="menu__nav">
          <ul className="menu__list">
            {publicSite.nav.map((item, index) => (
              <li key={item.href} className="menu__item" style={{ "--i": index } as CSSProperties}>
                <Link href={item.href} onClick={onClose} className="menu__link">
                  <span className="menu__num" aria-hidden="true">
                    {pad(index + 1)}
                  </span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="menu__footer" style={{ "--n": publicSite.nav.length } as CSSProperties}>
          <span className="menu__divider" aria-hidden="true" />
          <div className="menu__meta">
            <Link
              href={`mailto:${publicSite.email}`}
              className="menu__sec menu__sec--note"
              style={{ "--j": 0 } as CSSProperties}
            >
              {publicSite.email}
            </Link>
            <ul className="menu__socials" aria-label="Social">
              {publicSite.socials.map((social, j) => (
                <li key={social.href} style={{ "--j": j + 1 } as CSSProperties}>
                  <Link href={social.href} className="menu__sec">
                    {social.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
