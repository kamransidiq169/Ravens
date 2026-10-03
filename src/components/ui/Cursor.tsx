"use client";

import { useIdle } from "@/hooks/useIdle";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";

import { MEDIA } from "@/lib/constants";

import { CursorDriver } from "../motion/lazy";

/** Soft pointer follower. Only mounts for fine pointers, when motion is allowed, and after idle. */
export function Cursor() {
  const reduced = useReducedMotion();
  const finePointer = useMediaQuery(MEDIA.finePointer);
  const idle = useIdle();

  return idle && finePointer && !reduced ? <CursorDriver /> : null;
}
