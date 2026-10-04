import { EB_Garamond } from "next/font/google";

/** Editorial serif scoped to the Selected Work section only; global typography tokens are untouched. */
export const editorialSerif = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-editorial-serif",
});
