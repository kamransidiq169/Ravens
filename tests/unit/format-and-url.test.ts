import { describe, expect, it } from "vitest";

import { formatDate } from "@/lib/format-date";
import { absoluteUrl } from "@/lib/url";

describe("formatDate", () => {
  it("formats ISO dates timezone-independently", () => {
    expect(formatDate("2026-03-04")).toBe("4 March 2026");
  });

  it("throws on invalid input", () => {
    expect(() => formatDate("not-a-date")).toThrow(RangeError);
  });
});

describe("absoluteUrl", () => {
  it("resolves paths against the site origin", () => {
    expect(absoluteUrl("/work")).toBe("http://localhost:3000/work");
  });

  it("defaults to the origin root", () => {
    expect(absoluteUrl()).toBe("http://localhost:3000/");
  });
});
