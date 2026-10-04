import Image from "next/image";

import type { ClientLogo } from "@/types/domain/testimonial";

/** Real logo when supplied (rendered monochrome); otherwise a neutral geometric placeholder mark. */
export function ClientMark({ client }: { client: ClientLogo }) {
  if (client.logo) {
    return <Image src={client.logo} alt={client.name} width={160} height={48} className="tm__logo-img" />;
  }

  const n = Number(client.id.replace(/\D/g, "")) % 4;
  return (
    <>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="tm__logo-mark"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
      >
        {n === 0 && <circle cx="12" cy="12" r="8" />}
        {n === 1 && <rect x="4" y="4" width="16" height="16" />}
        {n === 2 && <path d="M12 3 21 20H3Z" />}
        {n === 3 && <path d="M4 12h16M12 4v16" />}
      </svg>
      <span>{client.name}</span>
    </>
  );
}
