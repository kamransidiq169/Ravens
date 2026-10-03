"use client";

import dynamic from "next/dynamic";

/**
 * Client-only, code-split entry for the shared canvas. Mount this only on routes
 * that render WebGL so three.js never lands in other routes' initial JS.
 */
export const LazySharedCanvas = dynamic(() => import("./SharedCanvas"), { ssr: false });
