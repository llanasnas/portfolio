import type { Metadata } from "next";
import MerakiStory from "@/components/projects/meraki/MerakiStory";

export const metadata: Metadata = {
  title: "Meraki Marketplace — MERN Multi-Shop Platform",
  description:
    "Meraki Marketplace — final master's project. A MERN multi-shop marketplace with seller dashboards, real-time chat, live shipment tracking on Mapbox, analytics and full checkout flow.",
  openGraph: {
    title: "Meraki Marketplace — MERN Multi-Shop Platform",
    description:
      "Multi-shop marketplace built in MongoDB · Express · React · Node. Real-time chat, Socket.IO shipment tracking, seller analytics.",
    type: "website",
  },
};

export default function MerakiPage() {
  return <MerakiStory />;
}
