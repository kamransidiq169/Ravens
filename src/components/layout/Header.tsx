"use client";

import { useCallback, useState } from "react";

import { siteConfig } from "@/config/site";

import { RavensLogo } from "../brand/RavensLogo";
import { Link } from "../ui/Link";

import { MobileMenu } from "./MobileMenu";

const MENU_ID = "site-menu";

export function Header() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-(--z-header) flex h-(--header-height) items-center justify-between px-gutter">
        <Link href="/" aria-label={`${siteConfig.name} — home`} className="text-ink">
          <RavensLogo className="h-5 w-auto sm:h-6" aria-hidden="true" role="presentation" title="" />
        </Link>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={MENU_ID}
          onClick={() => setOpen(true)}
          className="flex items-center gap-4 py-3 font-display text-xs font-medium tracking-label text-ink uppercase"
        >
          Menu
          <span aria-hidden="true" className="h-px w-10 bg-ink" />
        </button>
      </header>
      <MobileMenu id={MENU_ID} open={open} onClose={close} />
    </>
  );
}
