import type { Metadata } from "next";
import { ContactSection } from "@/components/home_page/contact";

export const metadata: Metadata = {
  title: "Contact — Gerard Llanas Conesa",
  description:
    "Get in touch with Gerard Llanas Conesa for freelance projects, job opportunities or just to say hello.",
};

export default function ContactPage() {
  return (
    <main style={{ background: "var(--bg-0)", minHeight: "100vh" }}>
      <ContactSection />
    </main>
  );
}
