"use client";

import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";

import { publicSite } from "@/config/navigation";

import { RavensLogo } from "../brand/RavensLogo";
import { Link } from "../ui/Link";

import { MobileMenu } from "./MobileMenu";

const MENU_ID = "site-menu";

export function Header() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  // /services ships its own minimal top controls.
  if (usePathname() === "/services") return null;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-(--z-header) flex h-[clamp(4rem,13svh,8rem)] items-center justify-between pr-[4.6vw] pl-[3.9vw]">
        <Link href="/" aria-label={`${publicSite.name} — home`} className="text-ink">
          <RavensLogo
            className="h-[clamp(14px,1.02vw,20px)] w-auto"
            aria-hidden="true"
            role="presentation"
            title=""
            style={{ letterSpacing: "0.1em" }}
          />
        </Link>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={MENU_ID}
          onClick={() => setOpen(true)}
          className="group flex items-center gap-[clamp(14px,1.3vw,24px)] py-3 font-display text-[clamp(10px,0.62vw,12px)] font-medium tracking-[0.32em] text-ink uppercase"
        >
          <span className="transition-transform duration-300 ease-out-expo group-hover:-translate-x-1">Menu</span>
          <span
            aria-hidden="true"
            className="h-px w-[clamp(24px,1.95vw,40px)] origin-right bg-ink transition-transform duration-300 ease-out-expo group-hover:scale-x-[1.3]"
          />
        </button>
      </header>
      <MobileMenu id={MENU_ID} open={open} onClose={close} />
    </>
  );
}
