import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { RavensLogo } from "@/components/brand/RavensLogo";
import { Button } from "@/components/ui/Button";
import { Link } from "@/components/ui/Link";

describe("Button", () => {
  it("renders a button that fires onClick and is keyboard-activatable", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Send</Button>);

    const button = screen.getByRole("button", { name: "Send" });
    expect(button).toHaveAttribute("type", "button");
    await user.tab();
    expect(button).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders a link when given an href, with a decorative arrow", () => {
    render(
      <Button href="/work/northlight" arrow>
        View project
      </Button>,
    );
    const link = screen.getByRole("link", { name: /View project/ });
    expect(link).toHaveAttribute("href", "/work/northlight");
    expect(screen.getByText("→")).toHaveAttribute("aria-hidden", "true");
  });

  it("does not fire when disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Nope
      </Button>,
    );
    await userEvent.setup().click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("Link", () => {
  it("renders internal links without target", () => {
    render(<Link href="/about">About</Link>);
    const link = screen.getByRole("link", { name: "About" });
    expect(link).toHaveAttribute("href", "/about");
    expect(link).not.toHaveAttribute("target");
  });

  it("opens external http links safely in a new tab", () => {
    render(<Link href="https://example.com">Out</Link>);
    const link = screen.getByRole("link", { name: "Out" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("leaves mailto links in the same tab", () => {
    render(<Link href="mailto:hello@ravens.studio">Mail</Link>);
    expect(screen.getByRole("link", { name: "Mail" })).not.toHaveAttribute("target");
  });
});

describe("RavensLogo", () => {
  it("exposes an accessible name and draws six letters", () => {
    const { container } = render(<RavensLogo />);
    expect(screen.getByRole("img", { name: "Ravens" })).toBeInTheDocument();
    expect(container.querySelectorAll("path")).toHaveLength(6);
  });

  it("draws the A as a crossbar-less Λ (single polyline, no horizontal segment)", () => {
    const { container } = render(<RavensLogo />);
    const lambda = container.querySelectorAll("path")[1]?.getAttribute("d") ?? "";
    expect(lambda).not.toMatch(/[HhVv]/);
    expect(lambda.match(/[ML]/gi)).toHaveLength(3);
  });

  it("respects a custom title", () => {
    render(<RavensLogo title="Ravens home" />);
    expect(screen.getByRole("img", { name: "Ravens home" })).toBeInTheDocument();
  });
});
