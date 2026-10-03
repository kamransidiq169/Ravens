import { InsightsIndex, getInsights } from "@/features/insights";

import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Insights",
  description: "Short, practical writing on design, engineering and motion from the Ravens studio.",
  path: "/insights",
});

export default async function InsightsPage() {
  return <InsightsIndex insights={await getInsights()} />;
}
