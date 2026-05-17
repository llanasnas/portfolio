"use client";

import { useRouter } from "next/navigation";
import HeroComponent from "@/components/heroSection/HeroComponent";

export default function Home() {
  const router = useRouter();
  return <HeroComponent onEnterArchive={() => router.push("/cv")} />;
}
