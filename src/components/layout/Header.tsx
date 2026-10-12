"use client";

import "./styles/menu.css";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, useRef, useState } from "react";

import { useDarkBackdrop } from "@/hooks/useDarkBackdrop";

import { cn } from "@/lib/cn";

import { publicSite } from "@/config/navigation";

import { Link } from "../ui/Link";

import { MobileMenu } from "./MobileMenu";

const MENU_ID = "site-menu";

/**
 * Logo on the left, a bare two-line menu icon on the right that morphs into an X. The header stays above the overlay
 * while it is open (switching to light ink), so the same icon closes it.
 */
export function Header() {
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState<string>();
  const toggle = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);
  const pathname = usePathname();
  // Over a dark section (the /about tunnel) the ink flips to white so the logo and icon stay visible.
  const light = useDarkBackdrop(pathname);

  const onToggle = () => {
    if (!open && toggle.current) {
      // The overlay's circular reveal grows out of the icon.
      const r = toggle.current.getBoundingClientRect();
      setOrigin(`${Math.round(r.left + r.width / 2)}px ${Math.round(r.top + r.height / 2)}px`);
    }
    setOpen((value) => !value);
  };

  // /services ships its own minimal top controls.
  if (pathname === "/services") return null;

  const dark = light || open;

  return (
    <>
      <header className={cn("nav", open && "nav--open")} data-tone={dark ? "dark" : "light"}>
        <div className="nav__bar">
          <Link href="/" aria-label={`${publicSite.name} — home`} className="nav__brand" onClick={close}>
            <Image
              src="/images/brand/ravens-logo.png"
              alt=""
              width={612}
              height={408}
              priority
              sizes="96px"
              className={cn("nav__logo", dark && "nav__logo--invert")}
            />
          </Link>

          <button
            ref={toggle}
            type="button"
            className="nav__toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls={MENU_ID}
            onClick={onToggle}
          >
            <span className="nav__line nav__line--top" aria-hidden="true" />
            <span className="nav__line nav__line--bottom" aria-hidden="true" />
          </button>
        </div>
      </header>

      <MobileMenu id={MENU_ID} open={open} onClose={close} origin={origin} />
    </>
  );
}
