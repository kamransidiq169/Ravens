import { describe, expect, it } from "vitest";

import { cn } from "@/lib/cn";

describe("cn", () => {
  it("joins truthy class names and drops falsy ones", () => {
    expect(cn("a", false && "b", undefined, null, "c")).toBe("a c");
  });

  it("supports conditional objects and arrays", () => {
    expect(cn(["a", { b: true, c: false }])).toBe("a b");
  });

  it("lets later Tailwind utilities win conflicts", () => {
    expect(cn("px-4 text-ink", "px-8")).toBe("text-ink px-8");
  });
});

describe("cn with custom display sizes", () => {
  it("keeps text-display-* alongside a text colour", () => {
    expect(cn("text-display-md font-extralight", "text-ink")).toBe("text-display-md font-extralight text-ink");
  });

  it("still lets a later font size replace an earlier one", () => {
    expect(cn("text-display-xl", "text-display-md")).toBe("text-display-md");
  });
});
