import { Home } from "@/features/home";

import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({ path: "/" });

export default function HomePage() {
  return <Home />;
}
