import type { Metadata } from "next";
import TravelAgencyStory from "@/components/projects/travel-agency/TravelAgencyStory";

export const metadata: Metadata = {
  title: "Travel Agency — Custom CMS Platform",
  description:
    "Custom travel-agency platform with a bespoke mini-CMS: countries, itineraries, optimized gallery with lightbox, editable FAQs and home content — SEO-safe.",
  openGraph: {
    title: "Travel Agency — Custom CMS Platform",
    description:
      "Freelance build. Custom backoffice for countries, itineraries, gallery and dynamic content.",
    type: "website",
  },
};

export default function TravelAgencyPage() {
  return <TravelAgencyStory />;
}
