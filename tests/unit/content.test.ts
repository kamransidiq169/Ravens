import { describe, expect, it } from "vitest";

import { insights } from "@/content/insights";
import { processSteps } from "@/content/process";
import { projects } from "@/content/projects";
import { services } from "@/content/services";
import { testimonials } from "@/content/testimonials";

const unique = (values: string[]) => new Set(values).size === values.length;
const filled = (value: string) => value.trim().length > 0;

describe("content integrity", () => {
  it("has the expected number of entries", () => {
    expect(projects).toHaveLength(4);
    expect(services).toHaveLength(5);
    expect(insights).toHaveLength(3);
    expect(testimonials).toHaveLength(3);
  });

  it.each([
    ["projects", projects],
    ["services", services],
    ["insights", insights],
  ])("%s have unique, URL-safe slugs", (_name, items) => {
    const slugs = items.map((item) => item.slug);
    expect(unique(slugs)).toBe(true);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it("projects have all required fields", () => {
    for (const project of projects) {
      expect(
        [
          project.title,
          project.client,
          project.summary,
          project.cover.alt,
          project.seo.title,
          project.seo.description,
        ].every(filled),
      ).toBe(true);
      expect(project.body.length).toBeGreaterThan(0);
      expect(project.disciplines.length).toBeGreaterThan(0);
      expect(project.cover.width).toBeGreaterThan(0);
    }
  });

  it("services have all required fields", () => {
    for (const service of services) {
      expect([service.title, service.summary, service.seo.title, service.seo.description].every(filled)).toBe(true);
      expect(service.body.length).toBeGreaterThan(0);
      expect(service.deliverables.length).toBeGreaterThan(0);
    }
  });

  it("insights have valid ISO dates and required fields", () => {
    for (const insight of insights) {
      expect(insight.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(new Date(insight.publishedAt).getTime())).toBe(false);
      expect([insight.title, insight.excerpt, insight.category, insight.cover.alt].every(filled)).toBe(true);
      expect(insight.readingMinutes).toBeGreaterThan(0);
    }
  });

  it("testimonials and process steps have unique ids and required fields", () => {
    expect(unique(testimonials.map((t) => t.id))).toBe(true);
    expect(unique(processSteps.map((s) => s.id))).toBe(true);
    for (const t of testimonials) expect([t.quote, t.author, t.role, t.company].every(filled)).toBe(true);
    for (const s of processSteps) expect([s.title, s.description].every(filled)).toBe(true);
  });
});
