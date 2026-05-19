import type { Metadata } from "next";
import WooStory from "@/components/projects/woocommerce-stores/WooStory";

export const metadata: Metadata = {
  title: "Local Business Stores — WooCommerce + DNI/NIE Plugin",
  description:
    "End-to-end WooCommerce builds — Botiga theming, technical SEO, blog stack and a custom WordPress plugin for DNI/NIE verification on restricted products. GDPR-safe.",
  openGraph: {
    title: "Local Business Stores — WooCommerce + DNI/NIE Plugin",
    description:
      "WooCommerce stores from zero to production: theme, SEO, blog and a custom GDPR-compliant DNI/NIE verification plugin.",
    type: "website",
  },
};

export default function WooStorePage() {
  return <WooStory />;
}
